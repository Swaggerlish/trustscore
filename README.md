# ProcureScore

ProcureScore is an AI procurement assessment workspace for evaluating the
trustworthiness, governance, and operational readiness of AI vendors and
systems. It combines a guided web assessment with a FastAPI scoring service,
optional dataset profiling, and evidence verification for vendor documents.

The application produces:

- A 0–100 overall procurement score.
- Scores for ten governance and technical dimensions.
- A risk classification: **Unacceptable**, **High**, **Limited**, or **Low
  risk**.
- Dimension-specific recommendations and supporting metrics.
- Downloadable JSON and PDF-style reports.
- Optional document evidence verification using Google Gemini.

> **Project naming:** The user-facing product is called ProcureScore. Some
> backend metadata and legacy browser storage keys still use the name
> TrustScore.

## Features

### Guided assessment

The frontend provides a multi-section assessment flow covering system
documentation, risk controls, and the applicable evaluation dimensions. The
default dimensions are:

1. Risk assessment
2. Robustness
3. Privacy and security
4. Bias and fairness
5. Accountability
6. Models and architecture
7. Performance
8. Transparency
9. Environmental impact
10. Dataset quality

Sections can be enabled or disabled from Settings. The selected controls are
sent to the backend as one assessment request.

### Deterministic scoring

Most dimensions use a transparent rule-based score: the percentage of
submitted controls that pass. Scores are clamped to 0–100 and classified as:

| Score | Risk level |
| ---: | --- |
| 0–24.99 | Unacceptable risk |
| 25–49.99 | High risk |
| 50–74.99 | Limited risk |
| 75–100 | Low risk |

The overall score is the arithmetic mean of the ten dimension scores. Bias
and dataset quality may use additional evidence or profiling when structured
data is supplied.

### Bias and fairness analysis

Bias evaluation accepts protected-group decision records and can use
fairness-analysis logic backed by AIF360 when sufficient structured data is
available. The result can include demographic parity difference, disparate
impact ratio, an evaluation method, and recommendations.

### Dataset quality profiling

Dataset quality can be evaluated from structured controls or from dataset
records. The backend can profile CSV input and return data-quality metrics,
recommendations, and the evaluation method used.

### Document evidence verification

Users can upload vendor evidence while completing an assessment. The backend
extracts text from PDF, DOCX, XLSX, TXT, Markdown, CSV, or JSON files and
asks Gemini to compare the submitted claims with the extracted content.
Verification is deliberately conservative: unclear, missing, or contradictory
evidence is not marked as verified.

### Reports and local history

Completed assessments are saved in the browser's `localStorage`, not in the
backend database. The Reports page supports downloading a saved assessment as
JSON or PDF. Clearing browser storage removes the local assessment history.

## Architecture

```text
Browser
  └─ React 18 + Vite + Tailwind CSS
       ├─ Guided assessment and settings
       ├─ Dashboard and reports
       ├─ localStorage assessment history
       └─ HTTP requests to FastAPI

FastAPI
  ├─ Assessment aggregation
  ├─ Dimension-specific scoring services
  ├─ Bias/fairness analysis
  ├─ Dataset quality profiling
  └─ Optional Gemini document verification
```

### Repository layout

```text
.
├── backend/
│   ├── app/
│   │   ├── core/                 # Shared scoring and risk classification
│   │   ├── routers/              # FastAPI route modules
│   │   ├── schemas/              # Pydantic request/response models
│   │   └── services/             # Dimension evaluation and aggregation
│   ├── audit_ai_src/             # Bundled audit-ai package source
│   ├── requirements.txt
│   └── run_local.py              # Local Uvicorn entry point
├── database/
│   └── db.py                     # Current database connection placeholder
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/api.js       # Backend client and payload mapping
│   │   └── utils/
│   ├── public/
│   └── package.json
├── .env.example
└── README.md
```

## Prerequisites

- Python 3.10 or newer.
- Node.js 18 or newer and npm.
- A modern browser.
- A Gemini API key only if document verification is required.

## Local setup

### 1. Clone and enter the repository

```bash
git clone https://github.com/Swaggerlish/trustscore.git
cd trustscore
```

### 2. Configure backend environment variables

Copy `.env.example` to `.env` in the repository root and set:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
```

The key is only required by `POST /assessment/verify-document`. Do not commit
`.env` or expose the key to the frontend.

### 3. Create and activate a Python environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

### 4. Start the API

From the repository root:

```bash
python backend/run_local.py
```

The API listens at `http://127.0.0.1:8000` and reloads when Python source
files change. Interactive API documentation is available at:

- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>
- Health check: <http://127.0.0.1:8000/health>

### 5. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally
`http://localhost:5173`.

To use a different API origin, create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The frontend defaults to `http://127.0.0.1:8000` when this variable is not
set.

## Production builds

Build the frontend:

```bash
cd frontend
npm run build
```

The production files are emitted to `frontend/dist`. Preview the build
locally with:

```bash
npm run preview
```

The frontend and API are deployed independently. Configure the deployed
frontend's `VITE_API_BASE_URL` to point to the deployed FastAPI origin and
ensure the API's CORS policy is appropriate for the deployed domain.

## API reference

All API routes are currently unversioned and accept JSON unless noted
otherwise.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API availability |
| `POST` | `/assessment/evaluate` | Evaluate and aggregate a complete assessment |
| `POST` | `/assessment/verify-document` | Verify vendor claims against an uploaded document |
| `POST` | `/bias/evaluate` | Evaluate bias and fairness |
| `POST` | `/privacy/evaluate` | Evaluate privacy and security controls |
| `POST` | `/compliance/evaluate` | Evaluate compliance frameworks |
| `POST` | `/accountability/evaluate` | Evaluate accountability controls |
| `POST` | `/transparency/evaluate` | Evaluate transparency controls |
| `POST` | `/dataset-quality/evaluate` | Evaluate dataset quality controls or records |
| `POST` | `/dataset-quality/evaluate-csv` | Evaluate raw CSV content |
| `POST` | `/model-architecture/evaluate` | Evaluate model architecture controls |
| `POST` | `/robustness/evaluate` | Evaluate robustness controls |
| `POST` | `/performance/evaluate` | Evaluate performance controls |
| `POST` | `/environmental-impact/evaluate` | Evaluate environmental-impact controls |

The authoritative request and response schemas are available in Swagger UI
and in `backend/app/schemas`.

### Complete assessment example

The browser client builds the complete payload from the form state. A minimal
request has the following shape:

```json
{
  "vendor_name": "Example AI Vendor",
  "bias": {
    "decisions": [],
    "privileged_group": "reference",
    "unprivileged_group": "comparison",
    "assessment_text": "",
    "evidence_provided": false
  },
  "dataset_quality": {
    "documented_sources": true,
    "representative_samples": true,
    "data_lineage_available": false,
    "quality_checks_performed": true,
    "licensing_verified": true,
    "records": []
  },
  "model_architecture": {},
  "privacy": {},
  "compliance": {
    "risk_frameworks": [],
    "gdpr": false,
    "eu_ai_act": false,
    "hipaa": false
  },
  "transparency": {},
  "environmental_impact": {},
  "accountability": {},
  "performance": {},
  "robustness": {}
}
```

Use the generated OpenAPI schema rather than copying this abbreviated example
when integrating another client.

### CSV dataset evaluation

Send the raw CSV as the request body with `Content-Type: text/csv`. Optional
control flags are query parameters:

```text
POST /dataset-quality/evaluate-csv?documented_sources=true&quality_checks_performed=true
```

The CSV must contain at least one data row.

### Document verification

`/assessment/verify-document` expects multipart form data:

- `file`: the uploaded document.
- `section`: the assessment section being verified.
- `vendor_claims`: a JSON-encoded object containing the vendor claims.

Supported extensions are `.pdf`, `.docx`, `.xlsx`, `.txt`, `.md`, `.csv`, and
`.json`. The current service limits extracted evidence sent to Gemini to
24,000 characters and retries transient Gemini 429/503 responses up to three
times.

## Development workflow

### Backend

Run the API from the repository root so the `app` package resolves correctly:

```bash
python backend/run_local.py
```

Useful checks:

```bash
python -m compileall backend/app
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
```

The frontend currently has no test script in `package.json`; use the
production build as the available automated frontend validation.

## Configuration and data handling

- `GEMINI_API_KEY` is loaded from the repository-root `.env` file.
- `VITE_API_BASE_URL` is a frontend build-time variable.
- Assessment history is stored under the `procurescore_assessments`
  `localStorage` key. Older `trustscore_assessments` data is read for
  compatibility.
- Applicable metrics are stored under
  `trustscore_applicable_metrics`.
- The current `database/db.py` module is a placeholder and is not used as the
  persistence layer for saved assessments.
- The backend currently enables permissive CORS for local development. Review
  `backend/app/main.py` before production deployment.

## Limitations and responsible use

ProcureScore is a decision-support tool, not a legal, regulatory, security,
or fairness certification. Scores depend on the completeness and accuracy of
vendor-submitted information. A high score does not prove that a system is
safe or compliant, and a low score should be investigated rather than treated
as a final procurement decision.

Before production use, consider:

- Adding authenticated, server-side persistence for assessments.
- Restricting CORS to trusted frontend origins.
- Adding request size, file size, and upload-rate limits.
- Redacting sensitive information before sending documents to external AI
  services.
- Pinning dependency versions and scanning them regularly.
- Adding automated backend and frontend test suites.
- Reviewing scoring thresholds and controls with legal, compliance, privacy,
  security, and domain experts.

## License

No project license is currently declared in the repository. Add a `LICENSE`
file and update this section before distributing ProcureScore.
