---
title: "Quad9 is leaving France, and the hard bit is that both sides have a point"
authors: simonpainter
tags:
  - dns
  - opinion
  - security
date: 2026-10-26
---

On 24 November, 9.9.9.9 stops answering France. A Paris court told Quad9 to block 58 domains streaming pirated women's tennis, Quad9 said no, the court fined it €1,000 a day, and Quad9 has decided to pull out of an entire G7 country rather than touch the list. The internet is cross about it, mostly on Quad9's behalf.

I'm cross too, but with everyone. The court is applying a law that was aimed at the wrong layer of the stack. beIN has spent a fortune on lawyers to achieve nothing. And Quad9's blog post, which I'd like to admire, contradicts itself in at least three places. Nobody in this story is being straight, so let's go through them one at a time.

<!-- truncate -->

## The court applied the law and missed the point

The facts are short. In May, beIN Sports, which holds the French rights to the WTA tour, got an order against Google, DNS4EU and Quad9 to block six pirate streaming domains for French users. Arcom bumped the list to 58. The order runs to 14 November, the last match of the season. Google and DNS4EU complied. Quad9 blocked nothing and told the judge so. beIN came back asking for €10,000 per domain per day, the court said €1,000 a day in total, and here we are.

The judge's reasoning, as reported by Clubic, is that Quad9 had an *obligation de moyens*: a duty to try, not a duty to succeed. Quad9 tried nothing, so it's liable. The judge also noticed that a resolver which filters millions of malware domains worldwide is on thin ice claiming it can't filter 58 more. Legally, that's hard to argue with.

Technically, it's nonsense. A recursive resolver is a phone book. It tells you the number; it doesn't make the call and it doesn't own the phone. Blocking a name at one public resolver among thousands is a one-line router change away from irrelevance, and the users who care about pirate tennis are precisely the ones who'll make that change. The stream stays up. The hosting provider, the CDN and the payment processor, the people who could actually take it down, aren't in the courtroom.

The court didn't invent any of this. French law since the Canal+ ruling in 2024 says resolvers are intermediaries that can be ordered to help, and that ruling is what drove OpenDNS out of France. So the honest complaint isn't "the judge is an idiot". It's "the legislature wrote a law that treats every box in the path as equally responsible for what flows through it", and judges will keep applying it until someone changes it.

## Quad9 is right on the principle and all over the place on the detail

I agree with Quad9 on the big thing. Letting a private broadcaster order a lookup service to lie to its users is a terrible precedent, and the people who'll use it next won't be rights-holders. Once a country has built the machinery for fast, lightly reviewed DNS blocking, the machinery gets used. Italy's Piracy Shield has already taken out Google Drive and Cloudflare addresses by accident. Arcom is building a copy of it for January 2027. Quad9 is right to be frightened of that.

But the blog post asks me to swallow three things that don't fit together.

**"We never alter DNS responses."** Quad9's entire product is altering DNS responses. 9.9.9.9 returns NXDOMAIN for millions of names it has decided are malicious, based on threat feeds from third parties it doesn't control. It does this globally, for everyone, without a court order. The distinction Quad9 actually means is "we only lie to you for your own good, not for beIN's". I happen to agree with that distinction. But it's a policy choice, not a technical property of the service, and the judge was entitled to point that out.

**"Compliance is technically unfeasible."** Google did it. DNS4EU, the EU's own resolver, did it. Whatever imprecise geoIP method they used, they accepted the imprecision and got on with it. Quad9 could have done the same, logged the limitations and reported them to Arcom. That's what an obligation of means looks like. It chose not to, which is a legitimate stand, but "unfeasible" is the wrong word for "we won't".

**"We can't tell who's in France."** Quad9 says it can't identify French users reliably enough to block 58 domains for them. It then says it will cut off all French users on 24 November. Those two statements run on the same geoIP data. Either the data is good enough to scope a national withdrawal, in which case it was good enough to attempt the block, or it isn't, and plenty of French users will carry on getting answers after the deadline. The real difference is that nobody is going to sue Quad9 for over-blocking France. That's a sensible calculation. It isn't a technical impossibility.

There's also the Sony excuse, which gets wheeled out as proof that geo-blocking gets you fined anyway. It got Quad9 fined by a German court applying a German standard four years ago, in a case Quad9 went on to win. It's a reason to be nervous. It isn't a reason to do nothing and then claim you had no options.

And the people paying for the stand aren't Quad9. The post proudly lists EDF, SNCF, France Travail, the Marseille hospitals, DINUM and dozens of local councils as French networks querying 9.9.9.9. None of them were in court. On 24 November their phishing protection goes dark and someone in each of them gets to find out why. Quad9 presents that list as evidence of how much France needs it. It's also a list of who it's decided to hurt to make a point.

## beIN and Arcom are winning every case and losing the plot

beIN's position is simple: it paid for the WTA rights, people are stealing the feed, and the law lets it go after intermediaries. Fine. But look at what it's actually achieved. It asked for €580,000 a day and got €1,000. It wanted 58 domains blocked and got zero of them blocked, at the one resolver that mattered to the case. The streams were up for the whole season. And its prize for all that legal spend is that French users who never watched a tennis match in their lives lose a free security service, while the users who do watch pirate tennis have changed one router setting and moved on. If the aim was to protect the rights, it failed. If the aim was to make an example of a small Swiss charity, well, mission accomplished, and I'm not sure that's something to boast about.

Arcom has numbers, and I'll give it that. Illegal live-streaming viewing in France is down about 70% since 2021, by its own count, with over 20,000 domains blocked. That's a real effect, and it's an effect on ordinary people who never change their DNS. But read the next line in the same report: illegal IPTV went from 5% to 7% of households over the same period. The piracy moved to a protocol that doesn't care about DNS at all. Arcom's response is to build an automated, real-time IP blocking system, which is a bigger version of the thing that's already failing to keep up. Each escalation catches fewer pirates and more bystanders. Italy and Spain have already shown where that ends.

The bit that should worry French policymakers is the net result. They have just persuaded a privacy-respecting, GDPR-compliant, free, independent resolver to leave. Mullvad is closing its public DNS on 2 November and told its users to move to Quad9, which is now comedy. The resolvers left standing in France are American, or EU-run and already filtering on request. If you set out to design a policy that concentrated French DNS traffic onto a handful of large, compliant operators, you'd struggle to do better than this. Digital sovereignty was supposed to mean the opposite.

## The exit happens after the order has expired

Now the calendar, because nobody seems to have looked at it. The blocking order runs out on 14 November. Quad9 leaves France on 24 November. By the time 9.9.9.9 goes dark, there is nothing left to block. Quad9 will have paid the full €24,000, blocked none of the 58 names, and withdrawn ten days after the order stopped meaning anything.

So the departure can't be about this order. Quad9 says as much if you read past the headline: it's the 20 other pending cases and the precedent, not the €24,000. But that's a very different story from "this ruling forces an untenable position upon us", which is the line the post leads with.

What it looks like to me is leverage. Announce you're leaving, publish a list of ministries and hospitals that depend on you, tell every French user to write to Arcom and their deputy, and give it 30 days to land. The audience is the appeal court and the National Assembly, not beIN. A month of headlines about EDF losing its phishing filter is worth more to Quad9 than compliance would ever have cost. I don't blame it for playing that hand. I'd like it to say that's what it's doing.

It's also reversible, and nothing in the announcement says otherwise. If the appeal goes Quad9's way, or Arcom offers a framework it can live with, France gets switched back on and there's no contract to unwind. Which raises the question beIN's lawyers will ask in the next case: if you waited the order out, complied with nothing and then left for a period that might turn out to be short, in what sense was any of that good faith? I don't think Quad9 is running a cynical wait-and-reverse play, because the pending cases give the French courts every chance to punish it for one. But the timing kills "we had no choice". If this order had forced the exit, the exit would have happened before the order expired.

## If you run a network, go and find your 9.9.9.9s

Anything in France pointing at 9.9.9.9, 149.112.112.112, 2620:fe::fe, 2620:fe::9 or Quad9's DoH and DoT endpoints stops working on 24 November. Quad9 hasn't said how it'll enforce that, so assume geoIP at the edge and SERVFAIL or timeouts rather than a polite redirect.

It hides in the usual places. Router and firewall forwarders set once and forgotten. Guest Wi-Fi and IoT VLANs where someone wanted filtering without running a resolver. Linux hosts with a hard-coded `resolved.conf`. Browser profiles where a user picked Quad9 from the DoH dropdown. Terraform modules that set DNS servers on cloud VNets. And the one that bites: a secondary entry nobody ever tested because the primary always answered.

The fix is the one I'd give for any upstream dependency. Run your own recursive resolver, forward to whoever you like, and make the forwarder a one-line change. If you were leaning on Quad9 for its threat feed, that's the capability to replace, not the address. DNS4EU and Cloudflare's 1.1.1.2 both filter and both apply French blocking orders. If that bothers you, the honest answer is that there's no longer a free, independent, filtered resolver you can point French users at, and that's the actual outcome of this case.

The bigger lesson is that public resolvers are no longer a neutral utility. They're a regulated service and the regulation depends on where your traffic egresses. France is the loud example; Italy and Spain got there first. If your DNS design assumes 9.9.9.9 or 1.1.1.1 will always answer the same way everywhere, it's time to stop assuming that.

So here's my question. If a court told you to block 58 names for one country, and you knew your geoIP was about 95% accurate, would you implement it and document the gap, or refuse and walk away? Quad9 chose the second and dressed it up as the only option. I'd have chosen the first and I'd have been honest that it was a choice. Tell me why I'm wrong.