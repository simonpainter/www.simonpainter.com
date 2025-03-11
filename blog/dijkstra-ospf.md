---

title: Dijkstra in OSPF
authors: simonpainter
tags:
  - networks
  - programming
  - ospf
  - algorithms
  - routing-protocols
  - educational
date: 2024-12-23

---

## More than just an interview question

Over my years in networking I've sat on both sides of countless technical interviews. There's a familiar dance that occurs when discussing OSPF: the candidate confidently states "OSPF uses Dijkstra's algorithm for route calculation," and the interviewer will nod approvingly. Yet recently, I had a moment of clarity: in hundreds of these exchanges, I've never once asked a candidate to explain what that actually means, nor have I been asked to explain it myself.
This perfunctory mention of Dijkstra has become almost ceremonial in our industry, a shibboleth that we repeat without truly engaging with its significance. Yet understanding this algorithm isn't just academic—it fundamentally shapes how OSPF operates, influences our network designs, and explains why certain design patterns have become best practices.
When a link fails in your network and OSPF begins recalculating routes, there's significant computational overhead that many engineers never consider. This processing cost isn't just theoretical—it's the hidden force behind many of our design decisions, from area sizing to adjacency limits. Today, we'll bridge the gap between theory and practice, exploring how this fundamental algorithm shapes the way we deploy and scale OSPF networks, and why it matters for your day-to-day operations.
<!-- truncate -->
## How Dijkstra's Algorithm Actually Works in OSPF

When discussing path-finding algorithms in computing, several approaches stand out: [Breadth-First Search (BFS)](algorithms.md#breadth-first-search-bfs) methodically exploring layer by layer, [Depth-First Search (DFS)](algorithms.md#depth-first-search-dfs) diving deep into each possible path, [Greedy Best-First Search (GBFS)](algorithms.md#greedy-best-first-search-gbfs) always choosing what looks most promising, and [A*](algorithms.md#a-a-star-search) balancing estimated and known costs.

[Dijkstra's algorithm](algorithms.md#dijkstras-algorithm), which OSPF employs, takes a more thorough approach. Unlike Greedy Best-First Search (GBFS), which makes decisions based solely on heuristics (estimates of distance to the destination), or A* which balances both heuristics and actual distances, Dijkstra's algorithm focuses exclusively on actual distances travelled. This makes it perfect for routing protocols where we need guaranteed optimal paths based on real metrics rather than estimates.

Each OSPF router maintains a detailed map of network topology through Link State Advertisements (LSAs). When calculating routes, the router positions itself as the root of a theoretical tree and begins evaluating paths to every known destination in the network. It methodically tracks the actual cost of reaching each destination, storing these in a priority queue that ensures it always processes the most promising paths first.

Think of it like planning a journey where you need absolute certainty about the cheapest route. You can't make assumptions about which direction looks promising (as GBFS would) or balance known and estimated costs (like A*). Instead, you must systematically evaluate every path based solely on actual costs. This methodical approach guarantees finding the optimal path, but at the cost of significant computational overhead—a trade-off that directly influences how we design OSPF networks.

This fundamental characteristic: looking backwards at actual costs rather than forward at estimates, makes Dijkstra's algorithm particularly suitable for routing protocols where accuracy is paramount. However, it's also why OSPF requires more computational resources than protocols using simpler path-finding methods, a consideration that becomes increasingly important as networks scale.

## Why This Matters for Your Network: OSPF's Scaling Limitations

Understanding the computational complexity of Dijkstra's algorithm reveals why OSPF networks face inherent scaling challenges. Let's examine the mathematics behind these limitations—something rarely discussed in networking documentation yet crucial to network design. OSPF areas are often presented primarily as a tool for route summarisation and LSA flood control. Whilst these benefits are valuable, they're actually secondary outcomes of a design necessity driven by the computational overhead of Dijkstra's algorithm. Let's explore why.

In a single OSPF area, Dijkstra's algorithm has a computational complexity of O(V²), where V represents the number of vertices (routers) in the network. This means that when you double the number of routers in your area, you quadruple the computational work required for each route calculation. However, the real impact is even more significant because the number of edges (links) also influences the complexity.

Let's consider a practical example. In a network with 50 routers, each route calculation requires approximately 2,500 computational operations (50²). Double this to 100 routers, and you're looking at 10,000 operations (100²). Scale to 200 routers, and suddenly each calculation needs 40,000 operations. Now consider that these calculations occur not just once, but every time there's a network change—a link flapping, a cost change, or a new router joining the network.

This scaling challenge becomes even more pronounced when we consider convergence time. In a 50-router area, if each computational operation takes 1 microsecond, a complete route recalculation might take 2.5 milliseconds. Scale to 200 routers, and you're looking at 40 milliseconds—and this is for just one recalculation on one router. During network instability, when multiple routers are recalculating paths simultaneously and potentially triggering additional LSA floods, these overheads compound significantly.

The impact becomes particularly acute in modern data centre environments. Consider a pod with 200 leaf and spine devices all in a single OSPF area. During a maintenance window where multiple links are being shut down and brought up, each router would need to perform these extensive calculations repeatedly. Even with modern hardware, this creates a real risk of CPU exhaustion and delayed convergence.

This computational reality explains why the traditional guidance of limiting areas to 50-100 routers isn't just conservative network design—it's a mathematical necessity. When you divide a 200-router network into four areas of 50 routers each, you're not just reducing the routing table size; you're reducing each router's computational burden from 40,000 operations to 2,500 operations per calculation—a 16-fold improvement in processing efficiency.

This becomes particularly evident during network events. Consider a link failure scenario:

In a single-area design, all 200 routers must:

- Process the LSA announcing the failure
- Rerun Dijkstra's algorithm across the entire topology
- Update their routing tables accordingly
- Each router performs 40,000 operations
- Total computational cost: 8 million operations across the network

In a four-area design:

- Only routers within the affected area perform full Dijkstra calculations
- 50 routers perform 2,500 operations each
- Other areas simply process summary LSA updates
- Total computational cost: 125,000 operations within the affected area
- Minimal processing overhead in other areas

This 64-fold reduction in total computational overhead during network events explains why the traditional guidance of 50-100 routers per area exists. It's not an arbitrary limit—it's a practical threshold where the computational overhead of Dijkstra's algorithm remains manageable even during periods of network instability.

The benefits of route summarisation and controlled LSA flooding are valuable side effects of this design, but they're not the primary drivers. Even in modern networks with high-bandwidth links and efficient flooding mechanisms, the computational overhead of running Dijkstra's algorithm at scale remains a fundamental constraint. Understanding this helps explain why certain OSPF design patterns persist even as network hardware becomes more powerful—we're not just dealing with memory or bandwidth limitations, but with the mathematical reality of path calculation complexity.

## Why [BGP](/tags/bgp) Scales Where OSPF Struggles: A Tale of Two Approaches

The contrast between OSPF and [BGP](/tags/bgp)'s approach to routing offers a masterclass in the trade-offs between optimal path finding and scalability. Whilst OSPF employs Dijkstra's algorithm to mathematically prove it has found the best path to every destination, [BGP](/tags/bgp) takes a fundamentally different approach that prioritises scalability over mathematical optimality.

[BGP](/tags/bgp) makes no attempt to discover or calculate the best path to a destination. Instead, it follows a deterministic set of rules—the [BGP](/tags/bgp) path selection process—to choose among the paths it has learned through routing advertisements. This process is computationally simple: compare path attributes one by one until you find a differentiator. Is the local preference higher? Choose that path. Equal? Check the AS path length. Still equal? Move to the next tie-breaker.

This attribute-based decision making has linear computational complexity O(n), where n is the number of paths to evaluate. Compare this with OSPF's quadratic complexity O(V²), where V is the number of routers in the network. When a [BGP](/tags/bgp) router receives a path update, it simply needs to compare the new path's attributes against the currently selected path—it doesn't need to recalculate entire routing trees or evaluate every possible path combination.

Consider the Internet's routing table, which currently contains over 900,000 prefixes. If we tried to run Dijkstra's algorithm across a topology of this scale, the computational overhead would be astronomical. However, [BGP](/tags/bgp) handles this scale efficiently because each prefix is processed independently, using simple attribute comparisons rather than complex path calculations.

The trade-off becomes clear when we consider path optimality. [BGP](/tags/bgp) might not always choose the path with the lowest end-to-end metric—it simply selects the path that best matches its configured preferences. This is why you might see Internet traffic taking seemingly indirect paths, following business relationships and routing policies rather than geographic efficiency. But this sacrifice of absolute optimality enables [BGP](/tags/bgp) to scale to hundreds of thousands of routes across tens of thousands of autonomous systems.

This fundamental difference explains why [BGP](/tags/bgp) is the protocol of choice for large-scale networks, including the Internet itself, whilst OSPF is typically confined to smaller domains where path optimality is more important than massive scalability. It's not that [BGP](/tags/bgp) is "better" than OSPF—rather, each protocol makes different trade-offs to serve different needs. OSPF prioritises finding provably optimal paths within a bounded domain, whilst [BGP](/tags/bgp) prioritises scalability and policy enforcement across vast, administratively diverse networks.

## Practical Design Implications: When Dijkstra's Algorithm Drives Architecture

Understanding how Dijkstra's algorithm influences OSPF behaviour should fundamentally shape your network design decisions. Let's explore the key architectural considerations that stem directly from OSPF's use of this algorithm.

### Area Size and Structure

The computational overhead of Dijkstra's algorithm drives several critical design decisions around OSPF areas:

The traditional limit of 50-100 routers per area isn't arbitrary—it represents a practical threshold where the O(V²) computational complexity remains manageable. When planning areas, you need to consider not just current router counts but future growth. Adding "just a few more routers" can have a disproportionate impact on processing requirements.

Area 0's design becomes particularly crucial. As the backbone area carrying inter-area traffic, it needs to be especially stable. This explains why best practices suggest keeping the backbone area lean and controlled, often limited to just the core routers and area border routers (ABRs). Every additional router in Area 0 increases the computational burden across your entire backbone.

### Adjacency Management

The number of adjacencies per router directly impacts Dijkstra calculations in several ways:

In a full mesh design, each additional router exponentially increases the number of paths that must be evaluated. This is why we typically avoid full mesh designs in OSPF networks, instead opting for hub-and-spoke or partial mesh topologies that limit the number of adjacencies.

The best practice of using point-to-point links rather than multi-access segments where possible isn't just about reducing broadcast traffic—it's about controlling the number of paths that Dijkstra's algorithm must evaluate.

### Network Types and DR/BDR Selection

OSPF network types influence how Dijkstra's algorithm processes the topology:

The use of Designated Routers (DR) and Backup Designated Routers (BDR) on broadcast segments isn't just about reducing LSA flooding—it simplifies the topology that Dijkstra's algorithm must process by creating a hub-and-spoke logical topology even on broadcast networks.

Point-to-multipoint configurations, while useful for hub-and-spoke topologies over broadcast media, need careful consideration as they increase the number of paths Dijkstra must evaluate compared to point-to-point links.

### LSA Types and Summarisation

The way we handle LSAs directly impacts Dijkstra's computational load:

Route summarisation at area boundaries becomes crucial not just for reducing routing table size, but for limiting the scope of Dijkstra calculations. Each summary LSA represents a single computation, regardless of how many specific routes it encompasses.

The decision to create stub or totally stubby areas isn't just about reducing routing table size—it's about minimising the number of paths that must be evaluated in Dijkstra calculations.

### Convergence and Timer Tuning

Understanding Dijkstra's computational impact should influence how we approach convergence tuning:

SPF timers need to balance rapid convergence against CPU protection. The exponential nature of Dijkstra calculations means that back-to-back SPF runs can quickly overwhelm a router's CPU.

The SPF delay and throttle timers become increasingly important as network size grows. In larger areas, you might need to tune these more conservatively to prevent CPU exhaustion during network events.

### Modern Hardware Considerations

Even with modern routing hardware, these design considerations remain relevant:

While newer routers have significantly more processing power, the fundamental O(V²) complexity of Dijkstra's algorithm means that poor design decisions can still impact network stability and convergence times.

In virtual environments, where CPU resources might be shared or constrained, these considerations become even more critical.

## Looking Forward: OSPF's Evolving Role in Modern Networks

The networking landscape has transformed dramatically since OSPF's introduction. Where once we might have seen OSPF spanning global enterprise networks, modern architectures have reshaped its role. The rise of MPLS, SD-WAN, and cloud connectivity has shifted WAN routing decisively toward [BGP](/tags/bgp), whilst data centre networks have pushed the boundaries of what we traditionally considered dense network design.

### The Shrinking OSPF Domain

Modern enterprise networks increasingly segment into distinct domains. The WAN, once OSPF's domain, now typically runs [BGP](/tags/bgp), whether that's for MPLS services, SD-WAN overlay networks, or direct cloud connectivity. This architectural shift has effectively contained OSPF to campus and data centre environments—but these environments themselves have evolved significantly.

Today's data centre networks present unique challenges for OSPF deployment. Where a traditional campus network might have hundreds of devices spread across a building or campus, a modern data centre pod can easily contain that many devices in a single rack row. Leaf-spine architectures, with their dense interconnections and high port counts, create exactly the kind of computational complexity that Dijkstra's algorithm struggles with.

### The Future of OSPF

Despite these challenges, OSPF continues to evolve. The protocol has adapted to support modern requirements, with features like segment routing and traffic engineering extensions. However, its fundamental reliance on Dijkstra's algorithm means that certain scaling constraints will always remain, regardless of hardware improvements.

In campus networks, where topology stability and optimal path selection remain crucial, OSPF continues to excel. The controlled scale and relatively static nature of campus networks align well with OSPF's strengths. Additionally, the rise of network automation and intent-based networking systems has made it easier to manage OSPF's complexity, automatically enforcing best practices and preventing design decisions that might trigger computational scaling issues.

Looking ahead, we're likely to see OSPF continue to evolve, but within its mathematical constraints. The protocol's guarantee of optimal paths remains valuable in scenarios where network topology is well-defined and manageable. However, as networks continue to grow in scale and complexity, we'll likely see increasingly hybrid approaches—using OSPF where its strengths are valuable and complementing it with other protocols where its scaling limitations become problematic.

The key lesson for network architects isn't that OSPF is becoming less relevant, but rather that understanding its fundamental algorithmic constraints is crucial for deploying it effectively in modern networks. Whether you're designing a campus network or a data centre pod, the computational realities of Dijkstra's algorithm will continue to shape your design choices, even as hardware capabilities advance.
