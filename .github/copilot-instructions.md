# Writing for this site

## Tone and voice

The tone guide lives in a separate repo so it can be shared:
**https://github.com/simonpainter/tone/blob/main/blog/AGENTS.md**

Read it before writing or editing any post. It covers voice, UK English, structure,
banned phrases, inclusive language, and how to open and close a post. It also links to a
common guide at `common/AGENTS.md` in the same repo — read that too.

Everything below is plumbing specific to this Docusaurus site.

## Frontmatter

Blog posts live in `blog/` and start with frontmatter:

```markdown
---
title: "Multiple prefixes on a subnet"
authors: simonpainter
tags:
  - azure
  - networks
date: 2025-03-07
---
```

## Truncate marker

Every post needs a `<!-- truncate -->` marker. It goes straight after the opening
paragraph, before the first subheading, with no blank line between the paragraph and
the marker. Everything above it becomes the excerpt on the blog index, so that paragraph
has to stand on its own and make someone want to click.

## Mermaid diagrams

Mermaid is enabled on this site, so use fenced ` ```mermaid ` blocks for diagrams rather
than images. Use a diagram where it replaces a chunk of explanation, not for decoration.

## Tagging

Every post must have **at most 3 tags**, chosen from `blog/tags.yml`.

**Drop-priority order** — remove these first when trimming:
1. `networks`, `cloud`, `security`, `architecture` — too generic to filter anything useful

**Keep-priority order** — favour tags in this sequence:
1. Technology-specific: `dns`, `bgp`, `expressroute`, `private-link`, `terraform`, `ipv6`, `anycast`, `mcp`, plus other precise tech tags (`firewall`, `zero-trust`, `ospf`, `dhcp`, `sdwan`, `load-balancing`, `high-availability`, `performance`, `troubleshooting`, `monitoring`, `cicd`, `github-actions`, `docusaurus`, `ai`, `algorithms`, `routing-protocols`, `netbox`, `enforza`, `nfc`, `making`)
2. Generic tools: `python`, `bash`, `programming`, `scripting`, `automation`, `github`
3. Platform: `azure`, `aws`
4. Content-type: `opinion`, `educational`, `labs`, `personal`
5. Catch-all: `business`, `career`, `documentation`, `migration`

Only add a tag if it is already defined in `blog/tags.yml`. Do not create new tags without
also adding them to `blog/tags.yml`.
