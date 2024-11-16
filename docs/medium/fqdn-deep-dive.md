
# FQDN Filtering in Cloud Security: A Technical Deep Dive

Not all FQDN filters are built the same.

## Executive Summary

This analysis examines the technical implementations of FQDN filtering across three platforms: [Azure Firewall](https://learn.microsoft.com/en-us/azure/firewall/overview), [FortiGate](https://www.fortinet.com/products/next-generation-firewall), and [Enforza](https://www.enforza.io/). We explore the fundamental differences in their approaches to DNS handling, TLS inspection, and wildcard filtering capabilities. Key focus areas include:

* DNS proxy implementations for Layer 3 filtering

* SNI-based vs full TLS inspection approaches for Layer 7 filtering

* FortiGate’s unique DNS packet sniffing for wildcard FQDN support

* Implications of TLS inspection requirements for URL path filtering

* Architectural considerations for system-to-system communication

## Technical Implementation Analysis

### DNS Proxy Architectures

Both Azure Firewall and FortiGate implement DNS proxy capabilities for Layer 3 network rules, though their approaches differ significantly.

Azure Firewall requires DNS proxy enablement for any FQDN-based network rules. This mandatory configuration ensures all DNS queries flow through the firewall, maintaining accurate FQDN-to-IP mapping. The firewall updates these mappings every 15 seconds, with IPs expiring after 15 minutes if no longer returned by DNS queries.

FortiGate offers more flexibility through two distinct approaches:

1. Traditional DNS proxy mode, similar to Azure Firewall

1. DNS packet sniffing mode, enabling passive monitoring without proxy requirements

Enforza focuses on Layer 7 HTTP/HTTPS traffic, avoiding the complexity of DNS proxy architecture entirely.

### Layer 7 Inspection Mechanisms

Each platform handles Layer 7 inspection differently, particularly for HTTPS traffic:

Azure Firewall’s application rules use SNI inspection by default, examining the TLS handshake without decrypting traffic. Full TLS inspection requires Premium SKU and presents several limitations:

* Requires certificate deployment and management

* Cannot inspect certain categories (health, finance, government)

* Limited to outbound and east-west traffic

FortiGate provides comprehensive options:

* SNI-based inspection without decryption

* Full TLS inspection with certificate management

* Web filter profiles with granular control

* Support for custom certificate authorities

Enforza implements SNI-based filtering exclusively, optimised for cloud workloads and system-to-system communication.

### Wildcard FQDN Implementation

FortiGate stands alone in supporting wildcard FQDN filters at Layer 3, achieved through its DNS packet sniffing capability. This enables matching patterns like *.example.com across any protocol, not just web traffic.

Azure Firewall restricts wildcard support to application rules:

* HTTP/HTTPS traffic

* MSSQL protocol

Enforza supports wildcards only for HTTP/HTTPS, aligning with its focused approach to web traffic filtering.

### URL Path Filtering Considerations

Full URL path filtering (beyond the slash) requires full TLS inspection, something that may not be desirable for all traffic.

## Architectural Implications

### System-to-System Communication Patterns

Modern cloud architectures predominantly handle system-to-system communication, where traditional full TLS inspection often proves unnecessary. For these scenarios, SNI-based filtering provides several advantages:

* Lower latency through avoided decryption

* Simplified certificate management

* Reduced operational complexity

* Sufficient security for known API endpoints

* Better performance at scale

### Certificate Management Overhead

The implications of certificate management vary significantly between platforms:

Azure Firewall Premium requires:

* Integration with Azure Key Vault

* Intermediate CA certificate deployment

* Trust configuration on endpoints

* Regular certificate rotation

* Premium SKU licensing

FortiGate demands:

* Complex PKI infrastructure

* Certificate deployment strategies

* Trust store management

* Mobile device considerations

* Regular maintenance overhead

Enforza avoids certificate management entirely through its SNI-focused approach.

## Platform Differentiators

![](https://cdn-images-1.medium.com/max/2524/1*6h_kBsbCImuIpaC82Nc5hQ.png)

### Azure Firewall

Represents Microsoft’s cloud-native vision with clear architectural boundaries:

Strengths:

* Native Azure integration

* Simplified management interface

* Automated scaling

* Consistent security model

* Lower operational complexity

Limitations:

* Rigid architectural constraints

* Limited protocol support for wildcards

* Premium SKU requirements for advanced features

* Less granular control options

### FortiGate

Provides traditional enterprise firewall capabilities with maximum flexibility:

Strengths:

* Comprehensive protocol support

* Layer 3 wildcard FQDN filtering

* Granular policy control

* Flexible deployment options

* Deep packet inspection capabilities

Limitations:

* Complex configuration requirements

* Significant operational overhead

* Requires specialist expertise

* Higher maintenance burden

### Enforza

Focuses on modern cloud workload requirements:

Strengths:

* Simplified deployment model

* Efficient SNI-based filtering

* Multi-cloud support

* Lower operational overhead

* Cost-effective implementation

Limitations:

* Limited to HTTP/HTTPS traffic

* No Layer 3 wildcard support

* Less granular control options

## Conclusion

The choice between these platforms reflects fundamental differences in organisational maturity and architectural philosophy.

Azure Firewall embodies Microsoft’s cloud-native vision, prioritising architectural purity over functional breadth. This approach particularly suits organisations with:

* Limited traditional firewall expertise

* Strong cloud platform knowledge

* Preference for managed services

* Acceptance of prescribed security patterns

However, this architectural purity comes at the cost of flexibility. Organisations often find themselves adapting security requirements to fit Azure Firewall’s constraints rather than the platform adapting to business needs.

FortiGate offers comprehensive capabilities but demands significant expertise. Its traditional approach suits organisations with mature security teams capable of managing complex configurations and maintaining sophisticated policy frameworks.

Enforza provides a pragmatic middle ground, particularly suitable for organisations focused on modern web-based workloads without the operational overhead of traditional enterprise firewalls.

The key to successful implementation lies in matching the solution to organisational capabilities rather than technical features alone. Azure Firewall’s simplified approach, while potentially constraining for sophisticated security teams, provides a solid foundation for organisations with limited network security expertise. Conversely, FortiGate’s flexibility, while powerful, may prove overwhelming for teams without dedicated firewall engineering capabilities.

As cloud architectures continue to evolve, the balance between architectural purity and business requirements becomes increasingly crucial. Azure Firewall’s cloud-native approach, though sometimes restrictive, offers a clear path forward for organisations prioritising operational simplicity over granular control. For organisations requiring more flexibility and comprehensive protocol support, FortiGate’s traditional approach remains valuable, despite its complexity. Enforza’s focused approach offers an alternative for organisations seeking effective web traffic control without the operational overhead of traditional solutions.
