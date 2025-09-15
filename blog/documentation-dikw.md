---

title: "The network documentation pyramid: why your spreadsheets aren't enough"
authors: simonpainter
tags:
  - business
  - networks
  - opinion
  - ai
date: 2025-09-15

---

I've been thinking about why network documentation always feels incomplete. You know the feeling - you've got spreadsheets full of device details, beautiful network diagrams, and configuration backups. But when something breaks at 3am, you're still calling Dave from the pub because he's the only one who knows why VLAN 247 exists.
<!-- truncate -->
The problem isn't that we don't document things. It's that we're only capturing the bottom layer of what we actually need.

## A framework for understanding documentation gaps

The Data-Information-Knowledge-Wisdom (DIKW) model gives us a useful way of understanding why network documentation fails. Think of it as a pyramid where each level builds on the one below:

![DIKW Pyramid](img/dikw-pyramid.png)

At the bottom, we have **data** - raw facts like IP addresses, device models, and serial numbers. Moving up, **information** shows relationships and connections. **Knowledge** explains how these relationships serve business purposes. At the top, **wisdom** captures the hard-won insights about why decisions were made and what works in practice. Here's the thing: as you move up the pyramid, documentation quality plummets.

> The DIKW model is used extensively in information science and knowledge management to understand how raw data transforms into actionable wisdom. Most organisations excel at capturing data and information, but struggle to turn that into insights that are useful in practice.

## The documentation drought

Most organisations are brilliant at the data layer. Our CMDBs are packed with device inventories, our monitoring systems track every metric, and our configuration management tools back up every change.

We're pretty good at the information layer too. Network diagrams show topology, VLAN tables map relationships, and routing tables display connectivity. We can usually work out how things connect. I have been wowed by many a dashboard that pulls live data from network devices to show RAG status of all manner of things - PowerBI has a lot to answer for in this space. But climb higher and things get sparse fast.

The knowledge layer - understanding how network design serves business needs - lives scattered across project documents, architectural decision records, and the occasional wiki page. It's patchy, often outdated, and rarely connected to the technical reality it's supposed to explain.

And the wisdom layer? That's almost entirely tribal. It's the insights that come from years of experience, the patterns that emerge from repeated incidents, the unwritten rules about what works and what doesn't. This knowledge exists in people's heads and nowhere else.

## The nature of tribal knowledge and wisdom

Before we go further, let's talk about what tribal knowledge and what it means. I use this term to describe the understanding passed down between engineers like an oral tradition - insights, patterns, and contextual knowledge that never make it into formal documentation.

At the knowledge layer, tribal knowledge includes understanding how your network actually supports business operations. It's knowing that the seemingly redundant connection to the backup data centre isn't just for disaster recovery - it's also the primary path for the batch processing jobs that run every night. This knowledge lives in people's heads because nobody ever documented the full context of how systems interconnect.

But tribal wisdom goes deeper. It's the wisdom held by the senior engineers - the team's elders who've seen multiple generations of technology and organisational change. This is experiential knowledge that comes with stories and context.

It's the senior engineer telling you, "Don't restart BGP on that router during market hours - learned that the hard way in 2008." It's knowing that a particular switch model always shows interface errors two weeks before it fails completely. It's understanding that the monitoring system reports everything as normal, but when you see this specific combination of log entries, the storage array is about to crash.

This wisdom lives in conversations, in the margins of team meetings, in the knowledge shared during 3am incident calls. It's contextual, experiential, and often comes with war stories about why certain approaches work or fail in your specific environment.

## The fragility of institutional memory

Here's what makes both tribal knowledge and wisdom so vulnerable: they exist primarily in people's minds, not in systems or documents.

When experienced engineers leave, retire, or get made redundant, decades of institutional memory walks out the door with them. Outsourcing to managed services is particularly devastating - the handover documentation captures processes and procedures, but it never captures the nuanced understanding of how systems actually behave under stress, or why certain design decisions were made years ago.

Knowledge transfer sessions try to bridge this gap, but they're fighting human nature. You can't download twenty years of pattern recognition in a few training sessions. The subtle cues that trigger "something's not quite right" in an experienced engineer's mind - those don't transfer easily in formal handovers.

The managed service provider gets the network diagrams, the configuration backups, and the operational procedures. What they don't get is the understanding that this particular router has been unstable since the power outage in 2022, or that the monitoring thresholds were set the way they are because of a specific incident that taught everyone what "normal" actually looks like.

Yet this tribal knowledge and wisdom often contain the most valuable insights about your infrastructure. It's the difference between someone who can follow a runbook and someone who can sense when the runbook isn't going to work this time.

## When tools become part of the problem

I've watched organisations try to solve this with better tools. They implement documentation platforms, mandate architectural decision records (ADRs), and create elaborate knowledge management systems. The results are predictably disappointing.

ADRs get written for major projects but rarely maintained. They're stored in separate repositories, disconnected from the configurations they describe. Six months later, when you're troubleshooting an issue, good luck finding the ADR that explains why this particular configuration exists.

Even when documentation exists, it's in the wrong place at the wrong time. Your Confluence space has detailed explanations of network design decisions. Your Git repository has configuration files. Your monitoring system shows current state. But they're all separate, so when you need to understand why something was built the way it was, you're hunting across multiple systems.

The context that makes documentation valuable - the connection between decision, implementation, and outcome - gets lost in the tool sprawl.

## The documentation-first alternative

What if we flipped the script? Instead of documenting after we build, what if we documented our intent before we implement? Documentation-first means capturing the "why" at the moment of decision, when the reasoning is fresh and the alternatives are clear. It means embedding context directly with the technical implementation, not filing it away in a separate system. This isn't just better documentation - it's documentation that lives where it's needed, when it's needed.

Here's where infrastructure as code becomes powerful beyond just automation. When your network configurations live in code, the comments become a natural place to capture intent alongside implementation.

Instead of having your BGP configuration in one system and your architectural decisions in another, everything lives together:

```text
# BGP Configuration for Core Router CR01-LON-01
# Business Context: Primary internet gateway for London office (400 users)
# Design Decision: Dual-homed to different providers for redundancy
# Historical Context: Single provider outage in Feb 2023 caused 4-hour downtime
# Traffic Patterns: Peak 2Gbps during business hours, 200Mbps overnight
# Failure Impact: Complete office connectivity loss, affects customer support
# Last Review: 2024-03-15 (next review due with office expansion Q4 2024)

router bgp 65001
  neighbor 203.0.113.1 remote-as 64512  # Primary: GlobalConnect 
  neighbor 203.0.113.1 description "Primary ISP - GlobalConnect"
  neighbor 203.0.113.5 remote-as 64513  # Secondary: MetroNet
  neighbor 203.0.113.5 description "Secondary ISP - MetroNet"
  
  # Prefer primary path under normal conditions
  # Secondary has higher AS prepend for outbound traffic engineering
  neighbor 203.0.113.5 route-map BACKUP-PATH out
```

The power here isn't just that documentation exists - it's that it exists in context. When someone's reviewing the configuration, the business reasoning is right there. When they're making changes, they can see why previous decisions were made. When they're troubleshooting, they understand what the configuration is supposed to achieve.

Version control gives you the history of both implementation and reasoning. You can see not just what changed, but why it changed, because the comments evolve with the code.

## Embedding documentation in the change process

But here's where it gets really powerful. When you treat documentation as code, it becomes part of the change process itself, not something that happens afterwards.

Every change becomes a feature branch in your version control system. That branch doesn't just contain the configuration changes - it contains the documentation updates too. The business context, the design rationale, the impact analysis - all of it evolves together with the technical implementation.

Let's say you're implementing redundant internet connectivity for a branch office. Your feature branch might be called `feature/branch-manchester-dual-wan` and it contains:

- Updated router configurations with new BGP neighbours
- Modified firewall rules for the secondary path  
- Updated network diagrams showing the new topology
- Revised runbooks with failover procedures
- Updated monitoring configurations for the new links

But it also contains the documentation that explains the change:

- Business justification (regulatory requirement for 99.9% uptime)
- Design decisions (why BGP over static routing)
- Risk assessment (what happens if implementation goes wrong)
- Success criteria (how we'll know it's working properly)
- Future considerations (planned migration to SD-WAN in 2025)

When you merge that branch, you're not just deploying a configuration change. You're deploying a complete package of infrastructure evolution - technical implementation and human understanding together.

This kills the traditional technical design document. No more writing lengthy documents that describe a point-in-time snapshot of where you're heading. No more documents that become obsolete the moment requirements change or implementation reveals new constraints.

Instead, documentation evolves continuously with your infrastructure. When you need to understand why something exists, you look at the commit that introduced it. When you need to change something, you update both the implementation and the explanation in the same pull request.

The documentation stays current because it can't drift - it's locked to the same version as the code it describes.

## Where AI helps change the game

AI is where things get really interesting. The wisdom layer has always been the hardest to capture because it's experiential and contextual. But modern AI models can connect directly to your operational systems using protocols like Model Context Protocol (MCP).

Instead of trying to train custom models on your historical data, you can give AI models live access to context in the form of your configuration repositories, historical logs, incident management systems, and monitoring data. When someone's troubleshooting at 3am, instead of calling Dave, they could ask:

"The branch office is reporting slow connectivity. Based on our network history, what should I check first?"

The AI could query your systems in real-time and respond with context-aware guidance:
"Looking at your current configuration and incident history, branch connectivity issues have typically been caused by three patterns: WAN link saturation on the primary path (65% of cases), DNS resolution delays (20%), or switch port errors at the branch (15%). Your monitoring shows the WAN link to that branch is currently at 85% utilisation, and there was a similar pattern before the incident on 2024-02-15. I'd suggest checking interface statistics on the branch router first."

This isn't replacing human expertise - it's amplifying it. The AI becomes a bridge between your live operational data and institutional memory, making tribal knowledge searchable while keeping it current.

## Building organisational memory

The real power comes from combining documentation-first practices with AI-augmented wisdom capture. As you document intent and implementation together, the AI learns not just what you did, but why you did it. As you resolve incidents and capture lessons learned, the model builds understanding of what works in your specific context. Over time, you develop genuine organisational memory - not just records of what happened, but understanding of why decisions were made and what their consequences were. This matters because networks aren't just technical systems. They're socio-technical systems where human knowledge, business context, and technical implementation all interweave. The wisdom layer captures those interconnections.

## Start where it hurts most

You don't need to revolutionise everything at once. Pick the area where tribal knowledge is most critical - maybe it's your BGP configuration, your security policies, or your change management procedures.

For your next significant change, document not just what you're implementing, but why you chose this approach over alternatives. Capture the business context, the technical constraints, and the expected outcomes. Store it with the implementation, not separate from it.

When the next incident happens, spend ten minutes documenting not just how it was resolved, but what led the responder to look in the right place. Feed that pattern recognition back into your organisational memory.

Build the wisdom layer one insight at a time. Your future self - and your colleagues - will thank you for it. Especially at 3am.
