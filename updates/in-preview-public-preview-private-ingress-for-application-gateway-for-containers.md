---
title: "Public Preview: Private ingress for Application Gateway for Containers"
authors: simonpainter
tags:
  - azure
  - networks
  - security
date: 2026-11-09
---

Application Gateway for Containers can now receive traffic through a private frontend with no public IP address. Clients reach it over Azure Private Link private endpoints, so you can expose AKS applications to internal networks without putting their ingress directly on the internet.

This is useful for internal services, cross-cluster traffic, or deployments where a firewall or another gateway must be the internet-facing entry point. You can still use Gateway API routing and attach a Web Application Firewall (WAF) policy to the private frontend.

<!-- truncate -->

## What it is

A private frontend removes the public IP address from the Application Gateway for Containers entry point. A client must connect through an explicitly created and approved private endpoint before it can reach the frontend. Private endpoints can connect across virtual networks, subscriptions and Microsoft Entra tenants, without VNet peering.

The private frontend uses the same Kubernetes Gateway API routing as a public one. You can also have public and private frontends on the same Application Gateway for Containers resource, with separate routes and WAF policies.

## Who should care

This is worth considering if your AKS workloads should only accept traffic from known networks. It suits internal APIs and corporate applications, and it can connect services across clusters without sending traffic out to a public address and back.

It also fits architectures where Azure Firewall, a network virtual appliance, a CDN or a partner gateway is the intended public entry point. The upstream service can reach the workload through a private endpoint instead.

## How to use it

For an ALB-managed deployment, create a Gateway with the private GatewayClass. The ALB Controller provisions a private frontend for it:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: internal-gateway
  namespace: apps
  annotations:
    alb.networking.azure.io/alb-namespace: alb-system
    alb.networking.azure.io/alb-name: internal-alb
spec:
  gatewayClassName: azure-alb-internal
  listeners:
    - name: http
      port: 80
      protocol: HTTP
      allowedRoutes:
        namespaces:
          from: Same
```

Add an `HTTPRoute` that points to your application service, then create a private endpoint targeting the frontend. Approve the connection if it isn't approved automatically, and configure private DNS so clients resolve the frontend name to the private endpoint address.

For a bring-your-own deployment, create the private frontend through the Azure REST API, setting `publicNetworkAccess` to `disabled`, then reference it from your Gateway. The Learn guide uses API version `2026-03-01`.

## Gotchas and limits

This is a public preview, so the [Azure preview terms](https://azure.microsoft.com/support/legal/preview-supplemental-terms/) apply. You need ALB Controller v1.13 or newer, and the Application Gateway for Containers association resource must have been created on or after 23 April 2026.

For bring-your-own deployments, private frontend configuration requires REST API version `2026-03-01` or later. The standard `az network alb frontend create` command doesn't yet expose the required `publicNetworkAccess` setting, so use `az rest` instead. A frontend doesn't get a usable address until its private endpoint is connected and approved; DNS must also resolve through the private endpoint.

If you put Azure Firewall or an NVA in front of the private endpoint, it can perform source NAT. Application Gateway for Containers then sees the firewall's address rather than the original client address, which affects logging and IP-based rules. WAF policies are supported through a `SecurityPolicy` resource and are associated with each frontend.

## Quick takeaway

Private ingress gives Application Gateway for Containers a private-only frontend while keeping its Kubernetes-native routing and WAF options. Check the controller and resource prerequisites first, then plan the private endpoint approval and DNS path before moving clients over.

## Links

- Official announcement: [Public Preview: Private ingress for Application Gateway for Containers](https://azure.microsoft.com/en-us/updates?id=576393)
- Learn: [Private ingress with Application Gateway for Containers](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/private-ingress)
- Learn: [Configure private ingress with Gateway API](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/how-to-private-ingress-gateway-api)
- Learn: [Web Application Firewall on Application Gateway for Containers](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/web-application-firewall)
