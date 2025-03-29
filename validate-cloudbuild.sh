#!/bin/bash

echo "Validating Memory-Capsule cloudbuild.yaml configuration..."

# Check Docker build commands
echo "Checking memory-service build command..."
docker build -f services/memory-service/Dockerfile.cloudrun -t memory-service-test ./services/memory-service || exit 1

echo "Checking auth-service build command..."
docker build -f services/auth-service/Dockerfile.cloudrun -t auth-service-test ./services/auth-service || exit 1

echo "Checking ipfs-service build command..."
docker build -f services/ipfs-service/Dockerfile.cloudrun -t ipfs-service-test ./services/ipfs-service || exit 1

echo "Checking ai-service build command..."
docker build -f services/ai-service/Dockerfile.cloudrun -t ai-service-test ./services/ai-service || exit 1

echo "Checking blockchain-service build command..."
docker build -f services/blockchain-service/Dockerfile.cloudrun -t blockchain-service-test ./services/blockchain-service || exit 1

echo "Checking frontend build command..."
docker build -f services/frontend/Dockerfile.cloudrun -t frontend-test ./services/frontend || exit 1

echo "All Docker builds successful! The build steps in cloudbuild.yaml should work."
echo "Deploy commands cannot be tested locally but should work if they match your current manual commands."
