---
title: They keep telling us that ZTNA is so much better than VPN
authors: 
  - simonpainter
tags:
  - security
  - architecture
  - sdwan
  - zero-trust
  - networks
date: 2026-01-31
---

I distinctly remember the sales guy telling me how this magic box would give us secure network access. Not only would it grant access to applications in our data centre, but it would also ensure that connecting devices were secure and compliant with our security policies. Each user would only reach the applications they were authorised to use—nothing else.

This wasn't last week when I was talking to the folks at [Zscaler](https://www.zscaler.com). It was 2008, and the product was a Cisco ASA with Cisco's Anyconnect VPN client.

Nowadays we talk about Zero Trust Network Access (ZTNA) as the solution to this very same problem. But is it really that different from the SSL VPNs of old?
<!--truncate-->

## The promises haven't changed

My problem with ZTNA is that all the marketing material promises the same things I was promised back in 2008. Those things never really materialised for us back then, so what makes us think they will now?

In nearly two decades, I've only ever seen one VPN deployment where application-level access control actually worked. It was in the late twenty-teens at a payment provider using Checkpoint. We connected to our management desktops, and the Checkpoint client used our group membership to determine which management interfaces we could reach.

This setup did two things well. It enforced application-level access control on top of the privileged identity needed to log into each device. It also meant that legacy kit with weak ciphers—or even telnet and HTTP—could be secured at the network layer from prying snoopers.

## What ZTNA vendors say is different

Modern ZTNA vendors will tell you their solutions are fundamentally different from legacy VPNs. They're cloud-native. They're identity-centric. They use continuous verification. They're built for the modern threat landscape where the network perimeter no longer exists.

All true. All important. But none of that addresses the fundamental problem.

## The organisational challenge nobody solves

Here's the thing: that Checkpoint deployment is basically exactly what ZTNA promises to do. But it was an edge case in my experience. Managing privileged access to a handful of management interfaces for a security-conscious card payment provider was compelling. Creating policies for hundreds of applications across thousands of different user personas in a typical enterprise? Much less so.

Consider a large retailer. You've got store colleagues who need access to POS systems and basic inventory lookups. Warehouse staff who need full inventory management and logistics systems. Regional managers who need reporting dashboards and HR portals. Corporate teams across finance, marketing, and IT - each with their own application stack. Franchisees who need a carefully controlled subset of all of this. And seasonal workers who need temporary access to specific systems.

Now multiply that across hundreds of applications: some cloud, some on-premises, some SaaS, and some legacy systems that nobody's touched in a decade. Each application has different sensitivity levels, compliance requirements, and access patterns.

Identity-based access control sounds great in theory. In practice, it requires sustained collaboration between the identity team, the security team, the network team, and dozens of application owners to define and maintain access policies. This is a massive organisational challenge that most enterprises struggle with.

The reality is that most organisations have a sprawl of applications, many of which are legacy or poorly documented. The idea of defining granular access policies with role personas is daunting—and often abandoned before it starts. Six months in, you're back to "all authenticated users can reach everything on the corporate network" because the alternative is drowning in access requests.

## Lessons from file shares

We've seen this problem before with file shares. Remember when central teams would define sharing permissions based on departmental roles? How well did that work out?

It didn't. The central team became a bottleneck. Tickets piled up. Access reviews were a nightmare. Eventually, permissions became so broad they were meaningless, or so restrictive that people found workarounds.

The solution was to move to a delegated model where data owners are responsible for defining access to their own data. If we apply this same logic to ZTNA, we need to empower application owners to define who can access their applications, rather than trying to enforce a centralised policy managed by the network or security team.

## The real differentiator nobody talks about

This is where modern ZTNA solutions could actually be transformative—but it's not what the marketing focuses on.

Firewalls and VPN concentrators were never designed to delegate management control to application owners. Rule management was centralised, often requiring tickets, change control processes, and specialist knowledge. Want to grant access to a new application? Raise a ticket with the network team. Wait for the change window. Hope nothing breaks.

But modern ZTNA solutions, with cloud-native architectures and Terraform providers, can make delegation a reality. Application teams can define their own access policies as code, version-controlled and reviewed alongside their infrastructure. The security team doesn't need to be involved in day-to-day access decisions. Instead, they set guardrails: all internal applications must require MFA, posture checks must be enabled, and certain sensitive groups trigger additional logging.

The network team is no longer a bottleneck. Access policies are version-controlled, peer-reviewed, and deployed alongside the applications themselves. When an application is decommissioned, its access policies disappear with it—no orphaned firewall rules lingering in production.

This is fundamentally different from the old model. It's not about the technology being "cloud-native" or "zero trust" — it's about the operational model enabling teams to move at the speed of their applications rather than the speed of centralised change control.

## The elephant in the room

Of course, security teams have legitimate concerns about delegation. Won't application teams just grant access to everyone? Won't we end up with shadow IT 2.0, but for network access?

Maybe. But the alternative, centralised control that becomes a bottleneck, doesn't actually deliver better security. It delivers slow access provisioning, stale policies, and eventual workarounds that bypass controls entirely.

The answer is the same as with cloud platform teams: guardrails, not gates. Security teams define the boundaries. Application teams operate within them. Violations are detected and remediated automatically, not prevented through manual approval processes.

This requires trust. It requires tooling. It requires a shift in how we think about security governance. But it's the only model that scales.

## Why this matters now

The technology to enable delegated ZTNA management has existed for a few years now. But the organisational readiness is finally catching up.

Cloud-native application teams are already used to defining infrastructure as code. DevOps culture has normalised developers taking ownership of operational concerns. Github workflows have proven that you can maintain governance while delegating control.

ZTNA could finally deliver on its promises, not because the technology has fundamentally changed, but because the way we organise teams and manage infrastructure has evolved to make the delegation model viable.

It's just a shame that the marketing collateral still focuses on buzzwords like "zero trust" and "identity-centric" rather than talking about the operational transformation that actually matters.
