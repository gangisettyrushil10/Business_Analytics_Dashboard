import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# try to import openai, handle gracefully if not available
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("openai library not installed. ai insights will not work.")


def generate_insights(
    revenue_data: List[Dict],
    categories_data: List[Dict],
    top_customers: List[Dict],
    period: str = "30 days"
) -> str:
    """
    generate ai insights from business data using openai api
    returns summary text with key insights and recommendations
    """
    if not OPENAI_AVAILABLE:
        raise ValueError("openai library not installed")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")
    
    # calculate some basic stats for the prompt
    total_revenue = sum(item.get("revenue", 0) for item in revenue_data) if revenue_data else 0
    avg_daily_revenue = total_revenue / len(revenue_data) if revenue_data else 0
    
    top_category = categories_data[0] if categories_data else None
    top_category_name = top_category.get("category", "N/A") if top_category else "N/A"
    top_category_percentage = top_category.get("percentage", 0) if top_category else 0
    
    top_customer = top_customers[0] if top_customers else None
    top_customer_id = top_customer.get("customerID", "N/A") if top_customer else "N/A"
    top_customer_spent = top_customer.get("total_spent", 0) if top_customer else 0
    
    # construct prompt
    prompt = f"""You are a business analyst reviewing sales data for the past {period}. 

Key Metrics:
- Total Revenue: ${total_revenue:,.2f}
- Average Daily Revenue: ${avg_daily_revenue:,.2f}
- Top Category: {top_category_name} ({top_category_percentage}% of revenue)
- Top Customer: Customer #{top_customer_id} (${top_customer_spent:,.2f} total)

Revenue Trends:
{format_revenue_data(revenue_data[:10])}

Category Breakdown:
{format_categories_data(categories_data)}

Top Customers:
{format_customers_data(top_customers[:5])}

Please provide:
1. A brief summary of key trends
2. Notable patterns or anomalies
3. Actionable recommendations for improving sales
4. Customer insights

Keep the response concise (2-3 paragraphs) and focused on business value."""

    try:
        # initialize openai client
        # supports both openai api and openai-compatible apis (like local llm servers)
        api_base = os.getenv("OPENAI_API_BASE")  # optional, for openai-compatible apis
        if api_base:
            client = openai.OpenAI(api_key=api_key, base_url=api_base)
        else:
            client = openai.OpenAI(api_key=api_key)
        
        # call openai api
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": "You are a helpful business analyst that provides clear, actionable insights from sales data."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        insights = response.choices[0].message.content.strip()
        return insights
        
    except Exception as e:
        error_msg = str(e).lower()
        logger.error(f"error generating ai insights: {str(e)}")
        
        # Handle specific OpenAI API errors
        if "quota" in error_msg or "rate limit" in error_msg or "billing" in error_msg:
            raise ValueError("OpenAI API quota exceeded. Please check your API billing or try again later.")
        elif "api key" in error_msg or "authentication" in error_msg:
            raise ValueError("OpenAI API key is invalid or not configured. Please check your API key.")
        elif "insufficient" in error_msg or "balance" in error_msg:
            raise ValueError("Insufficient OpenAI API credits. Please add credits to your account.")
        else:
            raise ValueError(f"Failed to generate insights: {str(e)}")


def format_revenue_data(revenue_data: List[Dict]) -> str:
    """format revenue data for prompt"""
    if not revenue_data:
        return "No revenue data available"
    
    lines = []
    for item in revenue_data[:10]:  # limit to first 10 days
        date = item.get("date", "N/A")
        revenue = item.get("revenue", 0)
        lines.append(f"- {date}: ${revenue:,.2f}")
    
    return "\n".join(lines)


def format_categories_data(categories_data: List[Dict]) -> str:
    """format category data for prompt"""
    if not categories_data:
        return "No category data available"
    
    lines = []
    for item in categories_data:
        category = item.get("category", "N/A")
        total = item.get("total", 0)
        percentage = item.get("percentage", 0)
        lines.append(f"- {category}: ${total:,.2f} ({percentage}%)")
    
    return "\n".join(lines)


def format_customers_data(customers_data: List[Dict]) -> str:
    """format customer data for prompt"""
    if not customers_data:
        return "No customer data available"
    
    lines = []
    for item in customers_data[:5]:  # limit to top 5
        customer_id = item.get("customerID", "N/A")
        total_spent = item.get("total_spent", 0)
        transactions = item.get("transaction_count", 0)
        lines.append(f"- Customer #{customer_id}: ${total_spent:,.2f} ({transactions} transactions)")
    
    return "\n".join(lines)

