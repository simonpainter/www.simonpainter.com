---
title: "Public Preview: AI bot ruleset for Azure Front Door Premium WAF"
authors: simonpainter
tags:
  - azure
  - networks
  - firewall
  - security
  - ai
date: 2026-11-19
---

Azure Front Door Premium WAF can now identify AI crawlers and agents, group them by what they do, and apply a different action to each group. The public preview gives site owners more control than `robots.txt`, which only works when a bot chooses to follow it.

You can log, allow, block, or challenge AI traffic at the edge. That lets you decide whether bots can collect content for model training, index it for AI search, or fetch it for an interactive assistant.
<!-- truncate -->

## What it is

The AI bot ruleset is a Microsoft-managed ruleset for Azure Web Application Firewall on Front Door Premium. It classifies requests into four groups: verified AI training crawlers, verified AI search crawlers, verified interactive agents, and miscellaneous AI bots that WAF can't verify.

Each group has its own rule. Microsoft maintains the bot signatures, so you don't need to update the ruleset version as bots change. All four rules start with the **Log** action, which records matching requests without blocking them.

## Who should care

This is useful if you run a public website or API and want different policies for AI traffic. You might block training crawlers while allowing search crawlers, or challenge bots that WAF can't verify.

The categories describe what a bot does, not which company owns it. A single provider can have bots in more than one group, so choose actions based on the effect you want rather than the provider's name.

## How to use it

In the Azure portal, open your Front Door Premium WAF policy, select **Managed rules**, assign the AI bot ruleset, and save. Start with the default **Log** actions, then review the WAF logs before changing any rule to enforce a decision.

You can also add the ruleset and block verified AI training crawlers with Azure CLI. Replace the resource group and policy names with those for your WAF policy:

```bash
az network front-door waf-policy managed-rules add \
  --resource-group FrontDoorWafPolicy \
  --policy-name WafPolicy \
  --type Microsoft_AIBotRuleSet \
  --version 1.0

az network front-door waf-policy managed-rules override add \
  --resource-group FrontDoorWafPolicy \
  --policy-name WafPolicy \
  --type Microsoft_AIBotRuleSet \
  --rule-group-id AIBotAccess \
  --rule-id 800101 \
  --action Block
```

Rule `800101` covers verified AI training crawlers. The other categories remain on **Log** in this example. Set your WAF policy to **Prevention** mode for configured actions to take effect; **Detection** mode only logs matches.

## Gotchas and limits

This is a preview feature for Front Door Premium. Blocking AI search crawlers can reduce your content's visibility in AI-powered search and answers. Blocking interactive agents also stops them retrieving pages for people who ask an assistant about your site.

Take care with rule `800104`, which matches miscellaneous AI bots and can also match verified bots. If you block or challenge `800104`, set any verified categories you want to permit to **Allow**. **Log** doesn't stop rule evaluation, so a verified request can continue to `800104` and be blocked or challenged there.

The AI bot ruleset runs after the Bot Manager ruleset. An earlier managed rule with an **Allow** or **Block** action can end evaluation before the AI bot ruleset is reached.

## Quick takeaway

The ruleset gives you a way to make separate choices for AI training, search, interactive agents, and unverified bots at the Front Door edge. Begin by logging traffic, check how the categories match your visitors, and only then enforce the policy you want.

## Links

- Official announcement: [Public Preview: AI bot ruleset for Azure Front Door Premium WAF](https://azure.microsoft.com/updates?id=581604)
- Learn: [AI bot ruleset for Front Door WAF](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/ai-bot-ruleset)
- Learn: [Add managed rules to an Azure Front Door WAF policy with Azure CLI](https://learn.microsoft.com/en-us/cli/azure/network/front-door/waf-policy/managed-rules)
- Learn: [Override managed rules in an Azure Front Door WAF policy with Azure CLI](https://learn.microsoft.com/en-us/cli/azure/network/front-door/waf-policy/managed-rules/override)
