---

title: Uploading my Docusaurus site
---

I haven't got around to setting up a github action to sync my site to S3 whenever I push an update so I used a fairly simple shell script to do the job of building and syncing to S3. I have used the rather simple [s3cmd](https://s3tools.org/s3cmd) which is easy to install on most things. 


```
#!/bin/bash
set -e  # Exit on any error

echo "Starting Build"
npm run build
echo "Build Complete"

echo "Starting Sync"
s3cmd sync build/* s3://www.simonpainter.com/
echo "Sync Complete"
```

I expect the github action would look something like this, but I haven't tried yet.

```
name: Build and Deploy to S3

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Docusaurus site
        run: npm run build
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Sync to S3
        run: |
          aws s3 sync build/ s3://${{ secrets.S3_BUCKET }} \
            --delete \
            --exclude ".git/*" \
            --exclude ".github/*"

```