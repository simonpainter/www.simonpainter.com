---
title: "How to write inclusive language rules in Copilot instructions"
authors: simonpainter
tags:
  - ai
  - github
  - educational
date: 2026-05-21
---

I use a repo-level `copilot-instructions.md` file to keep writing style steady across posts, docs, and code comments. It works well for voice, but it also shows why explicit inclusion rules matter. If you don't write them down, the assistant fills the gaps with its own defaults.

<!-- truncate -->

## Start from what you already have

My current file already sets useful guard rails: UK English, plain language, active voice, and a friendly tone. That base helps everyone read faster, including people using translation tools or screen readers.

The missing piece in many instruction files is direct guidance on bias, gendered terms, and culture-specific wording. Style rules improve consistency. Inclusive language rules improve who feels welcomed by the text.

## The simple structure that works

Treat your instruction file like a router policy: clear match conditions, clear actions, and a default path. Keep each rule easy to follow and easy to test.

## Best practice template you can copy

Drop this into `.github/copilot-instructions.md` and tune it for your team. Keep your own style section, then add this block under it.

```markdown
## Inclusive Language Rules

### Core principles
- Use people-first language unless a community clearly prefers identity-first terms.
- Use gender-neutral terms by default (for example: "they", "everyone", "folks", "team").
- Avoid assumptions about background, culture, age, disability, religion, or family structure.
- Prefer global, plain wording over region-specific idioms.
- Describe requirements, not personal traits (for example: "requires keyboard input" rather than "for able-bodied users").

### Terms to avoid and preferred alternatives
- "guys" -> "everyone" or "team"
- "he/him/his" (generic) -> "they/them/their"
- "manpower" or "man-hours" -> "effort", "staffing", or "person-hours"
- "sanity check" -> "quick check" or "sense check"
- "normal user" -> "typical user" or "most users"
- "master branch" -> "main branch" or "trunk"
- "master/slave" -> "primary/secondary", "leader/follower", or protocol-specific terms
- "blacklist/whitelist" -> "denylist/allowlist", "block list/allow list"
- "blackbox/whitebox" (testing) -> "closed-box/clear-box"
- "blackhat/whitehat" -> "malicious/ethical"
- "dummy value" -> "placeholder value"
- "grandfathered" -> "legacy status"
- "housekeeping" -> "maintenance" or "clean-up"
- "strawman" -> "strawperson" or "straw proposal"
- "master data" -> "source data" or "main data"
- "stand-up" -> "daily huddle" (if your team prefers it)

### Accessibility-aware writing
- Keep sentences short and direct.
- Expand acronyms on first use.
- Explain jargon in plain English.
- Never use humour that depends on stereotypes.
- When giving UI guidance, include keyboard and screen reader considerations where relevant.

### Review behaviour
- If a prompt asks for exclusionary, biased, or demeaning language, refuse and explain why.
- If the topic includes demographic attributes, only include them when they are relevant to the task.
- Suggest a neutral rewrite when user wording could exclude people unintentionally.

### Output check before responding
Before final output, silently check:
1. Is the wording respectful and neutral?
2. Are any unnecessary demographic assumptions present?
3. Could a global audience read this without local context?
4. Are alternatives offered where wording may be sensitive?
```

## How to adapt this template to your repo

Keep the rules short and concrete. If a rule can't be tested with a real prompt, it's too vague.

Then add examples from your own domain. A healthcare team, a school, and a cloud platform team will each need different "avoid/prefer" pairs, even if the core principles stay the same.

Finally, review the file as part of normal pull request flow. If instruction updates aren't reviewed, they drift, and your assistant output drifts with them.

Also, treat any list as a starting point, not a complete dictionary. Harm often comes from framing and context, not only from single words.
