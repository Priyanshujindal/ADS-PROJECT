# Titanic Survival Predictor – Working App

This project now has a real backend API that computes predictions. The frontend calls the backend to get results.

## Prerequisites
- Python 3.10+

## Setup (first time)
```bash
cd /Users/exowaysten/Documents/ADS-PROJECT
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run the app (single command)
```bash
./start.sh
```
This starts both the Flask backend and the static frontend concurrently.
- Frontend: http://127.0.0.1:8000
- Backend API: http://127.0.0.1:5002

Press Ctrl+C to stop both servers.

## Manual run (if you prefer)
Backend:
```bash
source .venv/bin/activate
PORT=5002 python server.py
```
Frontend (in another terminal):
```bash
python3 -m http.server 8000
```

## API
- `GET /health` → `{"status":"ok"}`
- `POST /predict` → JSON body: `{ pclass, sex, age, sibsp, parch, fare, embarked }`

Example `curl`:
```bash
curl -s -X POST http://127.0.0.1:5002/predict \
  -H 'Content-Type: application/json' \
  -d '{"pclass":1, "sex":0, "age":28, "sibsp":0, "parch":0, "fare":72.0, "embarked":"C"}' | jq
```

## Notes
- The backend uses the trained model.pkl when available.
- Encodings: `sex` → 0 female, 1 male; `embarked` → one of `S`, `C`, `Q`.

# ADS-PROJECT
