#!/bin/bash

# Conversation Tree System Setup and Test Script

echo "🌳 Conversation Tree System - Setup Script"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Python found: $PYTHON_VERSION"
else
    echo "✗ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✓ PostgreSQL found: $PSQL_VERSION"
else
    echo "⚠ PostgreSQL client not found. Make sure PostgreSQL server is running."
fi

echo ""
echo "Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

echo "✓ Backend setup complete"
echo ""

cd ..

echo "Setting up frontend..."
cd frontend

# Install Node dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "✓ Frontend setup complete"
echo ""

cd ..

echo "=========================================="
echo "Setup complete! 🎉"
echo ""
echo "To start the application:"
echo ""
echo "1. Make sure PostgreSQL is running with database 'conversation_tree'"
echo "   Create it with: psql -U postgres -c 'CREATE DATABASE conversation_tree;'"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate  # or 'venv\\Scripts\\activate' on Windows"
echo "   python main.py"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Or use Docker Compose:"
echo "   docker-compose up"
echo ""
