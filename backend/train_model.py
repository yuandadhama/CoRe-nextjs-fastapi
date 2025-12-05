import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from joblib import dump

df = pd.read_csv("dataset.csv")

# Encode semua data kategori
label_encoders = {}
for col in ["interest", "career_goal", "recommendation"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Features
X = df[["math", "science", "english", "interest", "career_goal"]]

# Target
y = df["recommendation"]

# Train model
model = DecisionTreeClassifier()
model.fit(X, y)

# Save model + label encoders
dump(model, "decision_tree.joblib")
dump(label_encoders, "encoders.joblib")

print("Model trained successfully!")
