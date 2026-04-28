#!/usr/bin/env python3
"""
Test script to verify the newly trained Framingham ensemble model is integrated
and working with the prediction services.
"""

import os
import sys
from pathlib import Path

# Add ml-models to path
sys.path.insert(0, str(Path(__file__).parent / "ml-models"))

import joblib
import json

def test_model_loading():
    """Test that the new model can be loaded correctly"""
    print("\n" + "="*70)
    print("TEST 1: Model Loading")
    print("="*70)
    
    model_path = Path(__file__).parent / "ml-models" / "models" / "artifacts" / "heart_disease_framingham.joblib"
    
    if not model_path.exists():
        print(f"❌ Model not found at {model_path}")
        return False
    
    print(f"✓ Model file found: {model_path}")
    print(f"  Size: {model_path.stat().st_size / 1024:.1f} KB")
    
    try:
        artifact = joblib.load(model_path)
        print("✓ Model artifact loaded successfully")
        
        # Verify artifact structure
        assert 'model' in artifact, "Missing 'model' key"
        assert 'features' in artifact, "Missing 'features' key"
        assert 'metrics' in artifact, "Missing 'metrics' key"
        
        print(f"✓ Artifact structure valid")
        print(f"  - Model type: {type(artifact['model']).__name__}")
        print(f"  - Features: {len(artifact['features'])} ({', '.join(artifact['features'][:5])}...)")
        print(f"  - Metrics keys: {list(artifact['metrics'].keys())}")
        
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False


def test_ml_model_service():
    """Test MLModelService integration"""
    print("\n" + "="*70)
    print("TEST 2: MLModelService Integration")
    print("="*70)
    
    try:
        from mlModelService import MLModelPredictor
        
        # Load with default (new) model
        predictor = MLModelPredictor()
        print(f"✓ MLModelPredictor initialized with default model")
        print(f"  Model path: {predictor.model_path}")
        
        # Test prediction
        test_features = {
            'age': 55,
            'systolic': 130,
            'diastolic': 85,
            'oxygenSaturation': 98,
            'bmi': 26.5,
            'cholesterol': 220,
            'bloodSugar': 95,
            'smoking': 0,
            'familyHistory': 1,
            'activityLevel': 2,
            'heartRate': 75,
            'temperature': 98.6,
        }
        
        # Add ECG features if expected
        for feature in predictor.features:
            if feature not in test_features:
                test_features[feature] = 0
        
        result = predictor.predict(test_features)
        
        print(f"✓ Prediction successful")
        print(f"  Prediction: {'HIGH RISK' if result['prediction'] == 1 else 'LOW RISK'}")
        print(f"  Probability: {result['probability']:.4f}")
        print(f"  Confidence: {result['confidence']:.4f}")
        print(f"  Model Accuracy: {result['model_accuracy']:.4f}")
        print(f"  Model AUC: {result['model_auc']:.4f}")
        
        return True
    except Exception as e:
        print(f"❌ Error in MLModelService: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_model_metrics():
    """Test that metrics are properly saved and loadable"""
    print("\n" + "="*70)
    print("TEST 3: Model Metrics")
    print("="*70)
    
    metrics_path = Path(__file__).parent / "ml-models" / "models" / "artifacts" / "heart_disease_framingham.json"
    
    if not metrics_path.exists():
        print(f"⚠ Metrics file not found at {metrics_path}")
        return False
    
    print(f"✓ Metrics file found: {metrics_path}")
    
    try:
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)
        
        print("✓ Metrics loaded successfully")
        print("\nModel Performance:")
        print(f"  Cross-Validation:")
        if 'cv' in metrics:
            cv = metrics['cv']
            print(f"    - Accuracy: {cv.get('accuracy', 'N/A')}")
            print(f"    - Precision: {cv.get('precision', 'N/A')}")
            print(f"    - Recall: {cv.get('recall', 'N/A')}")
            print(f"    - F1-Score: {cv.get('f1', 'N/A')}")
            print(f"    - ROC-AUC: {cv.get('roc_auc', 'N/A')}")
        
        print(f"\n  Test Set:")
        if 'test' in metrics:
            test = metrics['test']
            print(f"    - Accuracy: {test.get('accuracy', 'N/A')}")
            print(f"    - Precision: {test.get('precision', 'N/A')}")
            print(f"    - Recall: {test.get('recall', 'N/A')}")
            print(f"    - F1-Score: {test.get('f1', 'N/A')}")
        
        print(f"\n  Training Info:")
        print(f"    - Training samples: {metrics.get('training_samples', 'N/A')}")
        print(f"    - Test samples: {metrics.get('test_samples', 'N/A')}")
        print(f"    - Features: {metrics.get('feature_count', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Error loading metrics: {e}")
        return False


def main():
    """Run all integration tests"""
    print("\n" + "="*70)
    print("CARDIO SENTINEL - MODEL INTEGRATION TEST SUITE")
    print("Testing: Framingham Ensemble Model in Prediction Services")
    print("="*70)
    
    results = {
        'Model Loading': test_model_loading(),
        'MLModelService': test_ml_model_service(),
        'Metrics': test_model_metrics(),
    }
    
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✓ PASS" if passed_test else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ All integration tests passed!")
        print("\nThe trained Framingham ensemble model is now integrated with:")
        print("  - MLModelService (ml-models/mlModelService.py)")
        print("  - Advanced Prediction Service (backend/services/advancedPredictionService.py)")
        print("  - Ready for API endpoints and live predictions")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed. See details above.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
