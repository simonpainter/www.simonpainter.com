# Contributing to Simon Painter's Website

Thanks for your interest in contributing! Whether you're fixing a typo, improving an explanation, or sharing your own insights, your contributions help make this site better for everyone.

## Getting Started

1. **Fork this repository** - Click the "Fork" button at the top right of the page
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/www.simonpainter.com.git
   cd www.simonpainter.com
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your changes:
   ```bash
   git checkout -b your-feature-branch
   ```
5. **Make your changes** - Fix content, add new posts, or improve the site
6. **Test your changes** locally:
   ```bash
   npm start
   ```
7. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   git push origin your-feature-branch
   ```
8. **Create a Pull Request** - Go back to the main repository and click "New Pull Request"

## What You Can Contribute

- **Content improvements** - Fix typos, clarify explanations, or suggest better approaches
- **New blog posts** - Share your own technical insights (following our content guidelines below)
- **Technical improvements** - Enhance the site's functionality or design
- **Documentation** - Help improve these contribution guidelines or add missing docs

## Writing New Blog Posts

If you're writing a new blog post, there are a few things to keep in mind.

### Add Yourself as an Author

Before your first post, add yourself to `blog/authors.yml`. Here's the format:

```yaml
yourusername:
  name: Your Name
  title: Your Title or Role
  image_url: https://github.com/yourusername.png
  description: A brief biography about yourself and your experience.
  socials:
    github: yourusername
    linkedin: yourlinkedinprofile
  page: true
```

### Use Tags

Every blog post should include relevant tags in the front matter. Check `blog/tags.yml` for available tags. Include at least one tag, but don't go overboard - pick the most relevant ones.

```yaml
---
title: Your Post Title
authors: yourusername
tags:
  - azure
  - networks
  - cloud
date: 2025-01-15
---
```

### Include a Truncate Marker

Add a `<!-- truncate -->` marker in your post where you want the preview to end on the blog listing page. This should come after your introduction paragraph - give readers enough context to understand what the post is about, but leave the details for the full article.

```markdown
Your introductory paragraph that hooks the reader and explains what you'll cover.
<!-- truncate -->

## Your First Section

The rest of your content goes here...
```

### Follow the Style Guide

When writing content, keep these principles in mind:

- Use UK English spellings and grammar
- Keep it conversational - like two friends chatting over coffee
- Avoid buzzwords and use plain English
- Use first-person singular (I, my, me) to keep it personal
- Include practical examples and real-world applications
- Support claims with specific data when possible
- Use short paragraphs (2-3 sentences) to break up ideas
- Include code examples or Mermaid diagrams where helpful

For the full style guide, see `.github/copilot-instructions.md`.

## Project Structure

- `blog/` - All blog posts in Markdown format
- `blog/authors.yml` - Author information and biographies
- `blog/tags.yml` - Available tags for categorising posts
- `src/` - Custom React components and pages
- `static/` - Static assets like images and files
- `docusaurus.config.js` - Site configuration and navigation

## Testing Your Changes

The site includes automated GitHub Actions that test pull request builds. Before submitting:

1. Run `npm start` to preview your changes locally
2. Check that your content renders correctly
3. Verify any links work as expected
4. Run `npm run build` to ensure the production build succeeds

## Questions?

Found something confusing? Not sure where to start? Feel free to:

- Open an issue to discuss your ideas
- Reach out on [LinkedIn](https://www.linkedin.com/in/sipainter/) or [GitHub](https://github.com/simonpainter)

Every contribution - no matter how small - makes this site better for everyone.
