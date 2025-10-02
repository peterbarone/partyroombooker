#!/bin/bash

echo "🚀 Starting Party Room Booker in development mode with Docker..."

# Build and start development container
docker-compose -f docker-compose.dev.yml up --build

# Alternative: Start without rebuilding
# docker-compose -f docker-compose.dev.yml up