#!/bin/bash
# ML Engine Startup Script
# Starts the Python ML training service and connects it to the Node.js backend

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🏥 CARDIO-SENTINEL: ML Training Engine Startup           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python 3 found"
PYTHON_VERSION=$(python3 --version)
echo "   Version: $PYTHON_VERSION"
echo ""

# Create virtual environment if needed
if [ ! -d "ml_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv ml_venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source ml_venv/bin/activate || . ml_venv/Scripts/activate

# Install dependencies
echo "📥 Installing ML dependencies..."
pip install -q -r requirements-ml.txt
echo "✅ Dependencies installed"
echo ""

# Start ML engine
echo "🚀 Starting ML Training Engine on port 8000..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
python3 ml_engine.py server

echo ""
echo "✅ ML Engine running!"
echo "📊 API endpoints:"
echo "   GET  http://localhost:8000/health"
echo "   POST http://localhost:8000/api/ml/train"
echo "   GET  http://localhost:8000/api/ml/predict/<patient_id>"
echo "   GET  http://localhost:8000/api/ml/models"
echo ""
