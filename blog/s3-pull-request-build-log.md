---

title: GitHub action to test build of Docusaurus
authors: simonpainter
tags:
  - aws
  - github
  - github-actions
date: 2025-02-24

---

I have a lingering fear that I'll break my site due to the somewhat precise nature of Docusaurus. It's compounded by my decision to open the site up for others to submit pull requests; while I run live rendering during updates I can't guarantee others will. I have added a simple action on top of the [existing one](s3-docusaurus.md) which is triggered when a pull request is created. The action builds the site and captures the output from `npm run build --verbose` and adds it as a comment to the pull request.
<!-- truncate -->
[Link to the action here](https://github.com/simonpainter/my-website/blob/main/.github/workflows/pull_request.yml).
