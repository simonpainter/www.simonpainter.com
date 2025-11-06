---

title: Is MCP the new fad for poor knowledge management?
authors: simonpainter
tags:
  - personal
  - ai
  - business
  - mcp
  - documentation
date: 2025-06-25

---

Since Anthropic open sourced the [Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) last year there have been lots of notable implementations across many areas of tech. Every day I seem to see a breathless introduction on LinkedIn to some new MCP front end to a service or dataset.
<!-- truncate -->
This is great in many ways, being able to choose which integrations your chosen model can use gives flexibility and choice. Being able to create your own using the [numerous SDKs, integrations and implementations](https://github.com/modelcontextprotocol) is a dream come true for those of us exploring this blossoming new territory.

As a network engineer at heart the idea of [integrating an AI agent into IOS XE](https://www.youtube.com/watch?v=2_7YcHtRw2s&feature=youtu.be) with MCP was fascinating and as a cloud fanboi I loved seeing [Microsoft add an MCP](https://github.com/MicrosoftDocs/mcp) to their substantial repository of public documentation. Microsoft are really setting the bar high on documentation-as-code by the way.

Where I get a bit more concerned is around how breathless enterprise architects and CTO may see this as another silver bullet to their own documentation woes. Time for a story:

Several years ago I worked at a hardware vendor and we had some big problems with knowledge managment. Our sales, marketing, product and many other functions used sharepoint as their tool for document storage along with some unstructured file systems. The engineering team used a wikimedia install tucked away on a PC under a desk. The QA team used test director with various simplified front ends to surface the key fields from what has always been an unwieldy front end. The TAC had access to pretty much all of this in their quest to support the product for the customer. A new director came on board to lead the TAC and one of the first things he did was buy a Google appliance, as was the fashion in those days, to install in the rack and let crawl over our various datasets to make it easier for TAC engineers to find the thing they needed from the many disparate sources. I don't think I ever saw anything useful from the Google appliance, it was trying to pull golden knowlege from a coal pile of data. The solution had been billed as a way to fix a fundamental absence of a knowledge management strategy.

I saw this pattern repeat not that long ago in another organisation that wanted to 'use AI' to solve the same problem. Rather than having well organised and well maintained documentation the idea was to use an LLM as a glorified natural language search across disparate sources. It won't deliver a silver bullet, these things never do, and the time could be better spend forming a coherent approach to knowledge management. That's quite hard though and I can see why it wouldn't be attractive.

So here's where we're back to MCP server. I can very much support Microsoft Learn putting an MCP on the front of their well managed and well maintained documentation, what I worry about is organisations buying into the idea that they can just turn on an MCP front end to, for example, their Sharepoint and expecting that cluttered mess or data to magically become something that yields useful results in prompts to AI agents. I expect to see all of the knowledge solutions out there touting their MCP feature add on as a way to make up for the fact that organisations don't manage their knowledge. Don't be one of the ones that fall for it.
