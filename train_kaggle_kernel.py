#!/usr/bin/env python3
"""
🏥 CARDIO-SENTINEL: Kaggle Kernel Heart Disease Training
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Train heart disease prediction model using Kaggle kernel approach
Optimized for Cardio-Sentinel with live wearable data integration

Based on: farzadnekouei/heart-disease-prediction
Modified for: Cardio-Sentinel real-time ML engine
"""

import warnings
warnings.filterwarnings('ignore')

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

# ML & Preprocessing
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report, accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, roc_curve
)
from scipy.stats import boxcox
import matplotlib.pyplot as plt
import seaborn as sns

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

DATA_PATH = Path('heart.csv')
OUTPUT_DIR = Path('trained_models')
OUTPUT_DIR.mkdir(exist_ok=True)

MODELS_TO_TRAIN = ['decision_tree', 'random_forest', 'knn', 'svm', 'gradient_boosting']
RANDOM_STATE = 42
TEST_SIZE = 0.2

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: LOAD & EXPLORE DATA
# ═══════════════════════════════════════════════════════════════════════════

def load_data(filepath):
    """Load heart disease dataset"""
    print(f'\n📂 Loading data from: {filepath}')
    try:
        df = pd.read_csv(filepath)
        print(f'✅ Data loaded successfully')
        print(f'   Shape: {df.shape}')
        print(f'   Columns: {list(df.columns)}')
        return df
    except FileNotFoundError:
        print(f'❌ File not found: {filepath}')
        return None


def explore_data(df):
    """Explore dataset statistics"""
    print(f'\n📊 Dataset Overview')
    print('━' * 60)
    print(f'Shape: {df.shape}')
    print(f'\nFirst rows:\n{df.head(3)}')
    print(f'\nData types:\n{df.dtypes}')
    print(f'\nMissing values:\n{df.isnull().sum()}')
    print(f'\nBasic statistics:\n{df.describe()}')
    
    # Target distribution
    if 'target' in df.columns:
        print(f'\nTarget distribution:\n{df["target"].value_counts()}')
        print(f'\nTarget class balance:')
        print(f'  Negative: {(df["target"]==0).sum()} ({(df["target"]==0).sum()/len(df)*100:.1f}%)')
        print(f'  Positive: {(df["target"]==1).sum()} ({(df["target"]==1).sum()/len(df)*100:.1f}%)')


# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: DATA PREPROCESSING
# ═══════════════════════════════════════════════════════════════════════════

def preprocess_data(df):
    """Preprocess and clean data"""
    print(f'\n🔧 Preprocessing Data')
    print('━' * 60)
    
    # Separate target
    if 'target' in df.columns:
        X = df.drop('target', axis=1)
        y = df['target']
    else:
        print('⚠️  No "target" column found, using last column')
        X = df.iloc[:, :-1]
        y = df.iloc[:, -1]
    
    # Handle missing values
    print('📍 Handling missing values...')
    missing_cols = X.columns[X.isnull().any()].tolist()
    if missing_cols:
        print(f'  Columns with missing values: {missing_cols}')
        X = X.fillna(X.mean(numeric_only=True))
    
    # Remove low variance features (if any)
    initial_cols = len(X.columns)
    X = X.loc[:, X.std() > 0]
    if len(X.columns) < initial_cols:
        print(f'  Removed {initial_cols - len(X.columns)} zero-variance columns')
    
    # Identify numeric and categorical columns
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
    
    print(f'✅ Numeric columns: {len(numeric_cols)}')
    print(f'✅ Categorical columns: {len(categorical_cols)}')
    
    # Encode categorical variables
    if categorical_cols:
        print(f'🔤 Encoding categorical columns: {categorical_cols}')
        for col in categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
    
    print(f'✅ Preprocessing complete')
    print(f'   X shape: {X.shape}')
    print(f'   y shape: {y.shape}')
    
    return X, y


# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: TRAIN-TEST SPLIT
# ═══════════════════════════════════════════════════════════════════════════

def split_data(X, y, test_size=TEST_SIZE):
    """Split data into train and test sets"""
    print(f'\n✂️  Train-Test Split')
    print('━' * 60)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=RANDOM_STATE, stratify=y
    )
    
    print(f'✅ Training set: {X_train.shape}')
    print(f'✅ Test set: {X_test.shape}')
    print(f'   Train/Test ratio: {len(X_train)}/{len(X_test)}')
    
    return X_train, X_test, y_train, y_test


# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: MODEL TRAINING
# ═══════════════════════════════════════════════════════════════════════════

def train_decision_tree(X_train, X_test, y_train, y_test):
    """Train Decision Tree classifier"""
    print(f'\n🌳 Decision Tree Classifier')
    print('━' * 60)
    
    # Base model
    dt = DecisionTreeClassifier(random_state=RANDOM_STATE)
    
    # Hyperparameter tuning
    param_grid = {
        'max_depth': [3, 5, 7, 10, 15],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'criterion': ['gini', 'entropy']
    }
    
    print('🔍 Hyperparameter tuning...')
    grid_search = GridSearchCV(dt, param_grid, cv=5, scoring='recall', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    best_dt = grid_search.best_estimator_
    y_pred = best_dt.predict(X_test)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
    }
    
    print(f'✅ Best parameters: {grid_search.best_params_}')
    print(f'📊 Metrics:')
    for metric, value in metrics.items():
        print(f'   {metric.capitalize()}: {value:.4f}')
    
    return best_dt, metrics


def train_random_forest(X_train, X_test, y_train, y_test):
    """Train Random Forest classifier"""
    print(f'\n🌲 Random Forest Classifier')
    print('━' * 60)
    
    rf = RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=-1)
    
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [10, 15, 20],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    
    print('🔍 Hyperparameter tuning...')
    grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='recall', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    best_rf = grid_search.best_estimator_
    y_pred = best_rf.predict(X_test)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
    }
    
    print(f'✅ Best parameters: {grid_search.best_params_}')
    print(f'📊 Metrics:')
    for metric, value in metrics.items():
        print(f'   {metric.capitalize()}: {value:.4f}')
    
    # Feature importance
    feature_importance = dict(zip(X_train.columns, best_rf.feature_importances_))
    top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]
    print(f'\n🎯 Top 5 Important Features:')
    for feat, imp in top_features:
        print(f'   {feat}: {imp:.4f}')
    
    metrics['feature_importance'] = feature_importance
    return best_rf, metrics


def train_knn(X_train, X_test, y_train, y_test):
    """Train KNN classifier"""
    print(f'\n👥 K-Nearest Neighbors Classifier')
    print('━' * 60)
    
    # Scale data for KNN
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    knn = KNeighborsClassifier()
    
    param_grid = {
        'n_neighbors': [3, 5, 7, 9, 11, 15],
        'metric': ['euclidean', 'manhattan'],
        'weights': ['uniform', 'distance']
    }
    
    print('🔍 Hyperparameter tuning...')
    grid_search = GridSearchCV(knn, param_grid, cv=5, scoring='recall', n_jobs=-1)
    grid_search.fit(X_train_scaled, y_train)
    
    best_knn = grid_search.best_estimator_
    y_pred = best_knn.predict(X_test_scaled)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
        'scaler': scaler
    }
    
    print(f'✅ Best parameters: {grid_search.best_params_}')
    print(f'📊 Metrics:')
    for metric, value in metrics.items():
        if metric != 'scaler':
            print(f'   {metric.capitalize()}: {value:.4f}')
    
    return best_knn, metrics


def train_svm(X_train, X_test, y_train, y_test):
    """Train SVM classifier"""
    print(f'\n🎯 Support Vector Machine Classifier')
    print('━' * 60)
    
    # Scale data for SVM
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    svm = SVC(random_state=RANDOM_STATE)
    
    param_grid = {
        'C': [0.1, 1, 10, 100],
        'kernel': ['linear', 'rbf'],
        'gamma': ['scale', 'auto']
    }
    
    print('🔍 Hyperparameter tuning...')
    grid_search = GridSearchCV(svm, param_grid, cv=5, scoring='recall', n_jobs=-1)
    grid_search.fit(X_train_scaled, y_train)
    
    best_svm = grid_search.best_estimator_
    y_pred = best_svm.predict(X_test_scaled)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
        'scaler': scaler
    }
    
    print(f'✅ Best parameters: {grid_search.best_params_}')
    print(f'📊 Metrics:')
    for metric, value in metrics.items():
        if metric != 'scaler':
            print(f'   {metric.capitalize()}: {value:.4f}')
    
    return best_svm, metrics


def train_gradient_boosting(X_train, X_test, y_train, y_test):
    """Train Gradient Boosting classifier"""
    print(f'\n📈 Gradient Boosting Classifier')
    print('━' * 60)
    
    gb = GradientBoostingClassifier(random_state=RANDOM_STATE)
    
    param_grid = {
        'n_estimators': [50, 100, 200],
        'learning_rate': [0.01, 0.05, 0.1],
        'max_depth': [3, 5, 7],
        'min_samples_split': [2, 5]
    }
    
    print('🔍 Hyperparameter tuning...')
    grid_search = GridSearchCV(gb, param_grid, cv=5, scoring='recall', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    best_gb = grid_search.best_estimator_
    y_pred = best_gb.predict(X_test)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
    }
    
    print(f'✅ Best parameters: {grid_search.best_params_}')
    print(f'📊 Metrics:')
    for metric, value in metrics.items():
        print(f'   {metric.capitalize()}: {value:.4f}')
    
    return best_gb, metrics


# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: SAVE MODELS
# ═══════════════════════════════════════════════════════════════════════════

def save_model(model, name, metrics):
    """Save trained model"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    path = OUTPUT_DIR / f'{name}_{timestamp}.joblib'
    
    joblib.dump({
        'model': model,
        'metrics': metrics,
        'timestamp': timestamp
    }, path)
    
    print(f'💾 Model saved to: {path}')
    return path


# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: COMPARISON & SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

def main():
    """Main training pipeline"""
    
    print('\n' + '='*60)
    print('  🏥 CARDIO-SENTINEL: Kaggle Kernel Training')
    print('='*60)
    
    # Load data
    df = load_data(DATA_PATH)
    if df is None:
        print('❌ Failed to load data')
        return
    
    explore_data(df)
    
    # Preprocess
    X, y = preprocess_data(df)
    X_train, X_test, y_train, y_test = split_data(X, y)
    
    # Train models
    results = {}
    
    print(f'\n🚀 Training Models')
    print('='*60)
    
    try:
        model_dt, metrics_dt = train_decision_tree(X_train, X_test, y_train, y_test)
        save_model(model_dt, 'decision_tree', metrics_dt)
        results['Decision Tree'] = metrics_dt
    except Exception as e:
        print(f'❌ Decision Tree failed: {str(e)}')
    
    try:
        model_rf, metrics_rf = train_random_forest(X_train, X_test, y_train, y_test)
        save_model(model_rf, 'random_forest', metrics_rf)
        results['Random Forest'] = metrics_rf
    except Exception as e:
        print(f'❌ Random Forest failed: {str(e)}')
    
    try:
        model_knn, metrics_knn = train_knn(X_train, X_test, y_train, y_test)
        save_model(model_knn, 'knn', metrics_knn)
        results['KNN'] = metrics_knn
    except Exception as e:
        print(f'❌ KNN failed: {str(e)}')
    
    try:
        model_svm, metrics_svm = train_svm(X_train, X_test, y_train, y_test)
        save_model(model_svm, 'svm', metrics_svm)
        results['SVM'] = metrics_svm
    except Exception as e:
        print(f'❌ SVM failed: {str(e)}')
    
    try:
        model_gb, metrics_gb = train_gradient_boosting(X_train, X_test, y_train, y_test)
        save_model(model_gb, 'gradient_boosting', metrics_gb)
        results['Gradient Boosting'] = metrics_gb
    except Exception as e:
        print(f'❌ Gradient Boosting failed: {str(e)}')
    
    # Summary
    print(f'\n📊 TRAINING SUMMARY')
    print('='*60)
    
    results_df = pd.DataFrame({
        model: {k: v for k, v in metrics.items() if k != 'feature_importance' and k != 'scaler'}
        for model, metrics in results.items()
    }).T
    
    print(results_df.to_string())
    
    # Save summary
    summary_path = OUTPUT_DIR / f'training_summary_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(summary_path, 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'models': results,
            'best_model': results_df['f1'].idxmax() if len(results_df) > 0 else None,
            'best_f1': float(results_df['f1'].max()) if len(results_df) > 0 else 0
        }, f, indent=2)
    
    print(f'\n✅ Training complete!')
    print(f'   Models saved to: {OUTPUT_DIR}')
    print(f'   Summary saved to: {summary_path}')
    
    if len(results_df) > 0:
        best_model = results_df['f1'].idxmax()
        best_f1 = results_df['f1'].max()
        print(f'\n🏆 Best Model: {best_model} (F1: {best_f1:.4f})')


if __name__ == '__main__':
    main()
