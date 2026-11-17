---
title: "Public Preview: Azure Front Door adds native gRPC support"
authors: simonpainter
tags:
  - azure
  - networks
  - performance
  - load-balancing
date: 2026-11-17
---

Azure Front Door can now route native gRPC traffic in public preview. The important change is that Front Door can use HTTP/2 both from clients to the edge and from the edge to your origins, rather than translating gRPC traffic to HTTP/1.1 on the origin connection.

That gives teams running gRPC services another way to use Front Door for global routing and origin health-based load balancing. The feature is available on Standard and Premium profiles, but it comes with some protocol and routing limits to account for.
<!-- truncate -->

## What it is

gRPC is a remote procedure call framework that uses HTTP/2 to carry calls between services. Front Door terminates the client's TLS connection at the edge, matches the request to a gRPC route, then sends it to a healthy origin over a separate HTTPS and HTTP/2 connection.

The preview supports unary calls, client and server streaming, and bidirectional streaming. You can route on a specific RPC method path, such as `/greet.Greeter/SayHello`, or use a broader path when you intend to expose multiple methods.

## Who should care

This is useful if you already run gRPC services and need a global entry point, health-based origin selection, or Front Door's edge controls. It lets clients reach services through Front Door without converting gRPC calls into a different application protocol.

It may also suit teams consolidating web and gRPC traffic behind Front Door. Check the limits below first: gRPC routes have different requirements from ordinary HTTP routes, especially around HTTPS, caching, and origin connectivity.

## How to use it

In the Azure portal, open your Front Door Standard or Premium profile and configure the gRPC origin group before creating the route:

1. Under **Settings > Origin groups**, add or edit the origins. Enable gRPC on every origin and set its HTTPS port to the port used by the gRPC service.
2. Configure health probes. A native gRPC probe requires the origin to implement the standard `grpc.health.v1.Health/Check` method. You can use an HTTP or HTTPS probe instead if the origin has a suitable health endpoint.
3. Under **Settings > Front Door manager**, add or edit a route. Select the domain and gRPC-enabled origin group, then turn on **Enable gRPC**.
4. Set **Patterns to match** to the full method path, including the leading slash. For example, `/greet.Greeter/SayHello`.
5. Save the route. Enabling gRPC sets the accepted and forwarding protocols to HTTPS only.

After deployment, you can test a method-specific route with [`grpcurl`](https://github.com/fullstorydev/grpcurl) and the service's `.proto` file:

```bash
grpcurl -import-path "." -proto "greet.proto" -d "{}" contoso.azurefd.net:443 greet.Greeter/SayHello
```

Replace the hostname and proto file with your own. The method in the command must match the route path and the service deployed at the origin.

## Gotchas and limits

- **Preview and supported tiers:** gRPC is in public preview for Front Door Standard and Premium. Review the [Azure preview terms](https://azure.microsoft.com/support/legal/preview-supplemental-terms/) before relying on it for production workloads.
- **HTTPS and HTTP/2 on both connections:** Origins must accept TLS and HTTP/2 on their configured HTTPS port. Every origin in the selected origin group must have gRPC enabled.
- **No caching or redirects:** Caching is disabled on gRPC routes, and redirects aren't supported. Keep route and rule-set forwarding on HTTPS; a rule that forwards over HTTP can return an HTTP 301 that a gRPC client can't use as a redirect.
- **Private Link isn't supported for gRPC origins** during the preview. An origin group enabled for gRPC also can't be the target of a route-configuration override rule.
- **WAF doesn't inspect protobuf messages:** Front Door WAF can evaluate supported request metadata, such as the URI, headers, client IP, and geography. It doesn't decode gRPC message bodies for inspection.
- **Health checks need the right endpoint:** A native gRPC probe checks `grpc.health.v1.Health/Check`, not an application method. Use an HTTP or HTTPS probe if your service doesn't implement the standard gRPC health service.

## Quick takeaway

Native gRPC support means Front Door can keep the HTTP/2 transport intact from the client through to a healthy origin. It's worth evaluating if you need global routing for existing gRPC services, but design around the HTTPS-only path, disabled caching, and preview restrictions.

## Links

- Official announcement: [Azure Front Door adds native gRPC support](https://azure.microsoft.com/updates?id=579383)
- Learn: [gRPC support in Azure Front Door (preview)](https://learn.microsoft.com/azure/frontdoor/grpc)
- Learn: [HTTP/2 support in Azure Front Door](https://learn.microsoft.com/azure/frontdoor/front-door-http2)
- Learn: [Azure Front Door health probes](https://learn.microsoft.com/azure/frontdoor/health-probes)
- Learn: [Web Application Firewall on Azure Front Door](https://learn.microsoft.com/azure/frontdoor/web-application-firewall)
