#!/bin/bash

echo "🚀 Deploying Party Room Booker to VPS..."

# Pull latest changes from master branch
git pull origin master

# Copy production environment file
cp .env.production .env

# Build and start with docker-compose
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Application should be available at https://your-domain.com"

# Show logs
docker-compose logs -f