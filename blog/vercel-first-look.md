---

title: My first look at Vercel
authors: simonpainter
tags:
  - cicd
  - automation
  - programming
  - github
  - cloud
  - ai
  - aws
  - opinion
date: 2025-12-15

---

I was having a conversation recently and Vercel came up. The organisation I am currently working with has been exploring it as it seems to offer a lot of benefits for developers who have been let down by the promises of cloud.
I have to admit that I had not really looked at Vercel before, so I decided to take a look and while I was at it ended up building and deploying a simple web application that has been on the bottom of my to-do list for a while.
<!-- truncate -->
I guess the place to start is with what Vercel actually is. It has the vibe coding vibe and another close friend of mine likened it to [Replit](https://replit.com) and [Base44](https://base44.com/) which both allow you to turn ideas into applications using an agentic code factory. Vercel do have a similar product called [v0](https://v0.app) which is another vibe coding environment but that wasn't what I was looking at; between [Claude Code](https://claude.ai/code/) and [GitHub Copilot](https://code.visualstudio.com/docs/copilot/overview) I have more than enough help writing bad code.

Vercel is a cloud platform for deploying your web applications with a focus on performance, scalability, and developer experience. It aims to take the infrastructure management burden off developers so they can build and deploy the applications quickly and easily. For larger organisations this is probably something you already do with your existing developer experience but for smaller teams and individual developers this is a big deal.

> When I say that Vercel is a cloud platform I mean it's really a SaaS control plane that sits on top of AWS.
> The serverless function execution is powered by AWS Lambda and the static assets are stored in AWS S3. There is a small
> selection of integrations to other providers for databases and other services but the core of the platform is built on
> AWS.

