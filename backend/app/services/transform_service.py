from typing import Dict, List, Optional
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def apply_transformations(
    df: pd.DataFrame,
    rename_columns: Optional[Dict[str, str]] = None,
    map_categories: Optional[Dict[str, str]] = None,
    computed_fields: Optional[Dict[str, str]] = None
) -> pd.DataFrame:
    """
    apply etl transformations to dataframe
    returns transformed dataframe
    """
    result_df = df.copy()
    
    # rename columns
    if rename_columns:
        for old_name, new_name in rename_columns.items():
            if old_name in result_df.columns:
                result_df = result_df.rename(columns={old_name: new_name})
                logger.info(f"renamed column '{old_name}' to '{new_name}'")
    
    # map category values
    if map_categories and 'category' in result_df.columns:
        for old_value, new_value in map_categories.items():
            result_df['category'] = result_df['category'].replace(old_value, new_value)
            logger.info(f"mapped category '{old_value}' to '{new_value}'")
    
    # add computed fields using pandas.eval (safe mode)
    if computed_fields:
        for field_name, formula in computed_fields.items():
            try:
                # use pandas.eval in safe mode - only allows arithmetic operations
                # this prevents code injection attacks
                # create a local namespace with column names as variables
                local_dict = {col: result_df[col] for col in result_df.columns}
                result_df[field_name] = pd.eval(formula, local_dict=local_dict)
                logger.info(f"added computed field '{field_name}' with formula: {formula}")
            except Exception as e:
                logger.error(f"error computing field '{field_name}': {str(e)}")
                # add column with NaN values if computation fails
                result_df[field_name] = None
    
    return result_df


def preview_transformations(
    df: pd.DataFrame,
    rename_columns: Optional[Dict[str, str]] = None,
    map_categories: Optional[Dict[str, str]] = None,
    computed_fields: Optional[Dict[str, str]] = None,
    preview_rows: int = 20
) -> Dict:
    """
    apply transformations and return preview of first N rows
    returns dict with preview data and metadata
    """
    try:
        transformed_df = apply_transformations(
            df,
            rename_columns=rename_columns,
            map_categories=map_categories,
            computed_fields=computed_fields
        )
        
        # get preview rows
        preview_df = transformed_df.head(preview_rows)
        
        # convert to list of dicts for json response
        preview_data = preview_df.to_dict('records')
        
        # convert numpy types to python native types for json serialization
        for row in preview_data:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
                elif isinstance(value, (pd.Timestamp, pd.DatetimeIndex)):
                    row[key] = str(value)
                elif hasattr(value, 'item'):  # numpy scalar
                    row[key] = value.item()
        
        return {
            "preview": preview_data,
            "total_rows": len(transformed_df),
            "preview_rows": len(preview_df),
            "columns": list(transformed_df.columns),
            "success": True
        }
    except Exception as e:
        logger.error(f"transformation preview failed: {str(e)}")
        return {
            "preview": [],
            "total_rows": 0,
            "preview_rows": 0,
            "columns": [],
            "success": False,
            "error": str(e)
        }

