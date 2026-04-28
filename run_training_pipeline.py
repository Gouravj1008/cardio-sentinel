#!/usr/bin/env python3
"""
Cardio Sentinel ML Training Orchestrator

Complete training pipeline:
  1. Download datasets from Kaggle (Framingham, PTB-XL, Heart Failure, CVD 70K, UCI Cleveland)
  2. Extract ECG features from PTB-XL
  3. Integrate & merge all datasets
  4. Train ensemble model with cross-validation
  5. Validate on UCI Cleveland (industry benchmark)
  6. Save production model & metrics

Execution: python run_training_pipeline.py
"""

import sys
import subprocess
from pathlib import Path

# ============================================================================
# PIPELINE STAGES
# ============================================================================

PIPELINE_STAGES = [
    {
        "name": "Kaggle Setup",
        "script": "ml-models/download_kaggle_datasets.py",
        "description": "Download Tier 1 datasets from Kaggle (Framingham, PTB-XL, Heart Failure, CVD 70K, UCI Cleveland)"
    },
    {
        "name": "ECG Feature Extraction",
        "script": "ml-models/extract_ptbxl_features.py",
        "description": "Extract 12-lead ECG clinical features from PTB-XL (21,837 records)"
    },
    {
        "name": "Model Training",
        "script": "ml-models/train_framingham_pipeline.py",
        "description": "Train ensemble model on Framingham (backbone) + PTB-XL features, validate on UCI Cleveland"
    },
    {
        "name": "Live Dataset Build",
        "script": "ml-models/build_live_watch_report_dataset.py",
        "description": "Build larger live training dataset from wearable stream + report extraction + fallback CSV"
    },
    {
        "name": "Live Future Model Training",
        "script": "ml-models/train_real_future_heart_model.py",
        "description": "Train future-heart-disease model on real longitudinal Framingham data only"
    }
]


# ============================================================================
# ORCHESTRATION
# ============================================================================

def run_stage(stage_num: int, total_stages: int, script: str, description: str) -> bool:
    """
    Run a single pipeline stage.
    
    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'='*70}")
    print(f"STAGE {stage_num}/{total_stages}: {description}")
    print(f"{'='*70}\n")
    
    try:
        result = subprocess.run(
            [sys.executable, script],
            cwd=Path(__file__).parent,
            capture_output=False
        )
        
        if result.returncode == 0:
            print(f"\n✓ Stage {stage_num} completed successfully")
            return True
        else:
            print(f"\n✗ Stage {stage_num} failed with exit code {result.returncode}")
            return False
    
    except FileNotFoundError:
        print(f"\n✗ Script not found: {script}")
        return False
    except Exception as e:
        print(f"\n✗ Error running stage: {str(e)}")
        return False


def main():
    print("\n" + "="*70)
    print("CARDIO SENTINEL - ML TRAINING ORCHESTRATOR")
    print("="*70)
    print("\nStrategy:")
    print("  ✓ Backbone:    Framingham Heart Study (longitudinal CVD progression)")
    print("  ✓ Features:    PTB-XL ECG (21,837 clinical 12-lead records)")
    print("  ✓ Validation:  UCI Cleveland (industry benchmark)")
    print("  ✓ Innovation:  Live AQI + wearable sensor integration")
    print("  ✓ Upgrade:     Live watch + report extraction retraining")
    
    total_stages = len(PIPELINE_STAGES)
    failed_stages = []
    
    for idx, stage in enumerate(PIPELINE_STAGES, 1):
        success = run_stage(
            idx, total_stages,
            stage["script"],
            stage["description"]
        )
        
        if not success:
            failed_stages.append((idx, stage["name"]))
    
    # Summary
    print("\n" + "="*70)
    print("TRAINING PIPELINE SUMMARY")
    print("="*70)
    
    if failed_stages:
        print(f"\n✗ {len(failed_stages)} stage(s) failed:")
        for stage_num, stage_name in failed_stages:
            print(f"  - Stage {stage_num}: {stage_name}")
        print("\nTroubleshooting:")
        print("  1. Check Kaggle API setup: kaggle.json in ~/.kaggle/")
        print("  2. Verify dataset URLs are accessible")
        print("  3. Check disk space (datasets >2GB total)")
        print("  4. Review error messages above")
        return 1
    else:
        print("\n✓ ALL STAGES COMPLETED SUCCESSFULLY")
        print("\nResults:")
        print("  ✓ Model saved to: ml-models/models/artifacts/heart_disease_framingham.joblib")
        print("  ✓ Metrics saved to: ml-models/models/artifacts/heart_disease_framingham.json")
        print("  ✓ Live dataset: data/live_watch_report_dataset.csv")
        print("  ✓ Live model: ml-models/models/artifacts/future_disease_live_model.joblib")
        print("\nNext steps:")
        print("  1. Review metrics: cat ml-models/models/artifacts/heart_disease_framingham.json")
        print("  2. Review live metrics: cat ml-models/models/artifacts/future_disease_live_model.json")
        print("  3. Integrate model into prediction service")
        print("  4. Deploy to production")
        return 0


if __name__ == "__main__":
    sys.exit(main())
