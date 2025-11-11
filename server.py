from __future__ import annotations

import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Allow all origins for simplicity in local dev (serving index via http server)
CORS(app, resources={r"/*": {"origins": "*"}})

# Try to load trained model, otherwise use hardcoded coefficients
MODEL = None
MODEL_COEFFICIENTS = {
    "Pclass": -0.9161,
    "Sex": -2.5714,
    "Age": -0.0345,
    "SibSp": -0.3207,
    "Parch": -0.1018,
    "Fare": 0.0016,
    "Embarked_C": 0.5824,
    "Embarked_Q": 0.3542,
}
MODEL_INTERCEPT = 3.5048

# Load model if it exists
if os.path.exists('model.pkl'):
    try:
        import joblib
        MODEL = joblib.load('model.pkl')
        print("✅ Loaded trained model from model.pkl")
    except Exception as e:
        print(f"⚠️  Could not load model.pkl: {e}")
        print("📊 Using hardcoded coefficients instead")
else:
    print("📊 No model.pkl found - using hardcoded coefficients")
    print("💡 Run 'python train_model.py' to train and save a model")


@app.get("/health")
def health() -> tuple[dict, int]:
    return {"status": "ok"}, 200


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    required_fields = [
        "pclass",
        "sex",
        "age",
        "sibsp",
        "parch",
        "fare",
        "embarked",
    ]

    missing = [f for f in required_fields if f not in payload]
    if missing:
        return (
            jsonify({"error": "Missing fields", "missing": missing}),
            400,
        )

    try:
        pclass = float(payload["pclass"])  # 1,2,3
        sex = float(payload["sex"])        # 0 female, 1 male
        age = float(payload["age"])        # years
        sibsp = float(payload["sibsp"])    # count
        parch = float(payload["parch"])    # count
        fare = float(payload["fare"])      # $ amount
        embarked = str(payload["embarked"]).upper()  # 'S' | 'C' | 'Q'
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid types in payload"}), 400

    embarked_C = 1.0 if embarked == "C" else 0.0
    embarked_Q = 1.0 if embarked == "Q" else 0.0
    # S is baseline

    # Use trained model if available, otherwise use coefficient-based prediction
    if MODEL is not None:
        # Prepare feature array: [Pclass, Sex, Age, SibSp, Parch, Fare, Embarked_C, Embarked_Q]
        features = [[pclass, sex, age, sibsp, parch, fare, embarked_C, embarked_Q]]
        prob_survived = MODEL.predict_proba(features)[0][1]  # Probability of class 1 (survived)
        survived = bool(prob_survived > 0.5)
    else:
        # Fallback to coefficient-based calculation
        z = (
            pclass * MODEL_COEFFICIENTS["Pclass"]
            + sex * MODEL_COEFFICIENTS["Sex"]
            + age * MODEL_COEFFICIENTS["Age"]
            + sibsp * MODEL_COEFFICIENTS["SibSp"]
            + parch * MODEL_COEFFICIENTS["Parch"]
            + fare * MODEL_COEFFICIENTS["Fare"]
            + embarked_C * MODEL_COEFFICIENTS["Embarked_C"]
            + embarked_Q * MODEL_COEFFICIENTS["Embarked_Q"]
            + MODEL_INTERCEPT
        )
        from math import exp
        prob_survived = 1.0 / (1.0 + exp(-z))
        survived = bool(prob_survived > 0.5)

    return jsonify(
        {
            "probability": prob_survived,
            "survived": survived,
            "inputs": {
                "pclass": pclass,
                "sex": sex,
                "age": age,
                "sibsp": sibsp,
                "parch": parch,
                "fare": fare,
                "embarked": embarked,
            },
        }
    )


if __name__ == "__main__":
    # Allow overriding port via environment variable to avoid conflicts
    port = int(os.getenv("PORT", "5002"))
    app.run(host="0.0.0.0", port=port, debug=True)
