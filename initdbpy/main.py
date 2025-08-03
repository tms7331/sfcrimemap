import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

CSV_FILE_PATH = "Police_Department_Incident_Reports__2018_to_Present_20250801.csv"
CONNECTION_STRING = os.getenv("DATABASE_URL")

if not CONNECTION_STRING:
    raise ValueError("DATABASE_URL environment variable is not set")


def get_custom_category(incident_category):
    """Map incident categories to custom groupings based on groupings.md"""
    if pd.isna(incident_category):
        return None

    category = str(incident_category).strip()

    # Exact matches first (most specific)
    exact_mappings = {
        # Property Theft & Larceny
        "Larceny Theft": "Property Theft & Larceny",
        "Stolen Property": "Property Theft & Larceny",
        # Burglary
        "Burglary": "Burglary",
        # Vehicle-Related Crimes
        "Motor Vehicle Theft": "Vehicle-Related Crimes",
        "Motor Vehicle Theft?": "Vehicle-Related Crimes",
        # Physical Violence & Assault
        "Assault": "Physical Violence & Assault",
        "Weapons Offense": "Physical Violence & Assault",
        "Weapons Carrying Etc": "Physical Violence & Assault",
        "Offences Against The Family And Children": "Physical Violence & Assault",
        "Homicide": "Physical Violence & Assault",
        "Weapons Offence": "Physical Violence & Assault",
        # Robbery
        "Robbery": "Robbery",
        # Sexual & Violent Crimes
        "Sex Offense": "Sexual & Violent Crimes",
        "Rape": "Sexual & Violent Crimes",
        "Human Trafficking (A), Commercial Sex Acts": "Sexual & Violent Crimes",
        "Human Trafficking, Commercial Sex Acts": "Sexual & Violent Crimes",
        "Human Trafficking (B), Involuntary Servitude": "Sexual & Violent Crimes",
        # Drug & Public Order
        "Drug Offense": "Drug & Public Order",
        "Disorderly Conduct": "Drug & Public Order",
        "Traffic Violation Arrest": "Drug & Public Order",
        "Prostitution": "Drug & Public Order",
        "Drug Violation": "Drug & Public Order",
        "Liquor Laws": "Drug & Public Order",
        "Civil Sidewalks": "Drug & Public Order",
        "Gambling": "Drug & Public Order",
        # Financial Crimes
        "Fraud": "Financial Crimes",
        "Forgery And Counterfeiting": "Financial Crimes",
        "Embezzlement": "Financial Crimes",
        # Administrative & Investigative
        "Other Miscellaneous": "Administrative & Investigative",
        "Non-Criminal": "Administrative & Investigative",
        "Warrant": "Administrative & Investigative",
        "Lost Property": "Administrative & Investigative",
        "Missing Person": "Administrative & Investigative",
        "Suspicious Occ": "Administrative & Investigative",
        "Miscellaneous Investigation": "Administrative & Investigative",
        "Courtesy Report": "Administrative & Investigative",
        "Fire Report": "Administrative & Investigative",
        "Traffic Collision": "Administrative & Investigative",
        "Vehicle Impounded": "Administrative & Investigative",
        "Suicide": "Administrative & Investigative",
        "Vehicle Misplaced": "Administrative & Investigative",
        "Suspicious": "Administrative & Investigative",
        # Property Damage
        "Malicious Mischief": "Property Damage",
        "Arson": "Property Damage",
        "Vandalism": "Property Damage",
    }

    # Check for exact match first
    if category in exact_mappings:
        return exact_mappings[category]

    # Check if this is an excluded category (should be filtered out)
    excluded_categories = [
        "Other",
        "Other Offenses",
        "Case Closure",
        "Recovered Vehicle",
    ]

    if category in excluded_categories:
        return None  # Return None to filter out excluded categories

    # If we get here, this is an unexpected category - assert to catch this
    assert False, f"Unexpected incident category not in main groups or excluded list: '{incident_category}'"


def clean_data(df):
    """Clean and prepare data for PostgreSQL"""
    # Convert datetime columns
    df["Incident Datetime"] = pd.to_datetime(df["Incident Datetime"], errors="coerce")
    df["Report Datetime"] = pd.to_datetime(df["Report Datetime"], errors="coerce")

    # Convert numeric columns (now DOUBLE PRECISION for lat/long)
    df["Latitude"] = pd.to_numeric(df["Latitude"], errors="coerce")
    df["Longitude"] = pd.to_numeric(df["Longitude"], errors="coerce")
    df["Incident Code"] = pd.to_numeric(df["Incident Code"], errors="coerce")
    df["Supervisor District"] = pd.to_numeric(
        df["Supervisor District"], errors="coerce"
    )

    # Add custom category mapping
    df["Incident Category Custom"] = df.apply(
        lambda row: get_custom_category(row["Incident Category"]),
        axis=1,
    )

    return df


def clear_table():
    """Clear all data from the incidents table"""
    print("Clearing existing data from incidents table...")
    conn = psycopg2.connect(CONNECTION_STRING)
    cursor = conn.cursor()

    try:
        cursor.execute("TRUNCATE TABLE incidents RESTART IDENTITY CASCADE;")
        conn.commit()
        print("✓ Table cleared successfully")
    except Exception as e:
        print(f"Error clearing table: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def import_data(max_rows=None):
    if max_rows is None:
        print(f"Loading ALL rows from {CSV_FILE_PATH}...")
        df = pd.read_csv(CSV_FILE_PATH)
    else:
        print(f"Loading first {max_rows} rows from {CSV_FILE_PATH}...")
        df = pd.read_csv(CSV_FILE_PATH, nrows=max_rows)

    print(f"Loaded {len(df)} rows from CSV")

    # Clean the data
    df = clean_data(df)

    # Filter out rows with null incident_category (required field) and excluded categories (custom category = None)
    initial_count = len(df)
    df = df[df["Incident Category"].notna() & df["Incident Category Custom"].notna()]
    filtered_count = len(df)
    excluded_count = initial_count - filtered_count

    if excluded_count > 0:
        print(f"Filtered out {excluded_count} rows:")
        print(
            "  - Null incident_category or excluded categories (Other, Other Offenses, Case Closure, Recovered Vehicle)"
        )
        print(f"Proceeding with {filtered_count} rows")

    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(CONNECTION_STRING)
    cursor = conn.cursor()

    # Prepare data for insertion - updated for new schema
    insert_query = """
    INSERT INTO incidents (
        incident_datetime, incident_day_of_week, report_datetime, 
        report_type_description, incident_code, incident_category_custom,
        incident_category, incident_subcategory, incident_description, 
        resolution, intersection, latitude, longitude, police_district, 
        analysis_neighborhood, supervisor_district
    ) VALUES %s
    """

    # Prepare rows for insertion
    rows = []
    for _, row in df.iterrows():
        rows.append(
            (
                row["Incident Datetime"]
                if pd.notna(row["Incident Datetime"])
                else None,
                row["Incident Day of Week"]
                if pd.notna(row["Incident Day of Week"])
                else None,
                row["Report Datetime"] if pd.notna(row["Report Datetime"]) else None,
                row["Report Type Description"]
                if pd.notna(row["Report Type Description"])
                else None,
                int(row["Incident Code"]) if pd.notna(row["Incident Code"]) else None,
                row["Incident Category Custom"]
                if pd.notna(row["Incident Category Custom"])
                else None,
                row["Incident Category"]
                if pd.notna(row["Incident Category"])
                else None,
                row["Incident Subcategory"]
                if pd.notna(row["Incident Subcategory"])
                else None,
                row["Incident Description"]
                if pd.notna(row["Incident Description"])
                else None,
                row["Resolution"] if pd.notna(row["Resolution"]) else None,
                row["Intersection"] if pd.notna(row["Intersection"]) else None,
                float(row["Latitude"]) if pd.notna(row["Latitude"]) else None,
                float(row["Longitude"]) if pd.notna(row["Longitude"]) else None,
                row["Police District"] if pd.notna(row["Police District"]) else None,
                row["Analysis Neighborhood"]
                if pd.notna(row["Analysis Neighborhood"])
                else None,
                int(row["Supervisor District"])
                if pd.notna(row["Supervisor District"])
                else None,
            )
        )

    # Insert data in batches
    print(f"Inserting {len(rows)} rows...")
    execute_values(cursor, insert_query, rows, page_size=1000)

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Successfully imported {len(rows)} rows!")


if __name__ == "__main__":
    print("Clearing table...")
    clear_table()
    print("Importing data...")
    # Set to a number to import a subset of the data for testing db
    max_rows = None
    import_data(max_rows)
