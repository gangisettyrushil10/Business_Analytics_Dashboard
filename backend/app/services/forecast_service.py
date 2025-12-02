from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from app.models import Sale
import pandas as pd
from prophet import Prophet
import logging

logger = logging.getLogger(__name__)


def get_historical_revenue_data(db: Session, lookback_days: int = 365):
    """
    get historical daily revenue data for forecasting
    returns dataframe with ds (date) and y (revenue) columns for prophet
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=lookback_days)
    
    # query all sales in the date range, group by date
    results = db.query(
        Sale.date,
        func.sum(Sale.amount).label('revenue')
    ).filter(
        Sale.date >= start_date,
        Sale.date <= end_date
    ).group_by(
        Sale.date
    ).order_by(
        Sale.date
    ).all()
    
    # convert to dataframe
    data = []
    for result in results:
        data.append({
            'ds': result.date,
            'y': float(result.revenue)
        })
    
    if not data:
        return None
    
    df = pd.DataFrame(data)
    
    # ensure dates are datetime type
    df['ds'] = pd.to_datetime(df['ds'])
    
    # create continuous date range and fill missing dates with 0
    date_range = pd.date_range(start=df['ds'].min(), end=df['ds'].max(), freq='D')
    full_df = pd.DataFrame({'ds': date_range})
    full_df = full_df.merge(df, on='ds', how='left')
    full_df['y'] = full_df['y'].fillna(0)
    
    return full_df


def forecast_revenue(period_days: int, db: Session):
    """
    forecast revenue for the next N days using prophet
    returns dict with dates, predicted values, and confidence intervals
    """
    # get historical data (use last year)
    historical_data = get_historical_revenue_data(db, lookback_days=365)
    
    if historical_data is None or len(historical_data) < 7:
        raise ValueError("insufficient historical data for forecasting (need at least 7 days)")
    
    # initialize prophet model
    # prophet works best with daily data and handles seasonality automatically
    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=False,  # disable yearly if we have less than 2 years
        interval_width=0.95  # 95% confidence interval
    )
    
    # fit the model
    try:
        model.fit(historical_data)
    except Exception as e:
        logger.error(f"prophet model fitting failed: {str(e)}")
        raise ValueError(f"forecasting model failed: {str(e)}")
    
    # create future dataframe for the forecast period
    future = model.make_future_dataframe(periods=period_days)
    
    # generate forecast
    forecast = model.predict(future)
    
    # extract only the future predictions (last N days)
    future_forecast = forecast.tail(period_days).copy()
    
    # format response
    result = {
        "dates": [d.strftime("%Y-%m-%d") for d in future_forecast['ds']],
        "predicted": [float(x) for x in future_forecast['yhat']],
        "lower": [float(x) for x in future_forecast['yhat_lower']],
        "upper": [float(x) for x in future_forecast['yhat_upper']]
    }
    
    return result

