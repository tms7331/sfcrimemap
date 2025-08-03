# San Francisco Crime Map Visualization

An interactive web application for visualizing crime data in San Francisco using heatmaps and analytics charts. Built on top of prior work done here: [https://github.com/RhysSullivan/sf-crime-heatmap](https://github.com/RhysSullivan/sf-crime-heatmap).

## Screenshot

![Crime Map Screenshot](screenshot.png)

## Features

- **Interactive Heatmap**: Real-time visualization of crime incidents using deck.gl
- **Time-based Filtering**: Filter crimes by year with an intuitive slider
- **Category Selection**: Focus on specific crime types with multi-select dropdown
- **Analytics Dashboard**: Monthly distribution and category trends with interactive charts
- **Comparison Views**: Compare crime patterns across different time periods and locations
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Mapping**: Mapbox GL, deck.gl for heatmap layers
- **Charts**: Recharts for data visualization
- **Database**: Neon Database
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Data Source

Crime incident data is sourced from the San Francisco Police Department Incident Reports (2018 to Present) dataset [https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783).

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox account for API token
- Neon Database account and configured database
- uv (for Python data processing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crimemap.git
cd crimemap
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your configuration to `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
POSTGRES_URL=your_neon_database_url
POSTGRES_PRISMA_URL=your_neon_database_prisma_url
POSTGRES_URL_NO_SSL=your_neon_database_url_no_ssl
POSTGRES_URL_NON_POOLING=your_neon_database_url_non_pooling
POSTGRES_USER=your_neon_user
POSTGRES_HOST=your_neon_host
POSTGRES_PASSWORD=your_neon_password
POSTGRES_DATABASE=your_neon_database
```

**Note**: This application is configured to run with Neon Database and is not simple to run locally due to the database configuration requirements.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

### Initial Data Population

The application includes a Python script (`initdbpy/main.py`) that handles the initial database population from the San Francisco Open Data CSV file. This script performs comprehensive data processing including category mapping, data cleaning, and bulk insertion.

**Prerequisites for data import:**
- Python 3.12+ 
- `uv` package manager
- Required Python packages: `pandas`, `psycopg2`

**Step-by-step setup:**

1. **Download the source data:**
   - Go to the [San Francisco Police Department Incident Reports dataset](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783)
   - Download the CSV file (typically named `Police_Department_Incident_Reports__2018_to_Present_YYYYMMDD.csv`)

2. **Prepare the import script:**
   - Place the downloaded CSV file in the `initdbpy/` folder
   - Update the `CSV_FILE_PATH` variable in `main.py` to match your downloaded file name
   - Update the `CONNECTION_STRING` in `main.py` with your Neon database connection details

3. **Install dependencies and run the import:**
```bash
cd initdbpy
# Install required packages
uv add pandas psycopg2-binary

# Run the data import script
uv run main.py
```

**What the import script does:**
- **Data Cleaning**: Converts datetime columns, handles numeric fields, validates coordinates
- **Category Mapping**: Maps the 49+ original crime categories to 10 consolidated groups (as defined in the crime category groupings)
- **Data Filtering**: Excludes categories like "Case Closure" and "Recovered Vehicle" 
- **Database Operations**: Clears existing data and performs bulk insert of processed records
- **Progress Reporting**: Provides detailed feedback on data processing and import progress

**Note**: The import script will completely replace any existing data in the incidents table. A full dataset typically contains 900,000+ records and may take several minutes to process.

### Keeping Data Up to Date

After the initial data population, the database can be kept current by setting up the sync API endpoint as a cron job:

- **Endpoint**: `/api/sync`
- **Method**: POST
- **Frequency**: Recommended daily or weekly depending on your needs

This endpoint will fetch and process new incident data from the San Francisco Open Data API.

## Crime Category Groupings

The original dataset contained 49 distinct crime incident categories. To improve analysis and visualization of trends over time, these were consolidated into 10 meaningful groupings. Each grouping is detailed below with the record counts from the initial data snapshot.
### 1. Property Theft & Larceny
- Larceny Theft (283,855)
- Stolen Property (4,746)

### 2. Burglary
- Burglary (53,942)

### 3. Vehicle-Related Crimes
- Motor Vehicle Theft (53,182)
- Motor Vehicle Theft? (99)

### 4. Physical Violence & Assault
- Assault (61,584)
- Weapons Offense (6,943)
- Weapons Carrying Etc (5,558)
- Offences Against The Family And Children (12,949)
- Homicide (210)
- Weapons Offence (26)

### 5. Robbery
- Robbery (21,711)

### 6. Sexual & Violent Crimes
- Sex Offense (1,081)
- Rape (248)
- Human Trafficking (A), Commercial Sex Acts (119)
- Human Trafficking, Commercial Sex Acts (24)
- Human Trafficking (B), Involuntary Servitude (3)

### 7. Drug & Public Order
- Drug Offense (27,618)
- Disorderly Conduct (17,612)
- Traffic Violation Arrest (8,762)
- Prostitution (991)
- Drug Violation (319)
- Liquor Laws (145)
- Civil Sidewalks (914)
- Gambling (57)

### 8. Financial Crimes
- Fraud (31,784)
- Forgery And Counterfeiting (3,510)
- Embezzlement (1,217)

### 9. Administrative & Investigative
- Other Miscellaneous (66,468 incidents)
- Non-Criminal (36,297)
- Warrant (30,551)
- Lost Property (29,064)
- Missing Person (21,417)
- Suspicious Occ (20,339)
- Miscellaneous Investigation (11,923)
- Courtesy Report (3,027)
- Fire Report (1,473)
- Traffic Collision (2,500)
- Vehicle Impounded (792)
- Suicide (446)
- Vehicle Misplaced (417)
- Suspicious (130)

### 10. Property Damage (Total: 68,683 incidents)
- Malicious Mischief (65,648)
- Arson (2,790)
- Vandalism (2,245)

### Excluded Categories
The following categories are excluded from visualization:
- "Case Closure"
- "Recovered Vehicle"

## Project Structure

```
crimemap/
├── app/
│   ├── api/
│   │   ├── incidents/         # API endpoint for heatmap data
│   │   ├── charts/           # API endpoint for analytics data
│   │   ├── comparison/       # API endpoint for comparison views
│   │   └── sync/             # API endpoint for data synchronization
│   ├── components/
│   │   ├── CrimeMap.tsx      # Main map component with deck.gl
│   │   ├── CrimeCharts.tsx   # Analytics charts component
│   │   └── ComparisonView.tsx # Comparison visualization
│   ├── lib/
│   │   ├── database.ts       # Database queries and connection
│   │   └── chartData.ts      # Chart data processing utilities
│   └── page.tsx              # Main application page
├── initdbpy/
│   ├── main.py               # Initial data import script
│   └── pyproject.toml        # Python dependencies
├── public/
├── specs/
│   └── groupings.md          # Crime category groupings
└── package.json
```

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### API Endpoints

- `GET /api/incidents` - Returns crime incident data for heatmap visualization
- `GET /api/charts` - Returns aggregated data for analytics charts
- `GET /api/comparison` - Returns comparison data for multiple time periods
- `POST /api/sync` - Syncs database with latest crime data from SF Open Data API

## Deployment

The application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on [SF Crime Heatmap](https://github.com/RhysSullivan/sf-crime-heatmap) by Rhys Sullivan
- Data provided by [San Francisco Open Data](https://data.sfgov.org/)
- Powered by [Mapbox](https://www.mapbox.com/) and [deck.gl](https://deck.gl/)
