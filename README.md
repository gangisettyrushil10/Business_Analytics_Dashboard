# Business Analytics Dashboard

Business Analytics Dashboard is a full-stack analytics platform for turning messy sales CSVs into usable business intelligence. The system combines ingestion, validation, ETL-style transformations, forecasting, anomaly detection, and AI-generated insight reporting in a single FastAPI and React workflow designed around realistic operational data rather than toy datasets.

## Highlights
- Built as a ~5,600 LOC full-stack project spanning a FastAPI backend and a React 19 + TypeScript frontend.
- Exposes 13 REST endpoints and 7 backend services for auth, upload, reporting, forecasting, anomaly detection, AI insights, and transform preview workflows.
- Delivers 6 frontend pages and 13 reusable components for upload, dashboarding, drill-down analysis, forecasting, and date-range exploration.
- Supports 7/30/90-day Prophet forecasting, Isolation Forest anomaly detection, JWT auth, CSV validation, and 3 backend test modules.

## Stack
- FastAPI
- Python
- React 19
- TypeScript
- PostgreSQL
- SQLAlchemy
- Prophet
- scikit-learn
- OpenAI API
- Vite

## Local Setup
1. Start the backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

2. Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

3. Optional backend environment variables:

```bash
DATABASE_URL=sqlite:///./business_dashboard.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-key-here
```

4. Open the app and API docs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`

## Screenshots
- Placeholder: upload flow with CSV validation and quality reporting
- Placeholder: dashboard view with revenue and category visualizations
- Placeholder: forecast screen with 7/30/90-day projections
- Placeholder: anomaly and AI insight panels for business review
