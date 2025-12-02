from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
import pandas as pd
import json
from typing import Optional
from app.database import get_db
from app.services import transform_service
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/transform", tags=["transform"])


@router.post("/preview")
async def preview_transform(
    file: UploadFile = File(...),
    rename_columns: Optional[str] = Form(None, description="JSON object mapping old column names to new names"),
    map_categories: Optional[str] = Form(None, description="JSON object mapping old category values to new values"),
    computed_fields: Optional[str] = Form(None, description="JSON object mapping field names to formulas"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    preview transformations on csv data
    returns first 20 rows of transformed data
    """
    
    # validate file is csv
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="file must be a csv file")
    
    # read csv into dataframe
    try:
        df = pd.read_csv(file.file)
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="csv file is empty")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"error parsing csv: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"error reading csv: {str(e)}")
    
    if df.empty:
        raise HTTPException(status_code=400, detail="csv file contains no data rows")
    
    # parse transform rules from json strings
    rename_dict = None
    if rename_columns:
        try:
            rename_dict = json.loads(rename_columns)
            if not isinstance(rename_dict, dict):
                raise ValueError("rename_columns must be a json object")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="invalid json in rename_columns")
    
    map_categories_dict = None
    if map_categories:
        try:
            map_categories_dict = json.loads(map_categories)
            if not isinstance(map_categories_dict, dict):
                raise ValueError("map_categories must be a json object")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="invalid json in map_categories")
    
    computed_fields_dict = None
    if computed_fields:
        try:
            computed_fields_dict = json.loads(computed_fields)
            if not isinstance(computed_fields_dict, dict):
                raise ValueError("computed_fields must be a json object")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="invalid json in computed_fields")
    
    # apply transformations and get preview
    result = transform_service.preview_transformations(
        df,
        rename_columns=rename_dict,
        map_categories=map_categories_dict,
        computed_fields=computed_fields_dict,
        preview_rows=20
    )
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("error", "transformation failed")
        )
    
    return result

