from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.routers.auth import get_current_user
from app.models import User
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


class InsightsRequest(BaseModel):
    revenue: List[Dict]
    categories: List[Dict]
    top_customers: List[Dict]
    period: str = "30 days"


@router.post("/insights")
async def generate_insights(
    request: InsightsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    generate ai-powered business insights from dashboard data
    requires openai api key to be set in environment variables
    """
    try:
        insights = ai_service.generate_insights(
            revenue_data=request.revenue,
            categories_data=request.categories,
            top_customers=request.top_customers,
            period=request.period
        )
        
        return {
            "insights": insights,
            "success": True
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error generating insights: {str(e)}")

