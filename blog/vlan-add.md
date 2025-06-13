---

title: The vlan add disaster
authors: simonpainter
tags:
  - networks
  - opinion

date: 2025-06-12

---

A couple of days ago I saw a meme targetted to network engineers and it mentioned *'the vlan add disaster'*. I immediately understood what it meant. It feels like it's now such a well know thing, enough to warrant a place in a meme, that it is part of our own zeitgeist for the last decade in networks.
<!-- truncate -->

![Adding a vlan to a trunk](img/vlan-add.png)

> For the uninitiated folks, there is a command to restrict a vlan tagged trunk
> to only carry specific vlans. The command to restrict it to, say vlans 5, 6, 7 and 9 is
> `switchport trunk allowed vlan 5-7,9`. As you can see you can use ranges or comma separated
> values.
>
> If you want to add vlan 8 to the list above you use the command
> `switchport trunk allowed vlan add 8`. What you definitely don't do is forget the add
> keyword and just type `switchport trunk allowed vlan 8` because that replaces the
> existing list with whatever you included in the command. You could alternatively type
> `switchport trunk allowed vlan 5-9` but who does?

This is so ingrained into network engineer culture that I don't know a single engineer who doesn't have a war story about either their own mistake or where someone else in their organisation bodged it. I remember working at a bank which was in the middle of very long ongoing datacentre migration and they were using OTV to stretch L2 from one site to another while VMs and physical tin was moved over. A large number of subnets were stretched with the gateway migrated only when roughly 50% of servers had been moved. There were nightly changes to add vlans to OTV and the corresponding trunks and one of them had fallen foul of the vlan add disaster. By the time I joined, every change manager was obsessed with asking if someone had checked if the add keyword was included in the change plan.

My own story was actually a near miss, not through my own smug cleverness but because a fantastically dilligent ops guy was assigned to peer review my change. He came over with his laptop, pointed to the line in my change script and just said 'nearly, mate'.

While I was thinking about this I nearly sat down to write about the absurdity of the UI mistake that Cisco made with that command. As I thought through it though I realised that there probably wasn't a better way of implimenting. The default state is to declaratively specify what you want, if you want to specify a delta either with the `add` or `remove` keyword then you do just that. Having the default action as add would mean that `remove` would need to be supplimented with some other keyword such as `replace`.

I found myself thinking more about the value of a good peer review and how it saved me from an outage, a long night and almost certaintly some real embarassment. The simple act of running a fresh pair of eyes on a change plan can be all it takes to spot an error that can be bad news. One recent organisation I worked with had a succession of avoidable outages and implimented a 4 eyes change process where each change was done in tandem with two engineers on a shared screen on a recorded teams session; a buddy system where the change implimenter asked for approval from their buddy before hitting enter on each command. While it was onerous, resulted in massive costs and delays to networking projects it was extrememly effective. I can't imagine anyone outside of the most critical of infrastructure would have appetite for such an approach long term.

Strangely the velocity of change is often cited as the reason for not having extensive peer reviews of change. I worked in a retailer that insisted on slowing down the change process to give more time for review. The newly appointed senior director of service mandated that all changes had to be raised a full month before the implimentation date. The timestamp for the creation of the change would be checked by the change management team and anything raised less than a month before the change date would not be allowed. Two enterprising project managers from the north west immediately raised dozens of blank changes and left them in a draft state, selling them individually, for a small consideration, to their less prepared colleagues a little over a month later when the golden quarter change freeze approached. It turned out a more effective way to give time for review was to lengthen the minimum time between the submission of a fully completed change and the change date.

But velocity of change is exactly when four eyes peer review is important, and it doesn't have to be an onerous process that delays the change. I have spent some time with an organisation that was going through a crisis: most of the change processes were unusuable because the tooling for that process was broken. One of the first things I did was ensure that all network change had a second set of eyes on it, initially my own eyes but later this was scaled out to cover 24/7 crisis operations. Having at least one senior engineer on shift all the time just to do change reviews may have seemed indulgent but it no doubt averted a lot of mistakes which tired, stressed and overworked engineers would have been forgiven for making. As the crisis abated the culture of review has continued in that organisation to give a new level of transparency and accountability that I am very proud of.

The vlan add disaster has become more than just a cautionary tale about a poorly designed command - it's become a cultural touchstone that reminds us why we need each other. Every network engineer who's heard the story, whether they've lived it or not, understands the fragility of our infrastructure.

What started as a meme about a Cisco command syntax reveals something more about our profession. We work in an environment where a single mistyped word can bring down critical services, where the pressure to move fast can cloud our judgment, and where the complexity of our systems often exceeds what any one person can safely navigate alone. The vlan add disaster isn't really about VLANs at all - it's about the necessity of humility, the value of collaboration, and the wisdom of building safety nets into our processes.

The next time you're about to hit enter on a command, remember that dilligent ops guy who saved me from my own miss. Remember that good peer review isn't about slowing things down or questioning competence - it's about acknowledging that we're all human, and that our best defense against disaster is often just another pair of eyes and a simple question: "Are you sure about that, mate?".
