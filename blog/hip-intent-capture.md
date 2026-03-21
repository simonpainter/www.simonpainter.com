---

title: "Reducing HIP: This Meeting Could Have Been Code"
authors: simonpainter
tags:
  - personal
  - networks
  - automation
  - opinion
  - security
  - business
date: 2026-03-21

---


We've all heard it: "This meeting could have been an email." It's the refrain of busy people everywhere, a shorthand complaint about time wasted in unnecessary synchronous discussion.

But, if you are really trying to optimise your processes to ensure that there is minimal friction, there's a better version of that complaint. And it points to something more important than just saving calendar space.

***"This meeting could have been code."***
<!-- truncate -->
## The Problem

When the same governance decision, approval workflow, or compliance check happens repeatedly, with the same stakeholders, the same questions, the same objections, you're not maintaining quality standards. You're running humans as a slow, error-prone substitute for code. And it's costing you the people who could actually innovate.

I call this **HIP**: Humans In Process. And it's everywhere.

HIP isn't vague. You can measure it. Count the people involved in a change request. Count the decision loops. Track the elapsed time from request to deployment. Measure the hours consumed in meetings, clarifications, sign-offs, and approvals. That's your HIP baseline. Every improvement you make should drive that number down; if it doesn't, you're not actually improving.

Your best network people are spending their days in approval meetings, clarifying vague requirements, waiting for compliance sign-offs, and explaining the same rule to new business stakeholders. Your compliance team sits in endless forums trying to prevent bad decisions instead of designing guard rails that make bad decisions impossible. Your operations and service management team processes repetitive change requests that follow the same pattern every time.

This isn't a staffing problem. This is a process friction problem. And the irony is that we solve it in infrastructure all the time; we call it automation, policy-as-code, infrastructure-as-code, documentation-as-code even. But we often focus on the *doing* and leave the *governance* and *decision-making* parts stubbornly human.

The good news: you can fix this. Not by cutting quality, but by removing the friction that forces capable people to pretend to be decision-making machines. Code is better at that job.

## A Real Example: The Firewall Rule That Took 30 Days

I am slightly embarassed to say that this is a real example, it's a really bad example. Let me walk you through what high-HIP looks like: a business user who needs a firewall rule to enable a data flow. It should be really simple right?

### The Old Way

**Day 1.** A business stakeholder sends an email:
"Hi, we need to set up a data feed from our order system to our warehouse management platform. Can you open up a firewall rule?"

That's it. Vague, underspecified, but they don't know what else to say.

**Day 3.** Your network team responds with the obvious follow-ups:
"Need more details. Source system? Destination IP and port? What protocol? Is the data sensitive? Who's the owner? Is this temporary or permanent?"

**Days 5–10.** Email tennis, meeting overload. The business user answers some questions; doesn't understand others. "Data sensitivity? Um, it's customer order data." Your team: "Is that PII?" Them: "What's PII? I guess? Some of it has names and emails."

**Day 15.** Requirements are finally coherent enough to draft the rule. Your network team writes it and flags it for compliance review because someone mentioned customer names.

**Day 20.** Compliance comes back with a mandatory requirement: "Any personally identifiable data crossing the internet must be encrypted."

**Day 22.** Your team goes back to the business stakeholder: "The flow needs to support encryption for this to work. It's a non standard port so we can't tell if it's encrypted or not. Can you let us know?"

Business user disappears for a week, then: "Yes, it's TLS."

**Day 30.** The rule finally deploys. The audit trail is a tangled mess of emails, ticket comments, version history, justified escalations, and tribal knowledge about *why* this rule matters. If you're lucky it has also been documented somewhere but as soon as you add a stage gate to enforce that you're adding more HIP into an already bloated process.

**Cost:** 30 days, five people involved (business stakeholder, network engineer, compliance, possibly CAB, application developers), three decision loops. Human time consumed: easily 20-30 hours across the team spread across a month. Governance muddled. Risk of future misconfiguration high, because the reasoning behind the rule isn't codified anywhere.

**HIP score:** greater than 5

This is HIP in action. It doesn't feel like it at the time; it feels like thoroughness, like proper governance. But it's the accumulation of these cycles that bogs down infrastructure teams and delays business value.

### A better way: Intent, Validated

Now imagine the same scenario with a structured intake process. Not a form that business users ignore, don't understand, or avoid, but a guided conversation that captures intent clearly, validates it against policy automatically, and surfaces constraints *before* you finish the interaction.

**Day 1.** The business stakeholder accesses an intake interface (a web form, a conversational prompt, or an AI-assisted chatbot, more on this later):

> **System:** "Tell me about the data flow you need. What's the source system?"
>
> **User:** "Our order system connecting to vendor analytics."
>
> **System:** "What data will be transferred?"
>
> **User:** "Order records. Amounts, dates, customer names, email addresses."
>
> **System:** "Does this include names, email addresses, phone numbers, or home addresses?"
>
> **User:** "Yes; customer names and emails."
>
> **System:** ✅ **PII DETECTED. Policy constraint applied: All personally identifiable data in transit must be encrypted (TLS 1.2+). Mutual authentication strongly recommended.**
>
> **System:** "Your data is flagged as PII. That means encryption is non-negotiable. Just confirming: can the vendor support TLS?"
>
> **User:** "Yes, they do."
>
> **System:** *(auto-generates a complete requirement statement)*
>

Your network team receives a complete, validated intake. No guesswork. No compliance surprises. It has been reviewed against your pre-approved firewall rule templates, the config has been generated, and it gets pushed to the firewall.

The rule is live.

**Cost:** One HIP. That's it. The person who requested it.

**HIP score:** 1

## What Actually Changed

Three things, working together:

**1. Intent capture with intelligence.** Instead of "we need a firewall rule" (vague), you get "we need to move PII from our order system to a vendor analytics platform via TLS" (clear), along with the validated technical information that was needed to implement the rule. Guided questions and AI assistance, even simple conditional branching, replace vague tickets and follow up meetings. The business user answers once, thoroughly, and the system asks the right follow-ups.

**2. Policy-as-code embedded in the process.** The rule "PII data must be encrypted" isn't a memo filed somewhere or a compliance exception you might forget next time. It's *enforced* in the intake itself. It's not a question that has to be referred to the risk and compliance team for the hundredth time. When a user confirms "yes, this is PII," the system automatically flags encryption as mandatory, links to the policy, and checks the rule template for the required settings. The policy is visible, executable, and impossible to accidentally bypass.

**3. Pre-approved rule templates.** Common patterns, vendor integrations, cross-datacenter flows, cloud egress, third-party APIs, have pre-blessed firewall rule templates that encode best practices and policy constraints. Your network team doesn't design rules; they validate that the intake matches a template and deploy it. The architecture happened once. The instance is just instantiation.

## Measuring Success: The HIP Journey

That 30-day example versus the 3-day one isn't hypothetical. It's the difference between steps on a maturity curve, and you can measure your progress on each step with HIP. The first version could be masked, with escalations and heroics, to bring the total time down; the HIP score never changes. It's a better indicator of wasted effort than the time taken from end to end. It's also a better indicator of the *potential* for improvement. You can reduce time by throwing more people at it, but you can also reduce time by throwing fewer people at it. The latter is the real win.

**Starting point:** All changes go through CAB. Everything requires a stage gate forum, approval chain, and governance sign-off. Five people, 20-30 days, 20-30 hours consumed. HIP is very high.

**Step 1: Move routine changes to standard changes.** You identify common patterns (firewall rules, access requests, DNS changes) that are low-risk if they follow a template. You document the template, get one approval, then let teams deploy standard changes directly without CAB.

Measure the HIP: That same firewall rule now takes 10 days, but more importantly three people. You've cut HIP in half. That's progress. That's proof the approach works.

**Step 2: Add automation.** You build a script that checks the change against policy, validates it's a known pattern, generates the configuration, and deploys it if all checks pass. A human still reviews the request, but the compliance checking is automated.

Measure the HIP: Two people, HIP driven down further; the side effect is it not takes a few days not a few weeks.

**Step 3: Pre-approve firewall rule policies.** You codify the rules that govern what firewall rules are allowed. "PII in transit must be encrypted." "Cross-zone traffic needs mutual auth." You embed these rules in the automation. If a request matches policy, it approves itself.

Measure the HIP: One person requesting and one person doing a quick review for the edge cases not covered in the policy, 1-2 hours. CAB is out of the loop entirely for low-risk changes.

**Step 4: Capture intent and validate at source.** You add the structured intake process. Business users answer guided questions. The system validates against policy, flags exceptions, and commits to a decision right there.

Measure the HIP: One: the business user got their answer the same day they asked.

Each step reduces HIP. You're not just faster; you're measurably less dependent on humans in the approval and decision loop. And that's when your good people finally have time to innovate.

## The HIP Reduction

In the old way, every request pulled in a crowd. The business stakeholder waited around, context-switching between other work while the ticket bounced between queues. The network engineer handled the initial assessment, sent clarification questions, drafted the rule, then reworked it when requirements changed. The compliance team reviewed the request, raised objections, and eventually signed off. The CAB team added another gating step and review cycle. And somewhere along the way, application owners got dragged in mid-process to confirm capabilities nobody had thought to ask about upfront.

In the new way, the business stakeholder has one structured conversation that captures everything needed. The network engineer does a quick review of a policy-compliant intake, if necessary, and deploys it. There's no surprise compliance gate because policy was checked at intake. There's no CAB friction because the rule matches a pre-approved template and the risk assessment is already baked in. Total: one person. Two people tops. A couple of hours, one decision loop. That's your target HIP.

The reduction isn't a percentage you guess at. It's measurable. You track it. You build on it. Every improvement—every policy you codify, every template you pre-approve, every decision you move from human approval to policy enforcement—should drive HIP down further.

But here's the thing: the people aren't gone. They're redeployed. Your network engineer is no longer stuck in clarification loops and rework cycles. They're reviewing a complete requirement and making an architectural decision. Your compliance team isn't in endless sign-off meetings; they designed the policies once, in code, and now they scale to 100 requests with minimal overhead because the policy is enforced automatically.

That's what HIP reduction actually means: taking the humans out of the process loop and putting them back in the decision, design, and innovation loop.

## The Pattern: Capture, Validate, Automate

The firewall rule example isn't unique to networking. The same principle applies to any task that can be automated:

**Capture intent right.** Get clear, complete information upfront through guided questions and structured intake, not vague tickets or emails.

**Apply scrutiny as policy-based decision-making.** Codify the rules that govern approval. Most decisions don't need a human; they need policy. "Does this match the template? Does it meet the constraint? Then it's approved." Human review only when the request falls outside policy (and that should be rare, and flagged).

**Push to automation.** Once a decision is made, let systems execute it. No handoff to a human to "process" the change. No "approval meeting" followed by "now someone actually does the work." There are [plenty of errors](vlan-add.md) that a human can introduce to the implementation. Let code do the work it's good at, and let people do the work they're good at.

This pattern scales: on-call escalations, capacity requests, vendor access provisioning, infrastructure changes, even architectural reviews. The specifics vary, but the goal of HIP reduction is the same.

## The Trap: Forms That Change Nothing

Here's what doesn't work, and it's worth naming explicitly: the "mechanical turk."

>A quick note: the term comes from an 18th-century chess-playing "automaton" that astonished Europe, until people realised a skilled chess player was hidden inside, actually operating it. The machine looked autonomous but was just a human in disguise. Amazon later named their crowdsourcing platform after it, where humans do small tasks behind the scenes. The point: something that appears automated but is actually just humans doing the work.

Your organisation adds a fancy service request form. It's well-designed, with dropdown menus and conditional fields. Looks modern. Feels like progress.

But underneath? It still routes to a human. That human reads the form, asks clarifying questions, makes a decision, sends it to another human, who approves it, who sends it to a third human, who actually does the work.

You've added digital friction to the same analogue process. The form is prettier, the ticketing system is more structured, but the *humans in the approval and validation loop* haven't changed. You might have even added to it.

**That's not HIP reduction. That's HIP with better UX.**

The difference is fundamental: a **bad form** captures information and sends it somewhere for later decision-making. The user gets a ticket number and then waits. Days later, someone reviews it, finds it incomplete or misaligned with policy, rejects it, and asks clarifying questions. More waiting. More rework.

A **good form** captures, validates, questions, and decides right there, close to the point of request. The user fills it out, the system validates against policy in real-time, asks follow-ups if needed, and commits to a decision and timeline before they leave. Instant gratification. They know what they're getting and when. No surprises. No risk of later delays because requirements were misunderstood.

I have spent a lot of time in retail so the obvious analogy for me is the point of sale where you swipe your card and then have to wait for a while before the transaction is approved. The system checks for fraud, validates the card, checks the balance, and then gives you a yes or no right there. You don't have to wait for a human to review your purchase after the fact. That's how good intent capture and validation works in infrastructure too.

True HIP reduction means removing humans from the validation and approval workflows, not just adding forms on top of them. The form is just the capture layer. The real work is automating the decision-making and execution.

## Why This Matters

Your infrastructure teams are capable. Your compliance teams understand risk. Your operations people know how to execute. But they're all stuck in loops designed for a time when you had no other way to enforce standards except by having smart people making good decisions.

You have tools now. Code, policy engines, infrastructure automation. Use them to take the humans out of the process, so they can do something more useful.

And measure it. Track HIP. Every change you make, every policy you codify, every decision gate you remove, every moment of intent validation you move closer to the source. Everything should lower your HIP. If it doesn't, you're optimising the wrong thing. You're adding stuff, not removing friction.

Because here's the truth: your people are good. They're bogged down in friction, not incompetence. Remove the friction, measure the results in HIP reduction, and what they can accomplish changes completely.
