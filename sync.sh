#!/bin/bash
set -e  # Exit on any error

echo "Starting Build"
npm run build
echo "Build Complete"

echo "Starting Sync"
s3cmd sync build/* s3://www.simonpainter.com/
echo "Sync Complete"