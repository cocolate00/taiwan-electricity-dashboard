from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.models.power import PowerGeneration, PowerConsumptionByIndustry
from app.schemas.chart import PowerGenerationListResponse, PowerConsumptionListResponse, PowerConsumptionHistoryResponse

router = APIRouter(prefix="/charts", tags=["charts"])

@router.get("/generation", response_model=PowerGenerationListResponse)
def get_power_generation(
    start_year: Optional[int] = Query(None, description="Start year filter"),
    end_year: Optional[int] = Query(None, description="End year filter"),
    db: Session = Depends(get_db)
):
    query = db.query(PowerGeneration)
    if start_year is not None:
        query = query.filter(PowerGeneration.year >= start_year)
    if end_year is not None:
        query = query.filter(PowerGeneration.year <= end_year)
    
    # Sort chronologically and by energy type
    results = query.order_by(
        PowerGeneration.year.asc(),
        PowerGeneration.month.asc(),
        PowerGeneration.energy_type.asc()
    ).all()
    
    return {"data": results}

@router.get("/industry-consumption", response_model=PowerConsumptionListResponse)
def get_industry_consumption(
    year: int = Query(..., description="Query year"),
    month: Optional[int] = Query(0, description="Query month (0 for annual summary)"),
    db: Session = Depends(get_db)
):
    if year == 2026 and month == 0:
        # 2026年全年度尚未過完，動態累加有數據的月份
        monthly_records = db.query(PowerConsumptionByIndustry).filter(
            PowerConsumptionByIndustry.year == 2026,
            PowerConsumptionByIndustry.month > 0
        ).all()
        
        if monthly_records:
            industry_map = {}
            for rec in monthly_records:
                ind = rec.industry
                if ind not in industry_map:
                    industry_map[ind] = 0.0
                industry_map[ind] += rec.consumption_gwh
            
            total_consumption = industry_map.get("total", 1.0)
            if total_consumption == 0.0:
                total_consumption = 1.0
                
            results = []
            for ind, val in industry_map.items():
                pct = (val / total_consumption) * 100.0 if ind != "total" else 100.0
                results.append(PowerConsumptionByIndustry(
                    year=year,
                    month=month,
                    industry=ind,
                    consumption_gwh=val,
                    percentage=pct,
                    source_name="經濟部能源署 (動態累計)"
                ))
            results.sort(key=lambda x: x.consumption_gwh, reverse=True)
            return {
                "year": year,
                "month": month,
                "data": results
            }

    results = db.query(PowerConsumptionByIndustry).filter_by(
        year=year,
        month=month
    ).order_by(
        PowerConsumptionByIndustry.consumption_gwh.desc()
    ).all()
    
    return {
        "year": year,
        "month": month,
        "data": results
    }

@router.get("/consumption-history", response_model=PowerConsumptionHistoryResponse)
def get_power_consumption_history(
    db: Session = Depends(get_db)
):
    results = db.query(PowerConsumptionByIndustry).order_by(
        PowerConsumptionByIndustry.year.asc(),
        PowerConsumptionByIndustry.month.asc()
    ).all()
    
    return {"data": results}
