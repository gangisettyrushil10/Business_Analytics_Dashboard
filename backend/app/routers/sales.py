from fastapi import APIRouter, Query, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, date
from typing import Optional, List
import pandas as pd
import io
from app.database import get_db
from app.models import Sale, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/search")
async def search_sales(
    category: Optional[str] = Query(None, description="Filter by category (exact match)"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    date: Optional[str] = Query(None, description="Filter by specific date (YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    min_amount: Optional[float] = Query(None, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, description="Maximum amount"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    search and filter sales with pagination
    supports filtering by date, category, customer, and amount ranges
    """
    query = db.query(Sale)
    
    # build up filters based on query params
    filters = []
    
    # exact category match (for drill-down)
    if category:
        filters.append(Sale.category == category)
    
    if customer_id:
        filters.append(Sale.customerID == customer_id)
    
    # single date filter (for drill-down from chart)
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            filters.append(Sale.date == target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid date format. use YYYY-MM-DD")
    
    # date range filters
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            filters.append(Sale.date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid start_date format. use YYYY-MM-DD")
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            filters.append(Sale.date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid end_date format. use YYYY-MM-DD")
    
    if min_amount is not None:
        filters.append(Sale.amount >= min_amount)
    
    if max_amount is not None:
        filters.append(Sale.amount <= max_amount)
    
    # apply all the filters we built up
    if filters:
        query = query.filter(and_(*filters))
    
    # get total count before pagination
    total_count = query.count()
    
    # apply pagination and order by date descending
    sales = query.order_by(Sale.date.desc()).offset(offset).limit(limit).all()
    
    # format results as list of dicts
    results = [
        {
            "id": sale.id,
            "date": str(sale.date),
            "amount": sale.amount,
            "category": sale.category,
            "customerID": sale.customerID
        }
        for sale in sales
    ]
    
    return {
        "results": results,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total_count
    }


@router.get("/export")
async def export_sales(
    category: Optional[str] = Query(None, description="Filter by category"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    export filtered sales as csv file download
    """
    query = db.query(Sale)
    
    # same filter logic as search endpoint
    filters = []
    
    if category:
        filters.append(Sale.category.ilike(f"%{category}%"))
    
    if customer_id:
        filters.append(Sale.customerID == customer_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            filters.append(Sale.date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid start_date format. use YYYY-MM-DD")
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            filters.append(Sale.date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="invalid end_date format. use YYYY-MM-DD")
    
    if filters:
        query = query.filter(and_(*filters))
    
    sales = query.order_by(Sale.date.desc()).all()
    
    if not sales:
        raise HTTPException(status_code=404, detail="no sales found matching the criteria")
    
    # convert to dataframe
    data = [
        {
            "id": sale.id,
            "date": str(sale.date),
            "amount": sale.amount,
            "category": sale.category,
            "customerID": sale.customerID
        }
        for sale in sales
    ]
    
    df = pd.DataFrame(data)
    
    # create csv in memory
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)
    
    # generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sales_export_{timestamp}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

