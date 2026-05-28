---
title: "Generally Available: Application Gateway for Containers, service mesh integration with Istio"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - cloud
  - load-balancing
  - architecture
date: 2026-05-28
---

Microsoft has announced general availability for Application Gateway for Containers integration with Istio service mesh. The goal is simple: make secure north-south traffic into mesh workloads easier to run in production.

The key change is that the ALB Controller Service Mesh Extension can automate mTLS handling between Application Gateway for Containers and services inside the Istio mesh. That cuts down manual certificate handling and reduces ingress complexity.

If you run AKS with Istio and need a cleaner edge-to-mesh path, this update is worth your attention.
<!-- truncate -->

## What it is

This feature connects Application Gateway for Containers to an Istio sidecar-based service mesh for ingress traffic. You still get Application Gateway controls at the edge, and you can keep Istio policy and service-to-service controls inside the mesh.

Microsoft announced the update here: [Generally Available: Application Gateway for Containers - Service Mesh integration with Istio](https://azure.microsoft.com/updates?id=564714).

For implementation details, start with these docs:

- [Service mesh integration with Application Gateway for Containers](https://learn.microsoft.com/azure/application-gateway/for-containers/service-mesh-integration)
- [Application Gateway for Containers overview](https://learn.microsoft.com/azure/application-gateway/for-containers/overview)

## Who should care

This is useful for platform teams running AKS with Istio where inbound traffic has to be secure and manageable. If you currently maintain mTLS ingress wiring by hand, this can remove repetitive work.

It is also useful for teams standardising on Gateway API for modern Kubernetes ingress patterns. The integration is designed around that model rather than legacy ingress definitions.

## How to use it

At a high level, install or confirm ALB Controller, then install the service mesh extension, and finally define your Gateway API resources.

Here is a concrete install example from Microsoft Learn:

```bash
HELM_NAMESPACE='<namespace for deployment>'
RESOURCE_GROUP='<your resource group name>'
AKS_NAME='<your aks cluster name>'

az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME

helm install alb-controller-servicemesh-extension oci://mcr.microsoft.com/application-lb/charts/alb-controller-servicemesh-extension \
  --namespace $HELM_NAMESPACE \
  --version 1.10.28
```

Then verify the extension pods are running:

```bash
kubectl get pods -n azure-alb-system
```

The Learn article walks through namespace labels for Istio sidecar injection, mTLS policy, and Gateway plus HTTPRoute setup.

## Gotchas and limits

There are a few limits to keep in mind. This path assumes sidecar-based Istio; ambient mode is not supported.

Gateway API is required for this integration; Ingress API is not supported for the service mesh extension flow. Also check supported Istio versions and extension versions before rollout.

If you install the service mesh extension before installing Istio, you may need to restart the extension deployment after Istio is in place.

## Quick takeaway

This GA release makes edge-to-mesh ingress cleaner for AKS teams using Istio. You can reduce manual mTLS work while keeping strong ingress controls and service mesh policy where each one fits best.
