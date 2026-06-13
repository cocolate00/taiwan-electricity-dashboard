import os
import sys
import json
import re
from sqlalchemy.orm import Session

# Add backend directory to sys.path to enable imports
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal, engine
from app.models.power import Base, PowerGeneration, PowerConsumptionByIndustry, PowerDemandSummary

# Try to find the correct data directory (supporting both container and host paths)
possible_dirs = [
    os.path.join(os.path.dirname(__file__), "..", "data", "raw"),
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
]
DATA_DIR = None
for p in possible_dirs:
    if os.path.exists(p):
        DATA_DIR = p
        break

if DATA_DIR is None:
    DATA_DIR = possible_dirs[0]

GEN_PATH = os.path.join(DATA_DIR, "generation.json")
CON_PATH = os.path.join(DATA_DIR, "consumption.json")
SUP_PATH = os.path.join(DATA_DIR, "supply_demand.json")

def parse_minguo_year(val: str) -> int:
    """Convert Minguo year string (e.g. '105年') to Gregorian year integer (e.g. 2016)"""
    match = re.match(r"^(\d+)年$", val)
    if match:
        return int(match.group(1)) + 1911
    raise ValueError(f"Invalid Minguo year: {val}")

def parse_month(val: str) -> int:
    """Convert month string (e.g. '04月') to integer (e.g. 4)"""
    match = re.match(r"^(\d+)月$", val)
    if match:
        return int(match.group(1))
    raise ValueError(f"Invalid month: {val}")

def clean_float(val) -> float:
    """Clean and convert string or numeric value to float"""
    if val is None or val == "" or str(val).strip() in ["-", "—"]:
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0

def seed_generation(db: Session):
    print("Seeding power_generation table...")
    if not os.path.exists(GEN_PATH):
        print(f"Error: {GEN_PATH} not found.")
        return

    with open(GEN_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Key is '全國'
    data = raw_data.get("全國", [])
    if not data:
        print("No '全國' data found in generation.json")
        return

    # Column Mapping
    ENERGY_MAP = {
        "total": ("Column2", None),
        "pumped_storage": ("Column3", "Column4"),
        "coal": ("Column7", "Column8"),
        "oil": ("Column9", "Column10"),
        "gas": ("Column11", "Column12"),
        "nuclear": ("Column13", "Column14"),
        "hydro": ("Column17", "Column18"),
        "geothermal": ("Column19", "Column20"),
        "solar": ("Column21", "Column22"),
        "wind": ("Column23", "Column24"),
        "biomass": ("Column25", "Column26"),
        "waste": ("Column27", "Column28")
    }

    current_year = None
    records_count = 0

    for idx, row in enumerate(data):
        if idx < 5:  # Skip first 5 header rows
            continue

        keys = list(row.keys())
        if not keys:
            continue
        period_val = str(row[keys[0]]).strip()

        # Determine year and month
        try:
            if re.match(r"^\d+年$", period_val):
                current_year = parse_minguo_year(period_val)
                month = 0
            elif re.match(r"^\d+月$", period_val):
                if current_year is None:
                    continue
                month = parse_month(period_val)
            else:
                # Skip summary intervals like '114年01-04月' or '增減(%)'
                continue
        except ValueError:
            continue

        # Parse and save energy types
        for db_name, cols in ENERGY_MAP.items():
            gwh_col, pct_col = cols
            gwh_val = clean_float(row.get(gwh_col))
            pct_val = clean_float(row.get(pct_col)) if pct_col else 100.0 if db_name == "total" else 0.0

            if gwh_val == 0.0 and db_name != "total":
                continue # Skip empty records

            # Check if record already exists
            existing = db.query(PowerGeneration).filter_by(
                year=current_year,
                month=month,
                energy_type=db_name
            ).first()

            if existing:
                existing.generation_gwh = gwh_val
                existing.percentage = pct_val
            else:
                new_record = PowerGeneration(
                    year=current_year,
                    month=month,
                    energy_type=db_name,
                    generation_gwh=gwh_val,
                    percentage=pct_val
                )
                db.add(new_record)
            records_count += 1

    db.commit()
    print(f"Successfully seeded/updated {records_count} records in power_generation.")

def seed_consumption(db: Session):
    print("Seeding power_consumption_by_industry table...")
    if not os.path.exists(CON_PATH):
        print(f"Error: {CON_PATH} not found.")
        return

    with open(CON_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    records_count = 0

    # 1. Parse Sectoral Consumption (電力消費 sheet)
    sec_data = raw_data.get("電力消費", [])
    SECTOR_MAP = {
        "total": ("Column2", None),
        "energy_sector": ("Column3", "Column4"),
        "industrial_sector": ("Column5", "Column6"),
        "transport_sector": ("Column7", "Column8"),
        "agricultural_sector": ("Column9", "Column10"),
        "service_sector": ("Column11", "Column12"),
        "residential_sector": ("Column13", "Column14")
    }

    current_year = None
    for idx, row in enumerate(sec_data):
        if idx < 4:  # Skip headers
            continue
        keys = list(row.keys())
        if not keys:
            continue
        period_val = str(row[keys[0]]).strip()

        try:
            if re.match(r"^\d+年$", period_val):
                current_year = parse_minguo_year(period_val)
                month = 0
            elif re.match(r"^\d+月$", period_val):
                if current_year is None:
                    continue
                month = parse_month(period_val)
            else:
                continue
        except ValueError:
            continue

        for db_name, cols in SECTOR_MAP.items():
            gwh_col, pct_col = cols
            gwh_val = clean_float(row.get(gwh_col))
            pct_val = clean_float(row.get(pct_col)) if pct_col else 100.0 if db_name == "total" else 0.0

            if gwh_val == 0.0 and db_name != "total":
                continue

            existing = db.query(PowerConsumptionByIndustry).filter_by(
                year=current_year,
                month=month,
                industry=db_name
            ).first()

            if existing:
                existing.consumption_gwh = gwh_val
                existing.percentage = pct_val
            else:
                new_record = PowerConsumptionByIndustry(
                    year=current_year,
                    month=month,
                    industry=db_name,
                    consumption_gwh=gwh_val,
                    percentage=pct_val
                )
                db.add(new_record)
            records_count += 1

    # 2. Parse Detailed Industrial Consumption (工業用電(107年後) sheet)
    ind_data = raw_data.get("工業用電(107年後)", [])
    IND_MAP = {
        "textiles": ("Column4", "Column5"),
        "pulp_paper": ("Column6", "Column7"),
        "chemicals": ("Column8", "Column9"),
        "plastics": ("Column10", "Column11"),
        "non_metallic_minerals": ("Column12", "Column13"),
        "basic_metals": ("Column14", "Column15"),
        "fabricated_metals": ("Column16", "Column17"),
        "electronics": ("Column18", "Column19"),
        "other_industries": ("Column20", "Column21")
    }

    current_year = None
    for idx, row in enumerate(ind_data):
        if idx < 4:
            continue
        keys = list(row.keys())
        if not keys:
            continue
        period_val = str(row[keys[0]]).strip()

        try:
            if re.match(r"^\d+年$", period_val):
                current_year = parse_minguo_year(period_val)
                month = 0
            elif re.match(r"^\d+月$", period_val):
                if current_year is None:
                    continue
                month = parse_month(period_val)
            else:
                continue
        except ValueError:
            continue

        for db_name, cols in IND_MAP.items():
            gwh_col, pct_col = cols
            gwh_val = clean_float(row.get(gwh_col))
            pct_val = clean_float(row.get(pct_col))

            if gwh_val == 0.0:
                continue

            existing = db.query(PowerConsumptionByIndustry).filter_by(
                year=current_year,
                month=month,
                industry=db_name
            ).first()

            if existing:
                existing.consumption_gwh = gwh_val
                existing.percentage = pct_val
            else:
                new_record = PowerConsumptionByIndustry(
                    year=current_year,
                    month=month,
                    industry=db_name,
                    consumption_gwh=gwh_val,
                    percentage=pct_val
                )
                db.add(new_record)
            records_count += 1

    db.commit()
    print(f"Successfully seeded/updated {records_count} records in power_consumption_by_industry.")

def seed_demand_summary(db: Session):
    # This acts as a placeholder or aggregate seeder if needed.
    # Currently we focus on detailed generation & consumption.
    pass

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_generation(db)
        seed_consumption(db)
        print("Data seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()
