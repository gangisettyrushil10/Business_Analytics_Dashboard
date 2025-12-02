# business analytics dashboard

full-stack analytics platform for sales data. upload csv files, get revenue trends, forecasts, anomaly detection, and ai-powered insights.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## what it does

you upload a csv with sales data, and it gives you:
- revenue trends over time (interactive charts)
- category breakdowns
- customer analytics
- revenue forecasting using prophet (7/30/90 day predictions with confidence intervals)
- anomaly detection using isolation forest (finds unusual days)
- ai-generated insights using openai
- etl transformations (rename columns, map categories, computed fields)
- data quality validation (catches missing values, type errors, duplicates before upload)

the hard part wasn't the charts - it was handling messy csv data gracefully. most dashboards break when you upload files with missing values or wrong date formats. this one validates everything and still processes what it can.

---

## tech stack

**backend:**
- fastapi (async, type hints, automatic api docs)
- sqlalchemy (orm)
- postgresql/sqlite (sqlite for dev, postgres for prod)
- prophet (time-series forecasting)
- scikit-learn (isolation forest for anomaly detection)
- openai api (for insights)
- jwt auth (passlib + python-jose)

**frontend:**
- react 19 + typescript
- vite
- chart.js (react-chartjs-2)
- react router
- axios

**architecture:**
service-layer pattern. routers handle http, services contain business logic, models handle data. keeps things testable and maintainable.

---

## quick start

```bash
# backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

backend runs on http://localhost:8000  
frontend runs on http://localhost:5173  
api docs at http://localhost:8000/docs

**optional:** create `backend/.env`:
```
DATABASE_URL=sqlite:///./business_dashboard.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-key-here  # optional, for ai insights
```

---

## csv format

your csv needs these columns:

```csv
date,amount,category,customerID
2024-01-01,100.50,Electronics,1
2024-01-02,250.75,Clothing,2
```

- `date` - YYYY-MM-DD format
- `amount` - decimal number
- `category` - string
- `customerID` - integer

see `sample_sales.csv` for an example.

---

## features

**analytics:**
- revenue trends with date range filtering
- category breakdown (doughnut chart)
- customer stats (top customers, avg spending)
- search and filter sales
- export filtered data as csv

**ml/ai:**
- prophet forecasting (7/30/90 days with 95% confidence intervals)
- isolation forest anomaly detection (flags unusual revenue patterns)
- openai insights (generates business recommendations from your data)

**data management:**
- csv upload with validation (missing values, type errors, duplicates, date issues)
- etl transformations (rename columns, map categories, computed fields with live preview)
- drill-down interactions (click any chart element to see underlying transactions)

**ux:**
- dark mode toggle
- responsive design (mobile/tablet/desktop)
- loading skeletons
- toast notifications
- custom date picker

**auth:**
- jwt authentication
- protected routes
- user registration/login

---

## api endpoints

**auth:**
- `POST /auth/register` - create account
- `POST /auth/login` - get jwt token

**upload:**
- `POST /upload/csv` - upload csv (requires auth)

**analytics:**
- `GET /stats/revenue?range=30` - revenue trends
- `GET /stats/by-category` - category breakdown
- `GET /stats/customers` - customer stats
- `GET /stats/forecast?period=30` - revenue forecast
- `GET /stats/anomalies?range_days=90` - anomaly detection

**sales:**
- `GET /sales/search` - search/filter with pagination
- `GET /sales/export` - export as csv

**transform:**
- `POST /transform/preview` - preview etl transformations

**ai:**
- `POST /ai/insights` - generate ai insights

full api docs at http://localhost:8000/docs

---

## testing

```bash
cd backend
pytest tests/

# specific tests
pytest tests/test_upload.py
pytest tests/test_stats.py
pytest tests/test_forecast.py
```

tests cover upload, stats, and forecast endpoints with authentication.

---

## docker

```bash
docker-compose up --build
```

starts postgresql + backend. frontend still runs separately with `npm run dev`.

---

## project structure

```
backend/
├── app/
│   ├── main.py              # fastapi app
│   ├── database.py          # db connection
│   ├── models.py            # sqlalchemy models
│   ├── routers/             # api endpoints
│   └── services/           # business logic
├── tests/                   # pytest tests
└── requirements.txt

frontend/
├── src/
│   ├── pages/               # route components
│   ├── components/          # reusable components
│   ├── contexts/           # react contexts
│   ├── api/                # api client
│   └── types/              # typescript types
└── package.json
```

---

## why i built this

wanted to build something that handles real-world data problems. csv uploads are always messy - missing values, wrong types, duplicate rows, broken dates. most dashboards either crash or silently ignore errors. this one validates everything upfront and gives you a detailed report.

also wanted to integrate real ml models, not just mock data. prophet for forecasting and isolation forest for anomaly detection. plus openai for generating insights.

the architecture uses a service layer pattern - routers handle http, services contain logic, models handle data. makes it easy to test and maintain.

---

## what's included

- ~5,500 lines of code
- 15+ api endpoints
- 12 react components
- 7 backend services
- 6 pages
- error boundaries
- jwt authentication
- data validation pipeline
- ml forecasting
- anomaly detection
- ai insights
- etl transformations
- tests

---

## license

MIT

---

questions? open an issue or reach out.
