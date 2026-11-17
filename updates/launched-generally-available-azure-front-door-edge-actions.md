---
title: "Generally available: Azure Front Door edge actions"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - performance
date: 2026-11-17
---

Azure Front Door edge actions are now generally available. They let you run lightweight JavaScript at Front Door's global edge while it processes a client request or response, rather than sending every decision back to your application.

That gives teams a way to handle tasks such as header changes, redirects, request rejection, and origin selection close to users. The code runs in a tightly limited environment, so this is for quick decisions, not a replacement for application compute.
<!-- truncate -->

## What it is

An edge action is a JavaScript function that runs at an Azure Front Door point of presence. You can invoke it during client request or client response processing through a rule set associated with a Front Door route. The feature is available on both Standard and Premium profiles.

The action can inspect request context and change supported request or response properties. Microsoft runs each action in an isolated Hyperlight micro-VM, and you can keep up to three code versions for an action.

## Who should care

Edge actions suit teams that need small, time-sensitive decisions at the edge: adding a response header, routing a canary group to another origin, rewriting a URL, or rejecting a request before it reaches an origin.

They complement Front Door's rules engine. Use a rule for declarative conditions and actions; use JavaScript when the decision needs logic that those rules can't express.

## How to use it

In the Azure portal, open your Front Door profile and select **Settings > Edge actions** to create an action. Add a JavaScript version, test it in the browser editor, then associate it with a route. The association uses a rule set and an invocation point: **Client Request** or **Client Response**.

For example, this response action adds a header before Front Door sends the response to the client:

```javascript
function handler(event) {
    event.response.response_code = 200;
    event.response.headers['x-customheader'] = 'processedByEdgeActions';
    return event;
}
```

This follows the [official header-add sample](https://github.com/Azure/EdgeActionsSamples/tree/main/src/edgeactions-js/header-add). Test code in the portal first, then validate the behaviour through a real Front Door route.

## Gotchas and limits

Keep the code small and fast. Each action has a 16 KB code-size limit and a 10 ms execution limit; if it runs over that limit, Front Door stops the action and continues without its processing. JavaScript is the only supported language, and a subscription can have up to 100 edge action resources.

Creating an action doesn't attach it to a route. It won't run until you associate it with one. Also account for usage-based charges: Microsoft bills for invocations and execution time beyond 1 ms per invocation.

## Quick takeaway

Edge actions add programmable logic to Front Door's request and response path without moving that logic into every origin. They're useful for lightweight traffic decisions, provided you keep within the execution limits and test the route association before relying on it.

## Links

- Official announcement: [Generally available: Azure Front Door edge actions](https://azure.microsoft.com/updates?id=579310)
- Microsoft announcement: [Introducing Azure Front Door edge actions](https://techcommunity.microsoft.com/blog/azurenetworkingblog/introducing-azure-front-door-edge-actions---bringing-secure-programmable-logic-t/4531928)
- Learn: [Azure Front Door edge actions](https://learn.microsoft.com/azure/frontdoor/edge-actions)
- Samples: [Azure Front Door edge actions samples](https://github.com/Azure/EdgeActionsSamples)
