from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from app.models import Sale
import pandas as pd


def insert_sales(sales_list: List[dict], db: Session) -> int:
    """
    takes a list of sale dicts and inserts them into the database
    validates each row and skips invalid ones, returns count of successfully inserted rows
    """
    sale_objects = []
    errors = []
    
    for idx, sale_data in enumerate(sales_list, start=1):
        try:
            # parse date - handle strings, datetime objects, pandas timestamps
            sale_date = sale_data["date"]
            if isinstance(sale_date, str):
                try:
                    sale_date = pd.to_datetime(sale_date).date()
                except:
                    try:
                        sale_date = datetime.strptime(sale_date, "%Y-%m-%d").date()
                    except ValueError:
                        errors.append(f"row {idx}: invalid date format '{sale_date}'")
                        continue
            elif isinstance(sale_date, datetime):
                sale_date = sale_date.date()
            elif isinstance(sale_date, pd.Timestamp):
                sale_date = sale_date.date()
            else:
                errors.append(f"row {idx}: invalid date type")
                continue
            
            # validate amount is a positive number
            try:
                amount = float(sale_data["amount"])
                if amount < 0:
                    errors.append(f"row {idx}: amount cannot be negative")
                    continue
            except (ValueError, TypeError):
                errors.append(f"row {idx}: invalid amount '{sale_data.get('amount')}'")
                continue
            
            # validate category isn't empty
            category = str(sale_data["category"]).strip()
            if not category:
                errors.append(f"row {idx}: category cannot be empty")
                continue
            
            # validate customerID is a positive integer
            try:
                customerID = int(sale_data["customerID"])
                if customerID <= 0:
                    errors.append(f"row {idx}: customerID must be positive")
                    continue
            except (ValueError, TypeError):
                errors.append(f"row {idx}: invalid customerID '{sale_data.get('customerID')}'")
                continue
            
            sale = Sale(
                date=sale_date,
                amount=amount,
                category=category,
                customerID=customerID
            )
            sale_objects.append(sale)
        except KeyError as e:
            errors.append(f"row {idx}: missing required field {str(e)}")
            continue
        except Exception as e:
            errors.append(f"row {idx}: {str(e)}")
            continue
    
    # if all rows were bad, raise an error
    if errors and not sale_objects:
        raise ValueError(f"all rows had errors: {'; '.join(errors[:5])}")
    
    # log warnings if some rows were skipped but we have valid ones
    if errors:
        import logging
        logging.warning(f"skipped {len(errors)} invalid rows: {'; '.join(errors[:5])}")
    
    # bulk insert all the valid sale objects
    db.add_all(sale_objects)
    db.commit()
    
    # refresh to get the database-assigned IDs
    for sale in sale_objects:
        db.refresh(sale)
    
    return len(sale_objects)


def get_revenue(range_days: int, db: Session):
    """
    get daily revenue totals for the last N days
    returns list of {date, revenue} dicts
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=range_days)
    
    # query sales in date range, group by date, sum amounts per day
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
    
    # format as list of dicts for json response
    revenue_data = [
        {
            "date": str(result.date),
            "revenue": float(result.revenue)
        }
        for result in results
    ]
    
    return revenue_data


def get_sales_by_category(db: Session):
    """
    get sales broken down by category with totals and percentages
    """
    # group by category and sum up the amounts
    results = db.query(
        Sale.category,
        func.sum(Sale.amount).label('total')
    ).group_by(
        Sale.category
    ).all()
    
    # calculate total across all categories for percentage math
    total_revenue = sum(result.total for result in results)
    
    # build the response with totals and percentages
    category_data = []
    for result in results:
        percentage = (result.total / total_revenue * 100) if total_revenue > 0 else 0
        category_data.append({
            "category": result.category,
            "total": float(result.total),
            "percentage": round(percentage, 2)
        })
    
    # sort by total descending so highest revenue categories show first
    category_data.sort(key=lambda x: x["total"], reverse=True)
    
    return {
        "categories": category_data,
        "total_revenue": float(total_revenue)
    }


def get_customer_stats(db: Session):
    """
    get customer stats - total customers, avg spending, top 5 customers
    """
    # group by customer and calculate total spent and transaction count
    results = db.query(
        Sale.customerID,
        func.sum(Sale.amount).label('total_spent'),
        func.count(Sale.id).label('transaction_count')
    ).group_by(
        Sale.customerID
    ).all()
    
    # convert to list of dicts
    customer_data = [
        {
            "customerID": result.customerID,
            "total_spent": float(result.total_spent),
            "transaction_count": result.transaction_count
        }
        for result in results
    ]
    
    # sort by total_spent to get top customers first
    customer_data.sort(key=lambda x: x["total_spent"], reverse=True)
    
    # calculate aggregate stats
    total_customers = len(customer_data)
    total_revenue = sum(c["total_spent"] for c in customer_data)
    avg_spent_per_customer = total_revenue / total_customers if total_customers > 0 else 0
    
    # grab top 5 customers
    top_customers = customer_data[:5]
    
    return {
        "total_customers": total_customers,
        "total_revenue": float(total_revenue),
        "avg_spent_per_customer": round(float(avg_spent_per_customer), 2),
        "top_customers": top_customers
    }