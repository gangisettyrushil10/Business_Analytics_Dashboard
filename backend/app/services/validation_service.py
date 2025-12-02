from typing import List, Dict, Tuple
import pandas as pd
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def validate_csv_data(df: pd.DataFrame) -> Tuple[List[Dict], List[Dict]]:
    """
    validate csv data and return warnings and errors
    warnings: issues that don't block upload but should be noted
    errors: severe issues that should block upload
    returns: (warnings, errors)
    """
    warnings = []
    errors = []
    
    # check required columns exist
    required_columns = ['date', 'amount', 'category', 'customerID']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        errors.append({
            "type": "missing_columns",
            "message": f"missing required columns: {', '.join(missing_columns)}",
            "severity": "error"
        })
        return warnings, errors  # can't proceed without required columns
    
    # check for completely empty dataframe
    if df.empty:
        errors.append({
            "type": "empty_data",
            "message": "csv file contains no data rows",
            "severity": "error"
        })
        return warnings, errors
    
    total_rows = len(df)
    
    # check for missing values per column
    missing_counts = df[required_columns].isnull().sum()
    for col in required_columns:
        missing_count = missing_counts[col]
        if missing_count > 0:
            percentage = (missing_count / total_rows) * 100
            warnings.append({
                "type": "missing_values",
                "column": col,
                "count": int(missing_count),
                "percentage": round(percentage, 2),
                "message": f"column '{col}' has {missing_count} missing values ({percentage:.2f}%)",
                "severity": "warning"
            })
    
    # check for duplicate rows
    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        warnings.append({
            "type": "duplicates",
            "count": int(duplicate_count),
            "message": f"found {duplicate_count} duplicate rows",
            "severity": "warning"
        })
    
    # validate each row for type and range issues
    type_errors = []
    range_errors = []
    date_errors = []
    
    for idx, row in df.iterrows():
        row_num = idx + 1
        
        # check date parsing
        if pd.notna(row.get('date')):
            try:
                pd.to_datetime(row['date'])
            except (ValueError, TypeError):
                date_errors.append(row_num)
        
        # check amount type and range
        if pd.notna(row.get('amount')):
            try:
                amount = float(row['amount'])
                if amount < 0:
                    range_errors.append({
                        "row": row_num,
                        "value": amount,
                        "message": f"row {row_num}: negative amount value: {amount}"
                    })
            except (ValueError, TypeError):
                type_errors.append({
                    "row": row_num,
                    "value": str(row.get('amount')),
                    "column": "amount",
                    "message": f"row {row_num}: invalid amount type: '{row.get('amount')}'"
                })
        
        # check customerID type
        if pd.notna(row.get('customerID')):
            try:
                customer_id = int(row['customerID'])
                if customer_id <= 0:
                    range_errors.append({
                        "row": row_num,
                        "value": customer_id,
                        "message": f"row {row_num}: invalid customerID (must be positive): {customer_id}"
                    })
            except (ValueError, TypeError):
                type_errors.append({
                    "row": row_num,
                    "value": str(row.get('customerID')),
                    "column": "customerID",
                    "message": f"row {row_num}: invalid customerID type: '{row.get('customerID')}'"
                })
        
        # check category type
        if pd.notna(row.get('category')):
            category = str(row['category']).strip()
            if not category:
                type_errors.append({
                    "row": row_num,
                    "value": "",
                    "column": "category",
                    "message": f"row {row_num}: empty category value"
                })
    
    # aggregate type errors
    if type_errors:
        type_error_count = len(type_errors)
        type_error_percentage = (type_error_count / total_rows) * 100
        
        # if more than 50% of rows have type errors, treat as error
        if type_error_percentage > 50:
            errors.append({
                "type": "type_errors",
                "count": type_error_count,
                "percentage": round(type_error_percentage, 2),
                "message": f"found {type_error_count} rows with type errors ({type_error_percentage:.2f}% of data)",
                "severity": "error",
                "examples": type_errors[:5]  # show first 5 examples
            })
        else:
            warnings.append({
                "type": "type_errors",
                "count": type_error_count,
                "percentage": round(type_error_percentage, 2),
                "message": f"found {type_error_count} rows with type errors ({type_error_percentage:.2f}% of data)",
                "severity": "warning",
                "examples": type_errors[:5]
            })
    
    # aggregate range errors
    if range_errors:
        range_error_count = len(range_errors)
        range_error_percentage = (range_error_count / total_rows) * 100
        
        warnings.append({
            "type": "range_errors",
            "count": range_error_count,
            "percentage": round(range_error_percentage, 2),
            "message": f"found {range_error_count} rows with out-of-range values ({range_error_percentage:.2f}% of data)",
            "severity": "warning",
            "examples": range_errors[:5]
        })
    
    # aggregate date errors
    if date_errors:
        date_error_count = len(date_errors)
        date_error_percentage = (date_error_count / total_rows) * 100
        
        # if more than 30% of dates are invalid, treat as error
        if date_error_percentage > 30:
            errors.append({
                "type": "date_errors",
                "count": date_error_count,
                "percentage": round(date_error_percentage, 2),
                "message": f"found {date_error_count} rows with invalid date formats ({date_error_percentage:.2f}% of data)",
                "severity": "error",
                "examples": [{"row": row} for row in date_errors[:5]]
            })
        else:
            warnings.append({
                "type": "date_errors",
                "count": date_error_count,
                "percentage": round(date_error_percentage, 2),
                "message": f"found {date_error_count} rows with invalid date formats ({date_error_percentage:.2f}% of data)",
                "severity": "warning",
                "examples": [{"row": row} for row in date_errors[:5]]
            })
    
    return warnings, errors


def get_validation_summary(df: pd.DataFrame, warnings: List[Dict], errors: List[Dict]) -> Dict:
    """
    generate a summary of validation results
    """
    total_rows = len(df)
    valid_rows = total_rows
    
    # subtract rows with errors from valid count
    for error in errors:
        if 'count' in error:
            valid_rows -= error['count']
    
    return {
        "total_rows": total_rows,
        "valid_rows": max(0, valid_rows),
        "warning_count": len(warnings),
        "error_count": len(errors),
        "has_errors": len(errors) > 0,
        "has_warnings": len(warnings) > 0
    }

