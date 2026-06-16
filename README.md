# Waterlily User Intake

A full-stack intake form for long-term care planning. Users register, log in, walk through a 15-question survey one question at a time with validation, and can review or edit their responses anytime.

## Tech stack

**Frontend**
- React 19 + TypeScript
- Vite (dev server and build)
- react-hot-toast (notifications)
- Plain CSS modules (no UI framework)

**Backend**
- Python 3 + Django 6
- Django REST Framework (API layer)
- django-cors-headers (cross-origin requests)
- SQLite (default dev DB)

**Auth**
- Session cookies via Django's session middleware
- CSRF tokens on every state-changing request
- DRF `SessionAuthentication` enforced globally; `AllowAny` only on register/login/me/csrf

## Implemented features

### Authentication
- Register a new user (username + password, password hashed by Django).
- Log in and log out — both establish/clear a session cookie.
- `/me/` endpoint the frontend hits on mount to know whether to show the form or the auth modal.
- CSRF cookie bootstrapped on first load, automatically sent with every mutating request.

### Survey form
- 15-question intake covering demographics, health, family history, and finances.
- **Carousel UI**: one question on screen at a time, with Previous and Next buttons.
- **Progress bar** showing "Question N of 15".
- **Typed inputs per question**:
  - Date of birth → calendar picker, capped at the current year.
  - State → dropdown of all 50 US states (browser enforces "must be in list").
  - Marital status → Single / Married dropdown.
  - Yes/No questions → custom-styled radio buttons.
  - Income, savings, retirement age → number input, must be a positive integer.
- **Per-question validation**: Next and Submit buttons stay disabled until the current input is valid.
- **Prefill on return**: prior answers are loaded back into the form so users can edit instead of starting over.
- **Resubmit support**: upsert via the composite uniqueness constraint, so re-submitting updates answers in place rather than stacking duplicate rows.

### Reviewing responses
- After at least one submission, a "View Submitted Responses" button appears.
- Opens a modal listing every stored answer joined to its original question text.
- Click-outside-to-close on the backdrop.

### UI/UX
- Warm light theme: cream background, white cards, burnt-orange accents.
- Box-shadowed modal cards (auth, success, and responses review).
- Hyperlink-style toggle between login and register.
- Toast notifications for success, network failures, and submit errors.
- Sticky top bar showing "Logged in as <username>" and a logout button.

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
- npm (ships with Node)

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
