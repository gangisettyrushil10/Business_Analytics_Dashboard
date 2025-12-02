from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app.services import sales_service, validation_service
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    upload csv file and insert sales data into the database
    """
    
    # make sure it's actually a csv file
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="file must be a csv file")
    
    # check file size, limit to 10mb
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="file size exceeds 10mb limit")
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="file is empty")
    
    # read the csv into a dataframe
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
    
    # validate the data using validation service
    warnings, errors = validation_service.validate_csv_data(df)
    
    # if there are severe errors (missing columns, empty data, >50% type errors), block upload
    severe_error_types = ['missing_columns', 'empty_data']
    has_severe_errors = any(error.get('type') in severe_error_types for error in errors)
    
    if has_severe_errors:
        error_messages = [error.get('message', 'unknown error') for error in errors]
        raise HTTPException(
            status_code=400,
            detail=f"upload blocked due to severe data quality issues: {'; '.join(error_messages)}"
        )
    
    # drop rows with missing required data before insertion
    required_columns = ['date', 'amount', 'category', 'customerID']
    df_clean = df.dropna(subset=required_columns)
    
    if df_clean.empty:
        raise HTTPException(status_code=400, detail="no valid data rows after removing empty entries")
    
    # convert cleaned dataframe to list of dicts for the service layer
    sales_list = df_clean.to_dict('records')
    
    # insert into database
    try:
        count = sales_service.insert_sales(sales_list, db)
        
        # generate validation summary
        summary = validation_service.get_validation_summary(df, warnings, errors)
        
        return {
            "message": "csv uploaded successfully",
            "rows_inserted": count,
            "filename": file.filename,
            "warnings": warnings,
            "errors": errors,
            "summary": summary
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"error inserting data: {str(e)}"
        )