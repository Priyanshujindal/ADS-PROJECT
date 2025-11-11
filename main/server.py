from __future__ import annotations

from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
# Allow all origins for simplicity in local dev (serving index via http server)
CORS(app, resources={r"/*": {"origins": "*"}})


# Logistic Regression coefficients (same as in the previous frontend logic)
MODEL_COEFFICIENTS = {
    "Pclass": -0.9161,
    "Sex": -2.5714,
    "Age": -0.0345,
    "SibSp": -0.3207,
    "Parch": -0.1018,
    "Fare": 0.0016,
    "Embarked_C": 0.5824,
    "Embarked_Q": 0.3542,
    # Embarked_S is the base category
}
MODEL_INTERCEPT = 3.5048


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

    # Sigmoid
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
    # Default Flask dev server on port 5000
    app.run(host="127.0.0.1", port=5000, debug=True)


