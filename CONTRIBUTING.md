# Contributing

Found a typo? Spotted an error? Have something worth adding? Pull requests are welcome.

## The Basics

Fork the repo, clone it, install dependencies with `npm install`, and run `npm start` to get a live preview. Create a branch, make your changes, then open a pull request. GitHub Actions will run a build check automatically — you'll see the result in the PR.

```bash
git clone https://github.com/your-username/www.simonpainter.com.git
cd www.simonpainter.com
npm install
npm start
```

## What's Worth Contributing

**Fixing content** is the most common and most welcome type of contribution. If something is wrong, unclear, or out of date, just fix it.

**New posts** are welcome if they fit the tone and subject matter. Cloud networking, infrastructure automation, network modernisation — that kind of territory. If you're not sure whether something fits, open an issue first and we can talk it through.

**Site improvements** — if you spot something broken or have an idea for the site itself, raise an issue.

## Writing a New Post

A few things to get right before you submit:

**Add yourself as an author** in `blog/authors.yml` if you're not already there:

```yaml
yourusername:
  name: Your Name
  title: Your Title or Role
  image_url: https://github.com/yourusername.png
  description: A short bio.
  socials:
    github: yourusername
    linkedin: yourlinkedinprofile
  page: true
```

**Set your front matter** — pick tags from `blog/tags.yml` and include a date:

```yaml
---
title: Your Post Title
authors: yourusername
tags:
  - azure
  - networks
date: 2025-01-15
---
```

**Add a truncate marker** after your opening paragraph so the blog listing page shows a sensible preview:

```markdown
Your intro paragraph goes here.
<!-- truncate -->

## First Section

Rest of the post...
```

## Style

The blog has a consistent voice — conversational, plain English, UK spellings, first-person singular. Short paragraphs. Analogies over jargon where possible, but jargon is fine when it's the right word. Think coffee-shop conversation with someone who knows their stuff, not a conference talk.

Use Mermaid diagrams where architecture benefits from a visual. Use code blocks where code is the clearest way to explain something.

The full style guide is in `.github/copilot-instructions.md` if you want the detail.

## Questions

Open an issue or reach out on [LinkedIn](https://www.linkedin.com/in/sipainter/) or [GitHub](https://github.com/simonpainter).
