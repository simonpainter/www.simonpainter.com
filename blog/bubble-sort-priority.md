---

title: "Priority calls with bubble sort"
authors: simonpainter
tags:
  - business
  - opinion
date: 2026-01-13

---

Every engineer, no matter what the discipline, has had to deal with the endless pipeline of requests from stakeholders, customers, or colleagues. As we're often quite a long way to the right of the timeline and very close to the deadline, these requests are almost always urgent and important and often come accompanied with escalations that sound like a roll call of the leadership team.
<!--truncate-->
> OK, let's just pause for urgent and important. What's the difference and how do we deal with them? The [Eisenhower Matrix](https://en.wikipedia.org/wiki/Time_management#Eisenhower_method) is a great way to visualise this - some things are urgent which means they need to be dealt with quickly and some things are important, which means there is a high cost of not doing them. The tricky part is when something is urgent but not important, or important but not urgent. In an ideal world, we would only ever deal with things that are both urgent and important, but in reality, we have to make trade-offs.

## The problem with priority

So if we have a single source of requests, perhaps a ticketing system, backlog, or a PMO project list, we deal with a single source of priority. Often we might have multiple sources of requests, each with their own priority, and this can lead to situations where we have more priority one requests than we have people to handle them. Quite often the delicate solution is to work out if priority one for one stakeholder is actually highest priority for the business, or if it can be deferred in favour of something else with a higher overall priority.

The idea of creating ordered lists of priority is not new, and I remember the shift from classifying things as high, medium, or low priority, via numeric priority (1-5, 1-10 etc which often had P0 inserted above P1 when everything else was inevitably classified as P1) to an ordered list which captures everything into a single list. But how do you decide what goes where in that ordered list? If you need to insert something into the list, where do you put it?

## Enter bubble sort

The solution, either consciously or unconsciously, is often bubble sort. [Bubble sort](https://en.wikipedia.org/wiki/Bubble_sort) is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The question is only ever 'is this item more or less important than that item?' and the answer is used to swap them or not. Over time, the most important items bubble to the top of the list. I have occasionally seen this in a formal methodology, but more often seen it as an informal process where stakeholders argue the relative importance of the current top items in the list but it scales very well because each key stakeholder who is sponsoring a request can challenge the position of their request against the one above it, and if they win, it gets swapped up one position. They also need to fend off the challenges from below, but it trends towards a stable state where only the new requests are actively bubbling to their correct position.

## Why this works

Bubble sort gets a bad reputation in computer science for being inefficient with large datasets. But when you're dealing with human prioritisation, it's a really good fit. Each comparison is a conversation, a negotiation, a chance to understand the real value of the work. You're not just sorting tickets - you're building consensus.

The beauty of this approach is that it removes the need for a central authority to dictate priority. Nobody has to play the villain and tell a stakeholder their urgent request isn't as important as they think. Instead, the sorting happens organically through pairwise comparisons. It's democratic and dynamic. As new requests come in, they can be slotted into the list and will find their rightful place through the same process of comparison.

Next time you're drowning in a sea of P1 tickets, remember that the problem isn't too many priorities - it's not enough comparisons. Start asking the simple question: "Is this more important than that?" Do it enough times and your priorities will sort themselves out.
