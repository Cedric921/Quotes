#!/bin/bash

echo "🗑️  Removing old database..."
rm -f database.sqlite

echo "🔄 Database removed. TypeORM will create a new one with UUID on next start."
echo "✅ Done! Start the API server to create the new database structure."

