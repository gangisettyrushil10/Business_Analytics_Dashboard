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
    
    # initialize prophet model with improved parameters for accuracy
    # prophet works best with daily data and handles seasonality automatically
    try:
        # Determine if we have enough data for yearly seasonality
        data_days = len(historical_data)
        has_yearly = data_days >= 365  # Need at least a year for yearly seasonality
        
        # Remove zero-revenue days for trend calculation (they're just missing data)
        non_zero_data = historical_data[historical_data['y'] > 0].copy()
        
        if len(non_zero_data) < 7:
            # If we don't have enough non-zero data, use all data
            non_zero_data = historical_data.copy()
        
        # Calculate growth trend more conservatively
        # Use median instead of mean to reduce impact of outliers
        if len(non_zero_data) >= 14:
            # Compare first half vs second half (more stable than head/tail)
            mid_point = len(non_zero_data) // 2
            early_median = non_zero_data.head(mid_point)['y'].median()
            recent_median = non_zero_data.tail(mid_point)['y'].median()
        else:
            # For very short datasets, compare first 30% vs last 30%
            early_size = max(1, int(len(non_zero_data) * 0.3))
            recent_size = max(1, int(len(non_zero_data) * 0.3))
            early_median = non_zero_data.head(early_size)['y'].median()
            recent_median = non_zero_data.tail(recent_size)['y'].median()
        
        growth_rate = (recent_median - early_median) / max(early_median, 1) if early_median > 0 else 0
        
        # For short datasets (< 30 days), use flat growth to avoid misleading trends
        # Only use linear growth if we have enough data AND a clear, sustained trend
        if data_days < 30:
            # Short dataset: use flat growth (mean-reverting)
            growth = 'linear'
            # Cap the growth to prevent extreme extrapolation
            changepoint_scale = 0.01  # Very conservative for short data
            seasonality_scale = 5.0   # Less seasonality for short data
        elif abs(growth_rate) > 0.2 and data_days >= 30:
            # Clear trend with enough data: use linear growth
            growth = 'linear'
            changepoint_scale = 0.05
            seasonality_scale = 10.0
        else:
            # No clear trend or insufficient data: use flat growth
            growth = 'linear'
            changepoint_scale = 0.01  # Conservative
            seasonality_scale = 5.0
        
        # For very short datasets, disable daily seasonality (not meaningful)
        use_daily_seasonality = data_days >= 14
        
        model = Prophet(
            daily_seasonality=use_daily_seasonality,
            weekly_seasonality=True if data_days >= 7 else False,
            yearly_seasonality=has_yearly,
            growth=growth,
            changepoint_prior_scale=changepoint_scale,  # More conservative for short data
            seasonality_prior_scale=seasonality_scale,
            interval_width=0.95,  # 95% confidence interval
            mcmc_samples=0,  # Use MAP estimation (faster, good for most cases)
            uncertainty_samples=1000  # More samples for better confidence intervals
        )
        
        # fit the model
        model.fit(historical_data)
    except AttributeError as e:
        if 'stan_backend' in str(e):
            logger.error("Prophet stan_backend error - cmdstanpy may need reinstallation")
            raise ValueError("Forecasting service configuration error. Please ensure cmdstanpy is properly installed.")
        raise ValueError(f"forecasting model initialization failed: {str(e)}")
    except Exception as e:
        logger.error(f"prophet model fitting failed: {str(e)}")
        raise ValueError(f"forecasting model failed: {str(e)}")
    
    # create future dataframe for the forecast period
    future = model.make_future_dataframe(periods=period_days)
    
    # generate forecast
    forecast = model.predict(future)
    
    # extract only the future predictions (last N days)
    future_forecast = forecast.tail(period_days).copy()
    
    # For short datasets, apply conservative adjustments to prevent misleading trends
    if data_days < 30:
        # Use recent average as baseline instead of extrapolating trend
        recent_avg = historical_data.tail(min(7, len(historical_data)))['y'].mean()
        recent_std = historical_data.tail(min(7, len(historical_data)))['y'].std()
        
        # Cap predictions to be within reasonable range of recent average
        # Allow some variation but don't extrapolate extreme trends
        max_reasonable = recent_avg * 2.5  # Don't predict more than 2.5x recent average
        min_reasonable = max(0, recent_avg * 0.3)  # Don't predict less than 30% of recent average
        
        # Adjust predictions to be more conservative
        adjusted_predicted = []
        adjusted_lower = []
        adjusted_upper = []
        
        for idx in range(len(future_forecast)):
            predicted = future_forecast.iloc[idx]['yhat']
            upper = future_forecast.iloc[idx]['yhat_upper']
            lower = future_forecast.iloc[idx]['yhat_lower']
            
            # If prediction is way outside reasonable range, adjust toward recent average
            if predicted > max_reasonable:
                # Scale down extreme predictions
                adjusted_pred = recent_avg + (predicted - recent_avg) * 0.5
            elif predicted < min_reasonable:
                # Scale up very low predictions
                adjusted_pred = recent_avg - (recent_avg - predicted) * 0.5
            else:
                adjusted_pred = predicted
            
            # Also adjust confidence intervals
            adjusted_upper_val = min(upper, max_reasonable * 1.5)
            adjusted_lower_val = max(lower, min_reasonable * 0.5)
            
            adjusted_predicted.append(adjusted_pred)
            adjusted_lower.append(adjusted_lower_val)
            adjusted_upper.append(adjusted_upper_val)
        
        # Update the dataframe
        future_forecast['yhat'] = adjusted_predicted
        future_forecast['yhat_lower'] = adjusted_lower
        future_forecast['yhat_upper'] = adjusted_upper
    
    # format response
    result = {
        "dates": [d.strftime("%Y-%m-%d") for d in future_forecast['ds']],
        "predicted": [float(x) for x in future_forecast['yhat']],
        "lower": [float(x) for x in future_forecast['yhat_lower']],
        "upper": [float(x) for x in future_forecast['yhat_upper']]
    }
    
    return result

