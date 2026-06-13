from sqlalchemy import Column, Integer, String, Double, DateTime, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.core.database import Base

class PowerGeneration(Base):
    __tablename__ = "power_generation"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)  # 0 indicates annual statistics, 1-12 monthly
    energy_type = Column(String(50), nullable=False)
    generation_gwh = Column(Double, nullable=False)
    percentage = Column(Double, nullable=False)
    source_name = Column(String(100), default="經濟部能源署")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_generation_year_month", "year", "month"),
        Index("idx_generation_energy", "energy_type"),
        UniqueConstraint("year", "month", "energy_type", name="uq_year_month_energy"),
    )

class PowerConsumptionByIndustry(Base):
    __tablename__ = "power_consumption_by_industry"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)  # 0 indicates annual, 1-12 monthly
    industry = Column(String(100), nullable=False)
    consumption_gwh = Column(Double, nullable=False)
    percentage = Column(Double, nullable=False)
    source_name = Column(String(100), default="經濟部能源署")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_consumption_year_month", "year", "month"),
        Index("idx_consumption_industry", "industry"),
        UniqueConstraint("year", "month", "industry", name="uq_year_month_industry"),
    )

class PowerDemandSummary(Base):
    __tablename__ = "power_demand_summary"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Double, nullable=False)
    unit = Column(String(20), nullable=False)
    source_name = Column(String(100), default="經濟部能源署")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_demand_year_month", "year", "month"),
        UniqueConstraint("year", "month", "metric_name", name="uq_year_month_metric"),
    )
