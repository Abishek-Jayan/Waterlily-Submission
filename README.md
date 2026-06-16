# Waterlily User Intake

A full-stack intake form for long-term care planning. Users register, log in, walk through a 15-question survey one question at a time with validation, and can review or edit their responses anytime.

## Tech stack

**Frontend**
- React 19 + TypeScript

**Backend**
- Python 3 + Django REST Framework (Chosen over Node.js due to familiarity, built in db configuration and time constraints)

**Auth**
- Session cookies via Django's session middleware

## Implemented features

### Authentication
- Register a new user (username + password, password hashed by Django).
- Log in and log out — both establish/clear a session cookie.
- `/me/` endpoint the frontend hits on mount to know whether to show the form or the auth modal.
- CSRF cookie bootstrapped on first load, automatically sent with every mutating request.


## Architecture

```
backend/
  requirements.txt
  myproject/
    manage.py
    myapp/                Application: models, serializers, views, URLs
    myproject/            Settings + project URL conf
frontend/User-intake/
  package.json
  src/
    App.tsx               Auth bootstrap (csrf + me), gates Auth vs QuestionForm
    api.ts                fetchJSON helper (credentials + CSRF header)
    Auth/                 Login/register modal
    Question/             Renders a single typed question
    QuestionForm/         Carousel, progress bar, submit flow, responses modal
```

### Data model

- `auth.User` — stock Django user (username + hashed password).
- `QuestionModel` — one row per `(user, question_id)` with the user's answer. Composite unique constraint on `(user, question_id)` so resubmits update in place while leaving other users' rows untouched.

### API

All endpoints live under `/api/`.

| Method | Path           | Auth          | Purpose |
|--------|----------------|---------------|---------|
| GET    | `/csrf/`       | Public        | Sets the `csrftoken` cookie so the frontend can read it. |
| GET    | `/me/`         | Public        | Returns the current user or `null`. |
| POST   | `/register/`   | Public        | Creates a user and logs them in. |
| POST   | `/login/`      | Public        | Authenticates and starts a session. |
| POST   | `/logout/`     | Authenticated | Ends the session. |
| GET    | `/formsubmit/` | Authenticated | Returns the current user's answers. |
| POST   | `/formsubmit/` | Authenticated | Upserts `{question_id, answer}` rows for the current user. |

## Setup

### Prerequisites
- Python 3.11+ (3.12 recommended)
- Node.js 18+
- npm

### Backend

From `backend/`:

```powershell
python -m venv env
.\env\Scripts\Activate.ps1
pip install -r requirements.txt
cd myproject
python manage.py migrate
python manage.py runserver
```

Listens on `http://localhost:8000`.

On macOS/Linux, swap `.\env\Scripts\Activate.ps1` for `source env/bin/activate`.

### Frontend

From `frontend/User-intake/`:

```powershell
npm install
npm run dev
```

Vite serves on `http://localhost:5173`. Open that URL — you'll land on the auth modal. Register, then walk through the form.

### Configuration

If you change the Vite port, update `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in `backend/myproject/myproject/settings.py` so the new origin is allowed.
