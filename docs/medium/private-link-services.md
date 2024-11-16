
# Azure Private Link Services: Enabling Secure and Flexible Network Architectures

The glue you never knew you needed.

### Introduction

Often organisations face the challenge of securely exposing services across various network boundaries. Whether it’s sharing resources during a merger, providing services to customers, or managing internal shared services, the need for secure, private connections is paramount. Azure Private Link service is a powerful solution to these challenges, offering a way to enable private connectivity to services in Azure across organisational and networking boundaries without exposure to the public internet.

### Key Features of Azure Private Link

Azure Private Link offers a great set of features designed to enhance security and flexibility in network architectures. It enables consumers to access services using private IP addresses within their own virtual networks, ensuring traffic flows over the Microsoft backbone rather than the public internet. Each service is assigned a globally unique alias, masking underlying Azure resource details. The service supports cross-tenant connections, allowing access from different Azure Active Directory tenants. Granular access control mechanisms enable service providers to manage visibility and automate connection approvals. Additionally, the TCP Proxy Protocol v2 support allows retrieval of consumer connection information, including source IP and link identifier, providing valuable insights for service providers.

### Implementation Considerations

When implementing Azure Private Link, several factors must be considered. The service typically uses an Azure Standard Load Balancer and supports only TCP and UDP traffic over IPv4. Each load balancer is limited to eight frontend IP configurations, and a single service can connect to up to 1,000 private endpoints. An important constraint to note is that the Azure Standard Load Balancer used with Private Link service can only have Azure virtual machine network interfaces (NICs) as backend targets, not supporting backend IP addresses directly. This limitation means on-premises resources cannot be included directly in the load balancer’s backend pool when using Private Link service.

For scenarios requiring connectivity to on-premises resources, or other IP based back end targets, Azure Application Gateway can be used in conjunction with Private Link service. However, it’s good to remember that Application Gateway is limited to HTTP, HTTPS, and WebSocket protocols, which may impact the types of services that can be exposed through this method, although that may change if Microsoft release their Application Gateway TCP/TLS proxy to GA.

### Real-World Scenarios

**Merging Organisations and Third-Party Service Publication**

Azure Private Link service offers a good solution for organisations undergoing mergers or acquisitions, as well as for securely publishing services to third parties like customers, partners, or suppliers. In cloud-to-cloud scenarios, when two organisations need to share resources but cannot establish direct network routing, Private Link service allows a cloud service in one organisation to be accessed by another organisation’s Azure environment without network integration or public internet exposure.

For cloud to on-premises access, Azure Application Gateway can be used in conjunction with Private Link service. This setup allows on-premises services to be published and made accessible to other organisations’ Azure environments. This pattern is equally valid for exposing services between merging organisations, publishing services to customers or suppliers, and providing secure access to partners or third-party collaborators.

The benefits of this approach include immediate resource sharing, enhanced security preservation, simplified compliance, and flexible implementation. However, considerations such as protocol limitations with Application Gateway, scalability planning, DNS configuration, and access control management must be addressed.

**Optimising Limited Address Space**

Organisations with constrained IP address resources can use Private Link service to efficiently manage their network architecture while maintaining application isolation. In this scenario, applications are deployed in isolated virtual networks with potentially overlapping IP spaces. Non-routable IP addresses are used for backend services within each isolated network. Application frontends are then exposed through Azure Standard Load Balancer and Private Link service, making them accessible in routable segments through private endpoints.

This approach offers several advantages, including efficient IP usage, simplified management, enhanced security, scalability, and flexibility in application architecture. However, it requires careful network design, proper DNS configuration, and comprehensive monitoring to ensure smooth operation.

**Centralised Shared Services Distribution and External Service Publication**

Private Link service provides an elegant solution for distributing internal shared services and securely exposing services to external parties and this is the oft cited example for use. Services are deployed in a dedicated, isolated virtual network and exposed via Azure Standard Load Balancer and Private Link service. Internal teams and external parties can then create private endpoints in their networks to access these services.

The benefits of this approach include enhanced security, simplified network architecture, scalability, consistent access methods, and traffic isolation. However, organisations must consider implementing robust service discovery mechanisms, managing access control carefully, ensuring comprehensive monitoring and governance, and planning for capacity growth.

### Conclusion

Azure Private Link service stands out as a fantastic tool in the cloud network architect’s toolkit. It addresses a wide range of scenarios, from facilitating mergers and acquisitions to optimising internal network architectures and securely publishing services to third parties.

Using Private Link service, organisations can securely share resources across organisational boundaries without breaking network isolation. They can optimise the use of limited IP address space while maintaining application isolation, centralise and securely distribute shared services across multiple environments, and publish services to external parties without exposing them to the public internet.

The flexibility and security offered by Private Link service make it an asset for organisations navigating the difficulties of modern cloud networking. As businesses continue to expand their cloud footprint, solutions like Azure Private Link service will play a big part in maintaining security, efficiency, and scalability.
