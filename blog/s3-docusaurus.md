---

title: Uploading my Docusaurus site
authors: spainter
tags:
  - aws
  - github
  - github-actions
  - docusaurus
date: 2024-11-17

---

I've now extended the github action for those who want to create their sites in Docusaurus and then have the commited and pushed changes automagically get built and synced to their S3 bucket. Static S3 sites are a great way to host static sites and Docusaurus is a great tool for rendering sites out of simple markdown content. 
<!-- truncate -->
As with the [static S3 action](s3-github-action.md) you will need to set up (or reuse) the IAM user with the correct policy. If you are reusing the policy on another bucket remember to add it in the resources section. You'll also need to populate the secrets in the repository if you are doing it in a new github repository. 

```javascript
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