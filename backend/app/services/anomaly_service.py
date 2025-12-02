from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models import Sale
from app.services import sales_service
import numpy as np
from sklearn.ensemble import IsolationForest
import logging

logger = logging.getLogger(__name__)


def detect_anomalies(range_days: int, db: Session):
    """
    detect anomalies in daily revenue using isolation forest
    returns dates, revenue values, and list of detected anomalies with scores
    """
    # get historical revenue data
    revenue_data = sales_service.get_revenue(range_days, db)
    
    if not revenue_data or len(revenue_data) < 7:
        raise ValueError("insufficient data for anomaly detection (need at least 7 days)")
    
    # extract dates and revenue values
    dates = [item["date"] for item in revenue_data]
    revenue_values = [item["revenue"] for item in revenue_data]
    
    # convert to numpy array for sklearn
    # reshape to 2D array (required by sklearn)
    revenue_array = np.array(revenue_values).reshape(-1, 1)
    
    # fit isolation forest model
    # contamination=0.1 means we expect ~10% of data to be anomalies
    # random_state for reproducibility
    model = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )
    
    # fit and predict
    # returns -1 for anomalies, 1 for normal points
    anomaly_labels = model.fit_predict(revenue_array)
    
    # get anomaly scores (lower = more anomalous)
    anomaly_scores = model.score_samples(revenue_array)
    
    # find anomalies (where label is -1)
    anomalies = []
    for i, label in enumerate(anomaly_labels):
        if label == -1:  # anomaly detected
            anomalies.append({
                "date": dates[i],
                "value": float(revenue_values[i]),
                "score": float(anomaly_scores[i])
            })
    
    # sort anomalies by score (most anomalous first)
    anomalies.sort(key=lambda x: x["score"])
    
    return {
        "dates": dates,
        "revenue": revenue_values,
        "anomalies": anomalies
    }

