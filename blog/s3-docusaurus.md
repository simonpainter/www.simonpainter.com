---

title: Uploading my Docusaurus site
authors: simonpainter
tags:
  - aws
  - github
  - github-actions
  - docusaurus
date: 2024-11-17

---

I've now extended the GitHub action for those of us who want to create sites in Docusaurus and then have our committed and pushed changes automatically built and synced to an S3 bucket. Static S3 sites are a great way to host static content, and Docusaurus is a brilliant tool for rendering sites out of simple markdown content. 
<!-- truncate -->
As with the [static S3 action](s3-github-action.md) I used earlier, you'll need to set up (or reuse) an IAM user with the correct policy. If you're reusing the policy on another bucket, remember to add it in the resources section. You'll also need to populate the secrets in the repository if you're doing it in a new GitHub repository.

Here's the GitHub Action workflow that I'm using:

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

I've found this to be incredibly useful for my workflow. Now whenever I push changes to my main branch, the site automatically rebuilds and deploys to S3. This saves me from manually running the build process and uploading files, which was becoming quite tedious as my site grew.
