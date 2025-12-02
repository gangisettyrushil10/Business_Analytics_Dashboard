from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import sales_service, forecast_service, anomaly_service
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/revenue")
async def get_revenue(
    range_days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    get revenue stats for the last N days
    """
    revenue_data = sales_service.get_revenue(range_days, db)
    return {"data": revenue_data, "range_days": range_days}


@router.get("/by-category")
async def get_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    get sales broken down by category with totals and percentages
    """
    category_data = sales_service.get_sales_by_category(db)
    return category_data


@router.get("/customers")
async def get_customer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    get customer stats like total customers, avg spending, top customers
    """
    customer_stats = sales_service.get_customer_stats(db)
    return customer_stats


@router.get("/forecast")
async def get_forecast(
    period: int = Query(30, ge=7, le=90, description="Forecast period in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    forecast revenue for the next N days using prophet time-series model
    returns predicted values with 95% confidence intervals
    """
    try:
        forecast_data = forecast_service.forecast_revenue(period, db)
        return forecast_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"forecasting error: {str(e)}")


@router.get("/anomalies")
async def get_anomalies(
    range_days: int = Query(90, ge=7, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    detect anomalies in revenue trends using isolation forest
    returns dates, revenue values, and detected anomalies with scores
    """
    try:
        anomaly_data = anomaly_service.detect_anomalies(range_days, db)
        return anomaly_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"anomaly detection error: {str(e)}")