---
title: "Public Preview: MCP gateway for Application Gateway for Containers"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - mcp
date: 2026-11-09
---

Application Gateway for Containers can now act as a gateway for Model Context Protocol (MCP) servers in public preview. A new Kubernetes resource, `MCPRoute`, lets you publish MCP servers through a Gateway API `Gateway`.

The gateway can put one or more MCP servers behind a stable endpoint, aggregate their tools and other capabilities, and apply controls such as JWT validation and Web Application Firewall (WAF) policies. Clients get one entry point; teams can keep owning and scaling their own servers.

This is aimed at teams running MCP servers in Kubernetes who need a consistent way to expose and protect them. The feature is still in preview, so its API and behaviour can change.
<!-- truncate -->

## What it is

MCP lets AI applications discover and use tools, resources, and prompts exposed by MCP servers. Application Gateway for Containers now understands MCP traffic well enough to route capability calls to the right server and, when configured, combine multiple servers behind one endpoint.

The feature adds an Azure-specific `MCPRoute` custom resource. It attaches to a Gateway API `Gateway` and forwards traffic to Kubernetes Services. For aggregation, the gateway combines discovery responses from multiple backend Services and prefixes capability names with the Service name to avoid collisions.

## Who should care

This is useful for platform teams that operate a shared gateway and application teams that own separate MCP servers. Instead of configuring every client with several server addresses, teams can publish the servers behind a stable hostname and path.

It also gives teams a place to apply shared ingress controls. JWT validation can authenticate callers, WAF policies can inspect requests, and backend TLS can secure traffic between the gateway and an MCP Service. The MCP server still needs to enforce permissions for the tools it exposes.

## How to use it

You need Application Gateway for Containers and the ALB Controller deployed, plus an MCP server exposed through a Kubernetes Service. Configure a Gateway listener to allow the `MCPRoute` kind, then create a route such as this:

```yaml
apiVersion: alb.networking.azure.io/v1alpha1
kind: MCPRoute
metadata:
  name: tools
  namespace: mcp-demo
spec:
  parentRefs:
    - name: mcp-gateway
      sectionName: mcp
  hostnames:
    - mcp.example.com
  path: /mcp
  backendRefs:
    - name: tools-server
      port: 8080
```

This publishes the `tools-server` Service on `mcp.example.com/mcp`. Apply the manifest with `kubectl apply -f mcproute.yaml`, then check that the route reports `Accepted=True` and `ResolvedRefs=True`. The listener must explicitly allow the `alb.networking.azure.io` group and `MCPRoute` kind.

To aggregate servers, add more backend references. The Learn walkthrough covers route setup, aggregation, session affinity, authentication, and testing an MCP endpoint.

## Gotchas and limits

`MCPRoute` uses the preview API version `alb.networking.azure.io/v1alpha1`, so manifests may need changes before general availability. It must attach directly to a `Gateway`; attaching it to a Gateway API `ListenerSet` isn't supported. Use `HTTPRoute` for ordinary web APIs and `GRPCRoute` for gRPC services.

An aggregated route supports up to 64 backends. Backend Service names become part of the capability names clients see, so choose stable names. Session affinity is best effort; stateful MCP servers should tolerate losing a session or store important state outside an individual pod.

Use an HTTPS listener for production endpoints and apply the relevant authentication and WAF policies. Preview terms apply, and a healthy backend alone doesn't guarantee a working endpoint - verify the Gateway and route status after changes.

## Quick takeaway

If you run MCP servers in Kubernetes, this preview offers a shared entry point for routing, aggregation, and ingress protection without asking each client to track every backend. Start with one route, test its status and security policies, and account for the preview API before building it into a production design.

## Links

- Official announcement: [Public Preview: MCP gateway for Application Gateway for Containers](https://azure.microsoft.com/updates?id=576388)
- Learn: [MCP capabilities in Application Gateway for Containers](https://learn.microsoft.com/azure/application-gateway/for/containers/mcp-gateway)
- Learn: [Configure an MCP gateway with Gateway API](https://learn.microsoft.com/azure/application-gateway/for/containers/how-to-mcp-gateway-gateway-api)
- Learn: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
