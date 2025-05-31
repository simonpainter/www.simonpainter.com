---

title: It's not just Zero Trust though
authors: simonpainter
tags:
  - networks
  - security
  - opinion
  - zero-trust

date: 2025-05-31

---

The shift from traditional network perimeters to zero trust architectures represents one of the biggest changes in cybersecurity thinking over the past two decades. But there's a dangerous misconception floating around that zero trust means ditching network security controls for identity-based systems. This misunderstanding has led many organisations to roll out incomplete solutions that create new vulnerabilities while trying to fix legacy security problems.
<!-- truncate -->
Here's the thing: zero trust doesn't replace network security with identity-based controls. It adds continuous identity verification to robust network architecture, creating defence-in-depth strategies that tackle modern threat landscapes. Understanding this requires looking at how network security has evolved and why purely identity-based approaches create critical single points of failure.

## The Foundation: Network Perimeter Security

Traditional network security worked like a castle with a moat. Strong perimeter defences protected trusted internal networks, with firewalls acting as the main gatekeepers. They controlled traffic flow between networks based on predetermined rules and policies. Once you got inside the perimeter, users and systems had mostly free access to resources within the trusted zone.

This model worked well when organisations operated within clearly defined physical boundaries. Employees accessed systems from corporate-managed devices connected to secure local networks. Applications lived on servers within controlled data centres, and network segmentation provided extra isolation for sensitive resources. The approach required multiple compromises for attackers to reach critical systems, as each network boundary presented distinct challenges.

The perimeter model's strength was its simplicity and the difficulty attackers faced when trying to breach multiple network layers. A successful attack required compromising external defences, establishing persistence within the network, escalating privileges, and navigating internal segmentation to reach target systems. Each stage created opportunities for detection and containment, building natural choke points that limited attack progression.

But this approach contained fundamental assumptions that would prove problematic as business requirements evolved. The model assumed that internal networks stayed trustworthy once access was granted, and that network boundaries provided sufficient isolation between different security zones. These assumptions would be challenged as organisations embraced remote work, cloud computing, and interconnected business partnerships.

## Early Identity Integration: VPN and Multi-Layer Authentication

Virtual private networks marked the first significant shift towards identity-based access controls. VPNs enabled remote access by extending trusted network connectivity over untrusted networks, but implementation often followed an all-or-nothing approach that provided broad network access after successful authentication.

This implementation pattern became widespread across organisations adopting remote access solutions. VPNs provided network-level connectivity that granted broad access once authentication succeeded, rather than implementing granular controls for specific resources. Users received trusted network access that enabled lateral movement between systems, creating attack paths that bypassed the intended security benefits of the authentication layers. Many ZTNA implimentations are adopting the same approach where a desire to ease the user journey and a need for rapid adoption betrays the good intentions.

## The SD-WAN Stepping Stone

Before examining current ZTNA implementations, I should acknowledge the role that software-defined wide area networking plays in zero trust adoption. [I wrote last year about SD-WAN deployment strategies](sdwan-strategic-step-to-ztna.md), establishing that organisations must view SD-WAN not as a network modernisation end-state, but as an essential stepping stone towards zero trust architectures.

SD-WAN enables greater network segmentation and moves organisations away from the flat networks that have dominated enterprise infrastructure. This technology provides crucial capabilities for heritage applications that can't support identity-based controls, offering secure network-layer protection for connectivity across public networks. The transitional approach allows organisations to implement hybrid security models where network-level authentication and encryption provide protection while application-level controls are developed and deployed.

The business case for SD-WAN adoption traditionally focused on cost savings versus MPLS circuits or enhanced network features. But these justifications often failed under scrutiny because fundamental VPN limitations including performance consistency, reliability, and operational complexity stayed relevant despite internet infrastructure improvements. Organisations must accept that transition periods typically increase rather than decrease costs, as running SD-WAN alongside existing infrastructure requires maintaining dual skill sets and managing hybrid operational complexity.

The compelling case for SD-WAN emerges when positioned as zero trust enablement rather than network replacement. This approach provides a practical path forward, using SD-WAN to facilitate broader zero trust adoption while maintaining security during migration periods. The investment pays off not through immediate network benefits, but through its role in enabling the security transformation that zero trust architectures require.

## Current Challenges: ZTNA Without Network Isolation

Building on the SD-WAN foundation, Zero Trust Network Access tools emerged as organisations recognised the limitations of traditional VPN architectures. ZTNA solutions promised to eliminate broad network access by providing application-specific connections based on identity verification and device compliance. Rather than granting network-level connectivity, these tools would authenticate users and devices before providing encrypted tunnels to specific applications.

This approach addressed several VPN limitations by implementing granular access controls, continuous device monitoring, and application-specific authentication. Users could access only the resources they required for their role, and compromised credentials wouldn't provide broad network access. The identity-centric model appeared to solve the fundamental problems with network-based security approaches.

But many ZTNA implementations have created new vulnerabilities by eliminating network segmentation entirely in favour of identity-based controls. Organisations deploy these solutions over flat network architectures where successful authentication provides access to systems that can reach any other system on the network. The ZTNA tool provides application-specific access, but compromised credentials still enable lateral movement through interconnected systems.

This implementation approach creates a critical single point of failure where identity compromise provides access to privileged resources that should stay isolated. Without proper network segmentation, a successful social engineering attack against a user account can provide network-level access to sensitive systems that the compromised user should never reach directly.

The problem becomes particularly acute when normal user credentials can access systems with connectivity to privileged access management tools, domain controllers, or financial systems. ZTNA tools may restrict direct application access, but network connectivity patterns enable indirect access through compromised systems. A user account compromise can lead to privilege escalation and lateral movement that defeats the intended security benefits.

This scenario shows why identity-based controls can't replace network architecture. Without proper network isolation, even sophisticated identity verification becomes a single point of failure that can provide keys to the kingdom through successful social engineering or credential compromise.

## The Cloud Architecture Challenge

Cloud computing has added extra complexity to this challenge as organisations try to replicate traditional data centre architectures in cloud environments. The standard hub-and-spoke landing zone model, particularly when implemented with virtual WAN connectivity, creates the same flat network vulnerabilities that zero trust principles aim to eliminate.

These architectures establish central connectivity hubs that enable communication between all connected resources by default, then try to layer network security groups as secondary controls. The approach mirrors traditional data centre thinking, where network connectivity is assumed safe and security controls are added as extra layers. Virtual WAN implementations can make this problem worse by creating high-bandwidth, low-latency connectivity between geographically distributed resources.

A truly zero trust cloud implementation would treat each application as an isolated island, with all user access and inter-system integrations happening over secured channels across public networks. This architectural approach makes sure that compromise of one system doesn't provide assumed trusted access to other systems. Applications communicate through authenticated and encrypted channels rather than relying on network-level connectivity for security.

This island approach requires fundamental changes to how organisations design cloud architectures. Rather than creating shared network infrastructure that connects multiple applications, each workload operates in isolation with specific, authenticated communication paths to required resources. Network connectivity becomes intentional and controlled rather than assumed and broad.

## Future Architecture: Application Isolation with Continuous Verification

The comprehensive solution requires combining robust network isolation with continuous identity verification throughout the user and system interaction journey. This integrated approach builds on the foundation that SD-WAN provides while implementing the granular controls that zero trust architectures demand.

I envision a network that uses segmentation and SD-WAN as transitional technologies, ultimately implementing identity-based controls for user access alongside combined user and network-based segmentation for privileged access. This hybrid model recognises that different systems require different security approaches based on their capabilities and risk profiles.

Network segmentation stays crucial for limiting attack progression and containing compromises. Applications should operate as isolated entities with minimal network connectivity to other systems. This isolation makes sure that compromised systems can't provide network-level access to unrelated resources, even when attackers achieve initial access through identity compromise. SD-WAN technologies enable this segmentation while maintaining connectivity for legitimate business requirements.

Identity verification must happen at every stage of the user and system interaction journey. Rather than performing authentication once and granting broad access, continuous verification makes sure that each request between systems includes identity validation. Authentication tokens pass between systems to validate requests, creating granular controls that can detect and prevent unauthorised access attempts.

Heritage applications that can't support modern identity controls benefit from the network-layer protection that SD-WAN provides. These systems can operate within secure network segments while modern applications implement application-level identity verification. This approach enables organisations to maintain security for legacy systems while progressively modernising their infrastructure.

Privileged access management becomes particularly critical in this architecture. Normal user credentials must not provide network access to privileged resources, regardless of how sophisticated identity verification systems are. Privileged access requires separate authentication flows, isolated network paths, and time-limited access grants that prevent standing access to sensitive systems. The combination of network and identity-based controls for privileged access creates multiple independent barriers against compromise.

Role-based privileged identity management makes sure that users receive only the minimum access required for their responsibilities. Time-based access controls limit how long privileged access lasts, reducing the window of opportunity for attackers who compromise privileged accounts. These controls work alongside network isolation to create multiple independent barriers against attack progression.

## Implementation Principles

Successful zero trust implementation requires treating identity and network controls as complementary rather than competing approaches. Identity verification provides granular access controls and continuous authentication, while network segmentation limits attack progression and contains compromises. Neither approach alone provides sufficient security for modern threat environments.

Organisations must resist the temptation to eliminate network controls when implementing identity-based systems. Network segmentation, application isolation, and privileged access restrictions stay crucial for preventing lateral movement and limiting attack impact. Identity controls enhance these protections by providing granular verification and continuous monitoring.

The integration of these approaches creates defence-in-depth strategies that address both external attacks and insider threats. Network isolation prevents compromised systems from accessing unrelated resources, while identity verification makes sure that access attempts are authenticated and authorised. This combination provides robust protection against sophisticated attack campaigns that try to exploit single points of failure.

Zero trust represents the evolution of network security rather than its replacement. By adding sophisticated identity verification to proven network architecture principles, organisations can create security frameworks that address modern business requirements without sacrificing the fundamental protections that network controls provide. The future of cybersecurity doesn't lie in choosing between network and identity security, but in combining them effectively to create comprehensive protection against evolving threats.
