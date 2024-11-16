
# Egress Security

The Case for Application-Level Controls

## Introduction

The approach to securing outbound internet traffic often reflects an organisation’s security maturity more than its technical requirements. System-to-system communication, such as API calls to cloud services, presents fundamentally different challenges compared to user browsing. Understanding these differences is crucial for implementing effective security controls without unnecessary complexity or risk.

## Contrasting Approaches by Security Maturity

### The Less Mature Organisation

Organisations early in their security journey often default to implementing broad controls at the network edge. A common approach involves full TLS inspection of all outbound traffic using Azure Firewall Premium, regardless of whether it’s predictable system-to-system API calls or unpredictable user browsing.

This approach introduces several significant challenges:

Performance Impact

* Additional latency for API calls (typically 5–10ms per TLS termination)

* Increased resource utilisation

* Potential service degradation

* Transaction processing delays

Security Risks

* Exposure of encrypted traffic to third-party managed services

* Complex certificate management across diverse endpoints

* Potential for certificate-related outages

* Limited malware detection capabilities compared to dedicated secure web gateways

Operational Overhead

* Certificate deployment and rotation across multiple systems

* Trust store management across diverse endpoint types

* Regular policy updates and maintenance

* Complex troubleshooting during certificate-related incidents

### The Mature Organisation

More mature organisations recognise that different traffic types require different control approaches. They implement security controls primarily at the application level for system-to-system communication:

API Security

* Explicit allowed endpoint lists in application configuration

* Strong authentication and authorisation at the application layer

* Circuit breakers and timeout controls

* Detailed application-level logging and monitoring

Network Security

* SNI-based filtering without decryption

* Simple FQDN allow listing using lightweight tools

* Zero trust network architecture

* Separate handling of user and system traffic

This mature approach recognises that system-to-system communication is predictable and can be tightly controlled at the source, making edge-based TLS inspection largely redundant for API traffic.

## The Case for Traffic Separation

Modern security architectures should separate the handling of user and system traffic:

### System-to-System Traffic

For predictable API calls and microservice communication:

* Implement controls at the application layer

* Use simple FQDN filtering without decryption

* Focus on endpoint authentication and authorisation

* Leverage the predictable nature of system communication

### User Traffic

For unpredictable human-initiated browsing:

* Implement dedicated secure web gateways (e.g., Zscaler)

* Provide comprehensive threat protection

* Handle certificate management centrally

* Address the challenges of unpredictable browsing patterns

## Best Practice Recommendations

Application-Level Controls Instead of relying on edge decryption, focus on:

* Implementing strict endpoint allow listing in application code

* Using modern SDK security features

* Implementing robust logging and monitoring

* Regular security testing and validation

Network-Level Controls Adopt a nuanced approach:

* Use SNI-based filtering for system traffic

* Implement dedicated web security for user traffic

* Avoid unnecessary TLS inspection for API calls

* Maintain separate policies for user and system traffic

## Conclusion

The path to security maturity involves moving away from blanket edge controls towards context-aware security implementations. Organisations should strive to implement security controls as close to the application as possible, reserving edge-based inspection for unpredictable user traffic where it provides genuine security value.

Less mature organisations often implement broad edge controls out of an abundance of caution, but this approach can introduce more risks than it mitigates. The journey to maturity involves understanding that effective security isn’t about inspecting everything at the edge, but rather about implementing appropriate controls at the right points in the architecture.

Success lies in recognising that system-to-system communication can be effectively controlled through application-level mechanisms, while user traffic requires different approaches. This nuanced understanding marks the difference between organisations implementing security through broad controls versus those taking a more sophisticated, risk-based approach.
