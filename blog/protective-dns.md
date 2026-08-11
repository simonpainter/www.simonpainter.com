---

title: "Protective DNS: An Essential Security Control for Hybrid Cloud Networks"
authors: simonpainter
tags:
  - dns
  - security
  - educational
date: 2026-08-11

---

DNS sits at the heart of every internet transaction, translating human-readable domain names into the IP addresses that actually route traffic. It's so fundamental that most organisations barely think about it until something goes wrong. But DNS is also foundational in a different way for attackers: it's the layer where malware reaches out for instructions, where phishing links resolve, and where compromised systems phone home to their command and control infrastructure.

Protective DNS (PDNS) changes the game by turning DNS from a passive directory lookup service into an active security control. It's not a new concept—governments and security agencies have backed it for years—but it's increasingly becoming standard practice across both public and private sector networks. If you've been reading my recent articles on DNS architecture, from [hybrid cloud DNS](/hybrid-cloud-dns) to [encrypted DNS](/encrypted-dns), you've seen how DNS has evolved. PDNS is the natural next step in that evolution.

<!-- truncate -->

## What Protective DNS Actually Does

At its core, protective DNS is remarkably simple in concept: it intercepts your DNS queries and checks them against threat intelligence before responding. If you're asking for a domain that's known to be malicious, the PDNS resolver doesn't give you the answer. Instead, it blocks the query or redirects it somewhere safe.

The elegance of this approach lies in where it operates. DNS queries happen before any connection is made, before any malicious payload can execute. It's prevention at the earliest possible point in the attack chain. When a ransomware variant tries to download its encryption keys from a command and control server, PDNS stops it cold. When an employee's device is infected with malware and starts scanning the network for other hosts to compromise, PDNS prevents those lookups from resolving.

This is genuinely powerful. The NSA conducted testing and found that [using secure DNS would reduce the ability for 92 percent of malware attacks to utilise command and control infrastructure](https://cyberscoop.com/nsa-secure-dns-service-pilot-defense-industrial-base/). Not 92 percent of attacks would be blocked entirely—but 92 percent of attacks that did happen would have their command and control capabilities crippled. That's a huge impact from a single control.

Think back to the examples I've covered before: my [txtft tool](https://github.com/simonpainter/txtft) that trivially infiltrates malicious code into an organisation by bypassing controls, or the [DNS API proxy](/dns-api-proxy) that lets you exfiltrate data using DNS as a covert channel. Both of those were relatively straightforward demonstrations of just how easily DNS can be abused to move data in and out of an organisation without triggering any conventional security controls. PDNS is essentially the bouncer at the door, checking IDs and saying "no, that domain isn't getting through."

## How It Works: Response Policy Zones

The mechanism behind protective DNS is a policy-based resolver using something called a Response Policy Zone (RPZ). You've probably encountered zone files before if you've worked with authoritative DNS, and RPZs follow the same format but serve a completely different purpose.

When your network sends a DNS query to a PDNS resolver, it doesn't just go straight to the authoritative nameservers. The resolver first checks the query against its RPZ—essentially a policy database that says "if anyone asks for this domain, respond with this answer instead." That response might be an NXDOMAIN response, meaning "this domain doesn't exist," a sinkhole address that points to a safe page, or a custom response that logs the event for investigation.

These policies are built from threat intelligence feeds. PDNS providers—both commercial and government—maintain continuous feeds from open source intelligence, commercial threat feeds, and their own proprietary analysis. Some go further and use machine learning to spot previously unknown malicious domains by analysing patterns in domain names themselves, looking for things like high entropy or linguistic patterns associated with domain generation algorithms.

The thing that differentiates PDNS providers is largely the quality and breadth of their threat intelligence. Most commercial providers have access to roughly the same open source feeds that everyone else has—the lists maintained by various security researchers and organisations. But some providers, like [Cisco Umbrella](https://umbrella.cisco.com/), layer in proprietary intelligence gathered from their own infrastructure. Umbrella processes 620 billion DNS requests daily, which gives them a unique vantage point on emerging threats.

## The Practical Implementation Question

Where you deploy PDNS makes a significant difference to its effectiveness. In a traditional corporate environment, you'd simply point your internal DNS resolvers at a PDNS resolver, and all your internal devices would automatically benefit. This is straightforward and requires no per-device configuration.

But the world of work has changed. With hybrid and remote work becoming commonplace, plenty of your endpoints aren't sitting on your corporate network querying your corporate DNS. They're on home networks, coffee shop WiFi, or co-working spaces—querying whatever DNS resolver their ISP gives them or whatever they've configured locally. Your beautifully configured PDNS protection doesn't reach them.

This is where roaming clients come in. The [NCSC's PDNS service](https://www.ncsc.gov.uk/information/pdns) offers a roaming client for Windows, macOS, and iOS that uses encrypted [DNS over HTTPS (DoH)](/encrypted-dns). When the roaming client is installed, it directs all DNS traffic to the PDNS resolver using an encrypted channel, regardless of the network the device is connected to. It's transparent to the user and provides the same protection whether they're in the office or working from somewhere else entirely.

Commercial providers offer similar capabilities. [Cisco Umbrella](https://umbrella.cisco.com/)'s packages include roaming protection for Windows, macOS, iOS, Chrome OS, and Android. The general principle is the same: ensure that your DNS queries reach your chosen PDNS resolver no matter where you are.

## Available Services: Free and Paid Options

PDNS has moved from a specialist offering to something with mainstream availability. Let's look at what's actually available to organisations.

### Government-Backed Free Services

The [NCSC in the UK](https://www.ncsc.gov.uk/information/pdns) offers a free protective DNS service. It's free because it's centrally funded by the government, and it's mandated for all UK central government departments. If your organisation qualifies—and eligibility extends beyond central government to local authorities, emergency services, NHS organisations, and other public sector bodies—you can sign up through MyNCSC.

The NCSC's PDNS is implemented by Cloudflare and Accenture, which gives you some confidence in the infrastructure. You get access to their threat intelligence, metrics dashboards to monitor your network health, and outreach support from NCSC subject matter experts. Since it's publicly funded, there's a certain level of transparency and accountability that commercial services might not offer.

The NSA in the United States runs something similar, though their Protective DNS service has different eligibility requirements and is primarily focused on federal infrastructure.

### Commercial PDNS Services

For organisations that don't qualify for government services, commercial options exist. [Cisco Umbrella](https://umbrella.cisco.com/) is one of the most established, offering comprehensive PDNS as part of its broader security platform. You get real-time threat intelligence, the ability to investigate threats through their Umbrella Investigate tool, and cloud-native deployment that can scale globally.

[Vercara](https://vercara.com/protective-dns) offers UltraDDR (Ultra DNS Domain Response) as a standalone PDNS service. [BlueCat Networks](https://bluecatnetworks.com/) provides PDNS capabilities as part of their DNS management platform. [Infoblox](https://www.infoblox.com/) includes PDNS functionality in their security solutions. [DNSFilter](https://www.dnsfilter.com/) operates specifically as a PDNS provider with emphasis on real-time AI-based domain classification.

These services operate on a subscription model, and pricing scales based on the volume of queries or the number of protected users. Most require an upfront evaluation to determine the right pricing tier.

### In-House Deployment

Some organisations, particularly those with significant on-premises DNS infrastructure, deploy PDNS locally. Open source DNS servers like BIND support Response Policy Zones natively, which means you can implement PDNS using tools you likely already have. However, maintaining your own threat intelligence feeds, keeping them updated, and detecting novel threats all become your responsibility. This approach is more common in organisations with dedicated DNS teams, but it's generally viewed as requiring more operational overhead than using a managed service.

## Why This Matters for Network Engineers

From a network engineering perspective, PDNS is interesting because it solves problems at a layer that hasn't traditionally had security controls. We've had firewalls, intrusion detection/prevention systems (IDS/IPS), and web proxies handling traffic inspection for decades. But DNS queries were often treated as something that just worked, without much scrutiny.

The shift to PDNS reflects a fundamental change in how we think about network security. Rather than trying to filter everything at the perimeter, PDNS works everywhere—on the network, in the cloud, on remote devices. It's agnostic to your network topology, which is increasingly important as workloads become distributed.

For hybrid cloud environments, PDNS is particularly valuable. If you have workloads running in [AWS](https://aws.amazon.com/), [Azure](https://azure.microsoft.com/), Google Cloud, and on-premises, you can't rely on a single firewall or proxy. PDNS operates at the DNS layer, which is universal. Every cloud provider supports DNS, every on-premises system supports DNS, every remote device supports DNS. This universality makes it an extremely efficient control to implement across complex architectures.

There's also an operational benefit. When a PDNS service blocks a query, you get visibility into it. Well-designed PDNS services provide logging and analytics that show you what queries were blocked, from which devices, and why. This intelligence can be fed into your SIEM (Security Information and Event Management) system—[Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/overview) and Splunk both have connectors for various PDNS services—giving your security team another important data source for threat detection and incident investigation.

## Integration with Azure and Cloud-Native Deployments

If you're running in Azure, [Microsoft's Defender for DNS](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-dns-introduction) provides PDNS-like capabilities as part of Defender for Cloud. It monitors queries from Azure resources and detects suspicious activities including data exfiltration via DNS tunnelling, malware command and control communications, and attacks against malicious DNS resolvers. The advantage here is that there are no agents to deploy—the monitoring happens at the Azure DNS layer itself.

But Defender for DNS is specific to Azure resources. If you're running multi-cloud or hybrid cloud, you need something that spans across all your environments. This is where commercial PDNS services or the NCSC's offering become more attractive. They protect everything from remote workers to cloud instances to on-premises servers with a single, unified configuration.

## The Trade-offs You Should Consider

Nothing comes without trade-offs. Protective DNS works at the DNS layer, which means it can only block queries—it can't inspect the contents of encrypted HTTPS traffic or see what's happening after a connection is established. If an attacker has already compromised a domain that's in your organisation's allow list, PDNS won't help. Your allow list needs to be actively maintained.

There's also a performance consideration, though modern PDNS services are cloud-based and highly distributed, so latency is typically negligible. The NCSC's service is internet-accessible and designed to handle the scale of the entire UK public sector. Commercial services operate globally with multiple points of presence. The performance impact should be imperceptible.

And there's a subtle operational shift: you're now trusting an external party (or an internal policy engine) with visibility into your DNS queries. This visibility is a feature—it allows for threat detection—but it's a feature that some organisations need to think carefully about from a data governance perspective. If you're handling extremely sensitive data, you might want to understand exactly what's logged, where it's stored, and how long it's retained.

## Moving Forward

Protective DNS has become a security best practice recommended by government cybersecurity agencies globally. The NCSC mandates it for UK government. The NSA and CISA jointly recommended it for all organisations. It's not new technology—DNS and Response Policy Zones have existed for years—but the recognition of its value as a security control is relatively recent.

For network engineers, it represents a shift in thinking about DNS from purely a networking service to a critical security control. It's straightforward to deploy, universally applicable regardless of where your workloads run, and provides visibility that feeds into your broader security operations.

If you haven't yet deployed PDNS, now is a good time to evaluate the options. Whether you go with a government-backed free service, a commercial provider, or an in-house deployment depends on your organisation's requirements, but the control itself should probably be on your security roadmap.
