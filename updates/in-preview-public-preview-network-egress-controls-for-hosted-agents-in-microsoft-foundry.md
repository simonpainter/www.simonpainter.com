---
title: "Public Preview: Network egress controls for hosted agents in Microsoft Foundry"
authors: simonpainter
tags:
  - azure
  - ai
  - networks
date: 2026-09-19
---

Microsoft has put network egress controls for hosted agents in Microsoft Foundry into public preview. You can now decide which outbound destinations a hosted agent may call, rather than letting it reach anything on the public internet by default.

That matters if you're building agents that touch internal APIs, regulated data, or paid third-party services. It gives you a tighter fence around what the agent can talk to, which is often the missing piece when an AI pilot needs to move into a more controlled environment.

The useful bit is that this sits inside the same guardrail policy model Microsoft Foundry already uses for Responsible AI controls. So instead of bolting on a separate network product, you define ordered egress rules on the agent's policy and let the runtime enforce them inside the hosted sandbox.

<!-- truncate -->

## What it is

Network egress controls govern the **outbound** connections a hosted agent makes. You define rules that match a destination host, then tell Foundry what to do when a rule matches.

The rules are evaluated from top to bottom, and the first match wins. If nothing matches, the policy's default action applies. In practice, that means you can build either an allow list with `defaultAction: Deny`, or a deny list with `defaultAction: Allow`.

The supported actions are:

- **Allow** - let the request out
- **Deny** - block it
- **Transform** - allow it and modify request headers
- **Rewrite** - send it somewhere else

Microsoft also says the platform keeps its own foundational domains allow-listed so the hosted agent can still function. That's helpful because a deny-by-default policy won't break the service plumbing you don't control.

## Who should care

This is for teams using **hosted agents**, not prompt-based agents or plain model deployments. If your agent calls internal APIs, SaaS endpoints, or data sources outside Foundry, this preview gives you a cleaner way to reduce where that traffic can go.

I think it will matter most to security teams, platform teams, and anyone working in a regulated setting. It's a bit like giving the agent a travel pass with a short approved route, instead of an open train ticket to the whole country.

It also helps when you're trying to prove intent. "This agent may call these domains and nothing else" is much easier to explain in a design review than "trust me, the prompt won't do anything odd".

## How to use it

You add the rules to a **Responsible AI policy** attached to the hosted agent. The Learn docs say to use the `2026-05-15-preview` API version for the `Microsoft.CognitiveServices/accounts/raiPolicies` resource.

The safest rollout path is to start in **Audit** mode, review what the agent is trying to call, then switch to **Enforced** once the rule set looks right. Audit mode only softens **Deny** actions. **Transform** and **Rewrite** still take effect while you audit, so treat those rules with care.

Here's a simple Bicep example from the Microsoft Learn guidance that builds an allow list for `*.contoso.com`:

```bicep
@description('Name of the existing Foundry resource.')
param accountName string

resource account 'Microsoft.CognitiveServices/accounts@2026-05-15-preview' existing = {
  name: accountName
}

resource egressPolicy 'Microsoft.CognitiveServices/accounts/raiPolicies@2026-05-15-preview' = {
  parent: account
  name: 'allow-contoso'
  properties: {
    mode: 'Blocking'
    basePolicyName: 'Microsoft.DefaultV2'
    egressPolicy: {
      mode: 'Enforced'
      defaultAction: 'Deny'
      rules: [
        {
          name: 'allow-contoso'
          ruleType: 'Fqdn'
          match: {
            host: '*.contoso.com'
          }
          action: {
            actionType: 'Allow'
          }
        }
      ]
    }
  }
}

output RAI_POLICY_ID string = egressPolicy.id
```

If you'd rather work in the portal, Foundry exposes this as a **Network** control on a guardrail. You choose the default outbound action, add ordered host-based rules, and assign the guardrail to the hosted agent.

You can also review the decisions in Application Insights. Microsoft's example Kusto query is small and useful:

```kusto
traces
| where timestamp > ago(1h)
| where message == "Network egress decision"
```

## Gotchas and limits

There are a few catches in this preview.

First, this applies to **hosted agents only**. It doesn't cover prompt-based agents or model deployments, so don't assume you've solved outbound control for every Foundry workload.

Second, the limit is **480 egress rules per policy**. That's a decent ceiling, but not infinite. If your design needs hundreds of destinations, it may be a sign that you need to tidy the integration pattern before the rule set becomes hard to reason about.

Third, the enforcement lives **inside the Foundry-managed sandbox**. Microsoft is clear that this complements tools like Azure Firewall rather than replacing them. It also isn't centrally enforced through Azure Policy during preview.

There are feature gaps too. In the portal, rules match on **host**. Dynamic header values from a managed identity or secret reference aren't enforced yet, so use static values only for header transforms. Service tags and IP range-based rule types are also still on the "coming later" list.

One more practical point: blocked outbound requests come back to the agent runtime as **HTTP 403**. That means your agent might report a failed tool call or try a fallback path, so it's worth checking trace data when behaviour looks odd after you enable rules.

If you need full private networking, this isn't the same thing as putting Foundry into a bring-your-own or managed virtual network. Egress controls narrow where a hosted agent can call from within the sandbox. They don't turn public networking into private networking on their own.

## Quick takeaway

This is a solid preview for anyone who wants tighter outbound control without redesigning their whole Foundry setup. The best pattern looks clear: start in audit mode, build a small allow list, check the traces, then enforce it once you're confident.

I wouldn't treat it as a full replacement for broader network design, but as a guardrail for hosted agents it fills a real gap.

## Links

- Official announcement: [Public Preview: Network egress controls for hosted agents in Microsoft Foundry](https://azure.microsoft.com/updates?id=571821)
- Learn: [Add guardrails to a hosted agent](https://learn.microsoft.com/azure/foundry/agents/how-to/add-hosted-agent-guardrails)
- Learn: [Guardrails and controls overview in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/guardrails/guardrails-overview)
- Learn: [Networking options for Foundry Agent Service](https://learn.microsoft.com/azure/foundry/agents/concepts/networking-options)
- ARM template reference: [Microsoft.CognitiveServices/accounts/raiPolicies@2026-05-15-preview](https://learn.microsoft.com/azure/templates/microsoft.cognitiveservices/2026-05-15-preview/accounts/raipolicies)
