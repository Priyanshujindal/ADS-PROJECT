"""
Train a Logistic Regression model on the Titanic dataset and save it.
Run this script to generate model.pkl
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Check if train.csv exists
if not os.path.exists('train.csv'):
    print("ERROR: train.csv not found!")
    print("Please download the Titanic dataset from Kaggle:")
    print("https://www.kaggle.com/c/titanic/data")
    print("\nPlace train.csv in the project root directory.")
    exit(1)

# Load data
print("Loading data...")
df = pd.read_csv('train.csv')

# Preprocessing
print("Preprocessing data...")
# Fill missing ages with median
df['Age'].fillna(df['Age'].median(), inplace=True)
# Fill missing embarked with mode
df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)
# Fill missing fare with median
df['Fare'].fillna(df['Fare'].median(), inplace=True)

# Feature engineering
df['Sex'] = df['Sex'].map({'male': 1, 'female': 0})
df['Embarked_S'] = (df['Embarked'] == 'S').astype(int)
df['Embarked_C'] = (df['Embarked'] == 'C').astype(int)
df['Embarked_Q'] = (df['Embarked'] == 'Q').astype(int)

# Select features
features = ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked_C', 'Embarked_Q']
X = df[features].values
y = df['Survived'].values

# Train model
print("Training model...")
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X, y)

# Calculate accuracy
train_score = model.score(X, y)
print(f"Training accuracy: {train_score:.4f} ({train_score*100:.2f}%)")

# Save model
joblib.dump(model, 'model.pkl')
print("Model saved as model.pkl")

# Also save feature names for reference
import json
with open('model_features.json', 'w') as f:
    json.dump(features, f)
print("Feature names saved as model_features.json")

# Print coefficients for comparison
print("\nModel Coefficients:")
print("Intercept:", model.intercept_[0])
for i, feat in enumerate(features):
    print(f"{feat}: {model.coef_[0][i]:.4f}")

