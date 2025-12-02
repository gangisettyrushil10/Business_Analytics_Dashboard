from sqlalchemy import Column, Integer, Float, String, Date, Index, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from app.database import engine

Base = declarative_base()


class Sale(Base):
    """
    single sale transaction in the database
    """
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True)
    customerID = Column(Integer, nullable=False)
    
    # indexes on date and category since we query by those a lot
    __table_args__ = (
        Index('idx_date', 'date'),
        Index('idx_category', 'category'),
    )


class User(Base):
    """
    user account in the database
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


def create_tables():
    Base.metadata.create_all(bind=engine)