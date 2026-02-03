---

title: ZTNA is so much better than VPN
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

This wasn't last week when I was talking to the folks at [zScaler](https://www.zscaler.com). It was 2008, and the product was a Cisco ASA with Cisco's Anyconnect VPN client.

Nowadays we talk about Zero Trust Network Access (ZTNA) as the solution to this very same problem. But is it really that different from the SSL VPNs of old?
<!--truncate-->

## The promises haven't changed

My problem with ZTNA is that all the marketing material promises the same things I was promised back in 2008. Those things never really materialised for us back then, so what makes us think they will now?

In nearly two decades, I've only ever seen one VPN deployment where application-level access control actually worked. It was in the late twenty-teens at a payment provider using Checkpoint. We connected to our management desktops, and the Checkpoint client used our group membership to determine which management interfaces we could reach.

This setup did two things well. It enforced application-level access control on top of the privileged identity needed to log into each device. It also meant that legacy kit with weak ciphers—or even telnet and HTTP—could be secured at the network layer from prying snoopers.

## So what's the difference?

Here's the thing: that Checkpoint deployment is basically exactly what ZTNA promises to do. But it was an edge case in my experience. Managing privileged access to a handful of management interfaces for a security-conscious card payment provider was compelling. Creating policies for hundreds of applications across thousands of different user personas in a typical enterprise? Much less so.

Identity-based access control sounds great in theory. In practice, it requires collaboration between the identity team, the security team, the network team, and the application owners to define and maintain access policies. This is a massive organisational challenge that most enterprises struggle with.

The reality is that most organisations have a sprawl of applications, many of which are legacy or poorly documented. The idea of defining granular access policies with role personas is daunting—and often abandoned before it starts.

## Lessons from file shares

We've seen this problem before with file shares. Remember when central teams would define sharing permissions based on departmental roles? How well did that work out?

The solution was to move to a delegated model where data owners are responsible for defining access to their own data. If we apply this same logic to ZTNA, we need to empower application owners to define who can access their applications, rather than trying to enforce a centralised policy.

## The real differentiator nobody talks about

Firewalls and VPN concentrators were never designed to delegate management control to application owners. But modern ZTNA solutions, with cloud-native architectures and Terraform providers, can make this a reality today.

Application teams can define their own access policies as code, version-controlled and reviewed alongside their infrastructure. Security teams can set guardrails and audit policies without becoming a bottleneck. This delegation model is the key differentiator for modern ZTNA solutions.

It's just a shame that nobody talks about it in the marketing collateral.
