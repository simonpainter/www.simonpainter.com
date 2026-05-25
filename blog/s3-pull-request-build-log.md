---

title: GitHub action to test build of Docusaurus
authors: simonpainter
tags:
  - aws
  - github
  - github-actions
  - cicd
date: 2025-02-24

---

I've always had a lingering fear that I'll break my site due to the somewhat precise nature of Docusaurus. It's a concern that's grown since I opened up the site for others to submit pull requests. While I run live rendering during my own updates, I can't guarantee others will do the same. So I've added a simple action on top of my [existing GitHub Action](s3-docusaurus.md) which is triggered when a pull request is created. This new action builds the site and captures the output from `npm run build --verbose`, then adds it as a comment to the pull request.
<!-- truncate -->
[You can find the complete action here](https://github.com/simonpainter/my-website/blob/main/.github/workflows/pull_request.yml).

I've found this addition particularly helpful when working with contributors who might not be familiar with Docusaurus's formatting requirements. Now they can see immediately if their changes would break the build, without having to set up a local development environment.

Have you implemented any similar automated testing for your static site projects? I'd love to hear about your approach to ensuring content quality when accepting community contributions.