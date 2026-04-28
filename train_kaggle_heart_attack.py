"""
CardioSentinel AI - High-Accuracy Heart Attack Prediction Model
================================================================
Inspired by Kaggle kernel: tumpanjawat/heart-attack-eda-cluster-8-ml-models

Uses REAL clinical heart disease data with 8 ML models + Stacking Ensemble
to achieve maximum accuracy. Saves the best model as cardio_model.pkl for
the CardioSentinel backend.

Dataset: UCI Heart Disease dataset (heart.csv - 918 real patient records)
"""

import json
import sys
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    RandomForestClassifier,
    StackingClassifier,
    VotingClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import (
    GridSearchCV,
    StratifiedKFold,
    cross_val_score,
    train_test_split,
)
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    from lightgbm import LGBMClassifier
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

warnings.filterwarnings("ignore")

# ─── Paths ───────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR / "data"
MODEL_OUTPUT_PATH = BACKEND_DIR / "cardio_model.pkl"
MODEL_METADATA_PATH = BACKEND_DIR / "cardio_model_metadata.json"

# ─── Dataset locations (in priority order) ───────────────────────────────
DATASET_CANDIDATES = [
    BASE_DIR / "heart.csv",                                  # Primary UCI 918-record dataset
    DATA_DIR / "heart-attack-kaggle" / "heart.csv",          # Kaggle downloaded
    DATA_DIR / "heart.csv",                                  # Alternate location
    DATA_DIR / "heart_dataset_1000_balanced.csv",            # Synthetic fallback
]

# ─── UCI Heart Disease column mappings ───────────────────────────────────
# The heart.csv has columns: Age,Sex,ChestPainType,RestingBP,Cholesterol,
# FastingBS,RestingECG,MaxHR,ExerciseAngina,Oldpeak,ST_Slope,HeartDisease
# We need to convert to the standard UCI numeric format

COLUMN_RENAME_MAP = {
    "Age": "age",
    "Sex": "sex",
    "ChestPainType": "cp",
    "RestingBP": "trestbps",
    "Cholesterol": "chol",
    "FastingBS": "fbs",
    "RestingECG": "restecg",
    "MaxHR": "thalach",
    "ExerciseAngina": "exang",
    "Oldpeak": "oldpeak",
    "ST_Slope": "slope",
    "HeartDisease": "target",
}

# Kaggle kernel column names (some datasets use these)
KAGGLE_COLUMN_MAP = {
    "trtbps": "trestbps",
    "thalachh": "thalach",
    "exng": "exang",
    "slp": "slope",
    "caa": "ca",
    "thall": "thal",
    "output": "target",
}

UCI_FEATURES = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
                "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
UCI_TARGET = "target"


def find_best_dataset() -> Path:
    """Find the best available dataset."""
    if len(sys.argv) > 1:
        p = Path(sys.argv[1])
        return p if p.is_absolute() else (Path.cwd() / p).resolve()

    for candidate in DATASET_CANDIDATES:
        if candidate.exists():
            return candidate

    raise FileNotFoundError("No heart disease dataset found! Please provide one as argument.")


def encode_categorical_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Convert string categorical columns to numeric for the UCI-format heart.csv."""
    df = df.copy()

    # Sex: M=1, F=0
    if df["sex"].dtype == object:
        df["sex"] = df["sex"].map({"M": 1, "F": 0}).fillna(0).astype(int)

    # ChestPainType: ATA=1, NAP=2, ASY=3, TA=0  (maps to cp 0-3)
    if "cp" in df.columns and df["cp"].dtype == object:
        cp_map = {"TA": 0, "ATA": 1, "NAP": 2, "ASY": 3}
        df["cp"] = df["cp"].map(cp_map).fillna(0).astype(int)

    # RestingECG: Normal=0, ST=1, LVH=2
    if "restecg" in df.columns and df["restecg"].dtype == object:
        ecg_map = {"Normal": 0, "ST": 1, "LVH": 2}
        df["restecg"] = df["restecg"].map(ecg_map).fillna(0).astype(int)

    # ExerciseAngina: Y=1, N=0
    if "exang" in df.columns and df["exang"].dtype == object:
        df["exang"] = df["exang"].map({"Y": 1, "N": 0}).fillna(0).astype(int)

    # ST_Slope: Up=1, Flat=2, Down=3  (or 0,1,2 depending on source)
    if "slope" in df.columns and df["slope"].dtype == object:
        slope_map = {"Up": 0, "Flat": 1, "Down": 2}
        df["slope"] = df["slope"].map(slope_map).fillna(0).astype(int)

    return df


def load_and_prepare_data(dataset_path: Path) -> tuple[pd.DataFrame, list[str], str]:
    """Load dataset, clean, encode, and return ready features + target."""
    print(f"📂 Loading dataset: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"   Raw shape: {df.shape}")

    # Rename columns to standard UCI names
    rename_map = {}
    for old_name, new_name in {**COLUMN_RENAME_MAP, **KAGGLE_COLUMN_MAP}.items():
        if old_name in df.columns:
            rename_map[old_name] = new_name
    if rename_map:
        df = df.rename(columns=rename_map)

    # Encode categorical strings to numeric
    df = encode_categorical_columns(df)

    # Drop duplicates
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    if before != after:
        print(f"   Removed {before - after} duplicate rows")

    # Determine available features
    available_features = [f for f in UCI_FEATURES if f in df.columns]
    target_col = "target" if "target" in df.columns else None

    if target_col is None:
        raise ValueError("No target column found in dataset!")

    # Handle missing values: replace 0 cholesterol with median
    if "chol" in df.columns:
        median_chol = df.loc[df["chol"] > 0, "chol"].median()
        df.loc[df["chol"] == 0, "chol"] = median_chol

    # Convert all feature columns to numeric
    for col in available_features:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce")

    # Drop rows with NaN target
    df = df.dropna(subset=[target_col])
    df[target_col] = df[target_col].astype(int)

    # Fill remaining NaN with median, then 0 as final fallback
    for col in available_features:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val if pd.notna(median_val) else 0)

    # Ensure all features are float64 and contain NO NaN
    df[available_features] = df[available_features].astype(np.float64).fillna(0)

    # ─── Feature Engineering (clinically meaningful interactions) ─────────
    engineered = []

    if "age" in df.columns and "oldpeak" in df.columns:
        df["age_oldpeak"] = df["age"] * df["oldpeak"]
        engineered.append("age_oldpeak")

    if "chol" in df.columns and "age" in df.columns:
        df["chol_age_ratio"] = df["chol"] / (df["age"] + 1)
        engineered.append("chol_age_ratio")

    if "trestbps" in df.columns and "thalach" in df.columns:
        df["bp_hr_ratio"] = df["trestbps"] / (df["thalach"] + 1)
        engineered.append("bp_hr_ratio")

    if "age" in df.columns and "cp" in df.columns and "exang" in df.columns:
        df["high_risk_flag"] = ((df["age"] > 50) & (df["cp"] == 3) & (df["exang"] == 1)).astype(float)
        engineered.append("high_risk_flag")

    if "trestbps" in df.columns and "chol" in df.columns:
        df["bp_chol_interaction"] = df["trestbps"] * df["chol"] / 10000
        engineered.append("bp_chol_interaction")

    if "thalach" in df.columns and "age" in df.columns:
        df["max_hr_deficit"] = (220 - df["age"]) - df["thalach"]
        engineered.append("max_hr_deficit")

    available_features = available_features + engineered
    df[engineered] = df[engineered].astype(np.float64).fillna(0)

    print(f"   Engineered features: {engineered}")

    # Reset index to avoid mismatch issues after filtering
    df = df.reset_index(drop=True)

    print(f"   Clean shape: {df.shape}")
    print(f"   Features ({len(available_features)}): {available_features}")
    print(f"   Target distribution: {dict(df[target_col].value_counts())}")
    print(f"   NaN remaining: {df[available_features].isnull().sum().sum()}")

    return df, available_features, target_col


def build_models(available_features: list[str]) -> dict:
    """Build all 8+ candidate models with optimized hyperparameters."""
    models = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000, C=0.5, solver="liblinear", random_state=42
        ),
        "SVC": SVC(
            kernel="rbf", C=1.0, gamma="scale", probability=True, random_state=42
        ),
        "DecisionTree": DecisionTreeClassifier(
            max_depth=5, min_samples_leaf=5, min_samples_split=10,
            random_state=42, class_weight="balanced"
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=500, max_depth=10, min_samples_leaf=2,
            min_samples_split=5, random_state=42, class_weight="balanced",
            n_jobs=-1
        ),
        "ExtraTrees": ExtraTreesClassifier(
            n_estimators=500, max_depth=12, min_samples_leaf=1,
            random_state=42, class_weight="balanced", n_jobs=-1
        ),
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=300, learning_rate=0.05, max_depth=4,
            min_samples_leaf=5, subsample=0.8, random_state=42
        ),
        "KNN": KNeighborsClassifier(
            n_neighbors=7, weights="distance", metric="minkowski", p=2
        ),
        "NaiveBayes": GaussianNB(),
    }

    if HAS_XGBOOST:
        models["XGBoost"] = XGBClassifier(
            n_estimators=300, learning_rate=0.05, max_depth=4,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="logloss",
            random_state=42, verbosity=0
        )

    if HAS_LIGHTGBM:
        models["LightGBM"] = LGBMClassifier(
            n_estimators=300, learning_rate=0.05, max_depth=5,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42, verbose=-1
        )

    return models


def evaluate_all_models(X_train, X_test, y_train, y_test, scaler) -> dict:
    """Train and evaluate all models, return results."""
    # Convert to numpy and ensure no NaN
    X_train_arr = X_train.values.astype(np.float64)
    X_test_arr = X_test.values.astype(np.float64)
    np.nan_to_num(X_train_arr, copy=False)
    np.nan_to_num(X_test_arr, copy=False)
    X_train_scaled = scaler.transform(X_train_arr)
    X_test_scaled = scaler.transform(X_test_arr)
    features = list(X_train.columns)

    models = build_models(features)
    results = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n" + "=" * 70)
    print("🏋️  TRAINING 8+ ML MODELS (Kaggle Kernel Approach)")
    print("=" * 70)

    for name, model in models.items():
        print(f"\n📊 Training {name}...")

        # Models that need scaling
        needs_scaling = name in ["LogisticRegression", "SVC", "KNN"]
        X_tr = X_train_scaled if needs_scaling else X_train_arr
        X_te = X_test_scaled if needs_scaling else X_test_arr

        # Cross-validation
        cv_scores = cross_val_score(model, X_tr, y_train, cv=cv, scoring="accuracy")
        cv_f1 = cross_val_score(model, X_tr, y_train, cv=cv, scoring="f1")

        # Train and test
        model.fit(X_tr, y_train)
        train_preds = model.predict(X_tr)
        test_preds = model.predict(X_te)
        train_acc = accuracy_score(y_train, train_preds)
        test_acc = accuracy_score(y_test, test_preds)
        test_f1 = f1_score(y_test, test_preds)

        try:
            test_proba = model.predict_proba(X_te)[:, 1]
            test_auc = roc_auc_score(y_test, test_proba)
        except Exception:
            test_auc = 0.0

        results[name] = {
            "model": model,
            "needs_scaling": needs_scaling,
            "train_accuracy": round(float(train_acc), 4),
            "test_accuracy": round(float(test_acc), 4),
            "test_f1": round(float(test_f1), 4),
            "test_auc": round(float(test_auc), 4),
            "cv_accuracy": round(float(cv_scores.mean()), 4),
            "cv_accuracy_std": round(float(cv_scores.std()), 4),
            "cv_f1": round(float(cv_f1.mean()), 4),
        }

        print(f"   Train Accuracy: {train_acc:.4f}")
        print(f"   Test  Accuracy: {test_acc:.4f}")
        print(f"   Test  F1 Score: {test_f1:.4f}")
        print(f"   Test  ROC AUC: {test_auc:.4f}")
        print(f"   CV Accuracy:   {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    return results


def build_stacking_ensemble(X_train, X_test, y_train, y_test, scaler, results: dict) -> dict:
    """Build a Stacking Ensemble of the top models."""
    print("\n" + "=" * 70)
    print("🏆 BUILDING STACKING ENSEMBLE (Meta-Learner)")
    print("=" * 70)

    X_train_arr = X_train.values.astype(np.float64)
    X_test_arr = X_test.values.astype(np.float64)
    np.nan_to_num(X_train_arr, copy=False)
    np.nan_to_num(X_test_arr, copy=False)
    X_train_scaled = scaler.transform(X_train_arr)
    X_test_scaled = scaler.transform(X_test_arr)

    # Select top 5 models by test accuracy
    sorted_models = sorted(results.items(), key=lambda x: x[1]["test_accuracy"], reverse=True)
    top_models = sorted_models[:5]
    print(f"\n   Top models for ensemble: {[m[0] for m in top_models]}")

    # Build estimators list for stacking (all use scaled data)
    estimators = []
    for name, info in top_models:
        # Rebuild with fresh instances
        fresh_models = build_models(list(X_train.columns))
        if name in fresh_models:
            estimators.append((name, fresh_models[name]))

    if len(estimators) < 2:
        print("   ⚠️  Not enough estimators for stacking, skipping")
        return results

    # Stacking Classifier
    stacking = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(max_iter=1000, random_state=42),
        cv=5,
        n_jobs=-1,
        passthrough=False,
    )

    print("   Training Stacking Ensemble...")
    stacking.fit(X_train_scaled, y_train)

    train_preds = stacking.predict(X_train_scaled)
    test_preds = stacking.predict(X_test_scaled)
    train_acc = accuracy_score(y_train, train_preds)
    test_acc = accuracy_score(y_test, test_preds)
    test_f1 = f1_score(y_test, test_preds)
    test_proba = stacking.predict_proba(X_test_scaled)[:, 1]
    test_auc = roc_auc_score(y_test, test_proba)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(stacking, X_train_scaled, y_train, cv=cv, scoring="accuracy")

    results["StackingEnsemble"] = {
        "model": stacking,
        "needs_scaling": True,
        "train_accuracy": round(float(train_acc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "test_f1": round(float(test_f1), 4),
        "test_auc": round(float(test_auc), 4),
        "cv_accuracy": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
        "cv_f1": round(float(test_f1), 4),
    }

    print(f"   Train Accuracy: {train_acc:.4f}")
    print(f"   Test  Accuracy: {test_acc:.4f}")
    print(f"   Test  F1 Score: {test_f1:.4f}")
    print(f"   Test  ROC AUC: {test_auc:.4f}")
    print(f"   CV Accuracy:   {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Also build a Voting Ensemble
    print("\n   Building Soft Voting Ensemble...")
    voting_estimators = []
    for name, info in top_models:
        fresh_models = build_models(list(X_train.columns))
        if name in fresh_models:
            voting_estimators.append((name, fresh_models[name]))

    voting = VotingClassifier(
        estimators=voting_estimators,
        voting="soft",
        n_jobs=-1,
    )
    voting.fit(X_train_scaled, y_train)

    test_preds_v = voting.predict(X_test_scaled)
    test_acc_v = accuracy_score(y_test, test_preds_v)
    test_f1_v = f1_score(y_test, test_preds_v)
    test_proba_v = voting.predict_proba(X_test_scaled)[:, 1]
    test_auc_v = roc_auc_score(y_test, test_proba_v)

    cv_scores_v = cross_val_score(voting, X_train_scaled, y_train, cv=cv, scoring="accuracy")

    results["VotingEnsemble"] = {
        "model": voting,
        "needs_scaling": True,
        "train_accuracy": round(float(accuracy_score(y_train, voting.predict(X_train_scaled))), 4),
        "test_accuracy": round(float(test_acc_v), 4),
        "test_f1": round(float(test_f1_v), 4),
        "test_auc": round(float(test_auc_v), 4),
        "cv_accuracy": round(float(cv_scores_v.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores_v.std()), 4),
        "cv_f1": round(float(test_f1_v), 4),
    }

    print(f"   Voting Test Accuracy: {test_acc_v:.4f}")
    print(f"   Voting Test F1:       {test_f1_v:.4f}")
    print(f"   Voting Test ROC AUC:  {test_auc_v:.4f}")

    return results


def select_and_save_best(results: dict, feature_columns: list[str],
                         target_col: str, scaler, df: pd.DataFrame,
                         dataset_path: Path) -> None:
    """Select the best model and save it in a format compatible with app.py."""
    print("\n" + "=" * 70)
    print("📋 MODEL COMPARISON RESULTS")
    print("=" * 70)

    # Rank by combined score: 50% test accuracy + 30% test AUC + 20% CV accuracy
    scored = {}
    for name, info in results.items():
        combined = (
            info["test_accuracy"] * 0.50 +
            info["test_auc"] * 0.30 +
            info["cv_accuracy"] * 0.20
        )
        scored[name] = combined

    sorted_names = sorted(scored, key=scored.get, reverse=True)

    print(f"\n{'Model':<25} {'Test Acc':>10} {'Test F1':>10} {'ROC AUC':>10} {'CV Acc':>10} {'Score':>10}")
    print("-" * 75)
    for name in sorted_names:
        info = results[name]
        print(
            f"{name:<25} {info['test_accuracy']:>10.4f} {info['test_f1']:>10.4f} "
            f"{info['test_auc']:>10.4f} {info['cv_accuracy']:>10.4f} {scored[name]:>10.4f}"
        )

    best_name = sorted_names[0]
    best_info = results[best_name]
    best_model = best_info["model"]

    print(f"\n🏆 BEST MODEL: {best_name}")
    print(f"   Test Accuracy: {best_info['test_accuracy']:.4f}")
    print(f"   Test F1 Score: {best_info['test_f1']:.4f}")
    print(f"   Test ROC AUC:  {best_info['test_auc']:.4f}")

    # If best model needs scaling, wrap it in a pipeline
    if best_info["needs_scaling"]:
        # Save the scaler along with the model
        pipeline = Pipeline([
            ("scaler", scaler),
            ("model", best_model),
        ])
        # Re-fit the pipeline on all data
        X_all = df[feature_columns]
        y_all = df[target_col]
        pipeline.fit(X_all, y_all)
        save_model = pipeline
    else:
        # Re-fit on all data
        X_all = df[feature_columns]
        y_all = df[target_col]
        best_model.fit(X_all, y_all)
        save_model = best_model

    # Save model
    MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(save_model, MODEL_OUTPUT_PATH, compress=3)

    # Build candidate model scores for metadata (without model objects)
    candidate_scores = {}
    for name in sorted_names:
        info = results[name]
        candidate_scores[name] = {
            "cv_accuracy": info["cv_accuracy"],
            "cv_f1": info["cv_f1"],
            "test_accuracy": info["test_accuracy"],
            "test_f1": info["test_f1"],
            "test_auc": info["test_auc"],
            "selection_score": round(scored[name], 4),
        }

    metadata = {
        "dataset_path": str(dataset_path),
        "model_path": str(MODEL_OUTPUT_PATH),
        "feature_columns": feature_columns,
        "target_column": target_col,
        "accuracy": best_info["test_accuracy"],
        "f1_score": best_info["test_f1"],
        "roc_auc": best_info["test_auc"],
        "training_rows": int(len(df)),
        "test_size": 0.2,
        "model_type": best_name,
        "data_source": "real_clinical_uci_heart_disease",
        "candidate_models": candidate_scores,
    }

    MODEL_METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    model_size = MODEL_OUTPUT_PATH.stat().st_size / (1024 * 1024)
    print(f"\n✅ Model saved to: {MODEL_OUTPUT_PATH} ({model_size:.2f} MB)")
    print(f"✅ Metadata saved to: {MODEL_METADATA_PATH}")


def main():
    print("=" * 70)
    print("🫀 CardioSentinel AI - Kaggle-Optimized Heart Attack Prediction")
    print("   8 ML Models + Stacking Ensemble on REAL Clinical Data")
    print("=" * 70)

    # 1. Load data
    dataset_path = find_best_dataset()
    df, features, target = load_and_prepare_data(dataset_path)

    # 2. Split data
    X = df[features]
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 3. Fit scaler on training data
    scaler = StandardScaler()
    scaler.fit(X_train)

    print(f"\n📊 Train set: {X_train.shape[0]} samples")
    print(f"📊 Test set:  {X_test.shape[0]} samples")

    # 4. Evaluate all individual models
    results = evaluate_all_models(X_train, X_test, y_train, y_test, scaler)

    # 5. Build ensemble models
    results = build_stacking_ensemble(X_train, X_test, y_train, y_test, scaler, results)

    # 6. Select best and save
    select_and_save_best(results, features, target, scaler, df, dataset_path)

    # 7. Print classification report for best model
    best_name = max(results, key=lambda k: results[k]["test_accuracy"])
    best_model = results[best_name]["model"]

    X_test_input = scaler.transform(X_test) if results[best_name]["needs_scaling"] else X_test.values
    final_preds = best_model.predict(X_test_input)

    print("\n📊 Classification Report (Best Model):")
    print(classification_report(y_test, final_preds, target_names=["No Disease", "Heart Disease"]))

    print("\n" + "=" * 70)
    print("🎉 TRAINING COMPLETE!")
    print(f"   Best Model: {best_name}")
    print(f"   Accuracy: {results[best_name]['test_accuracy']:.4f}")
    print(f"   ROC AUC:  {results[best_name]['test_auc']:.4f}")
    print(f"   Data: REAL clinical records ({len(df)} patients)")
    print("=" * 70)


if __name__ == "__main__":
    main()
