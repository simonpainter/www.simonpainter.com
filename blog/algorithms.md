---

title: Summary of common search algorithms
authors: simonpainter
tags:
  - ai
  - python
  - programming
  - algorithms
date: 2024-12-23

---
I've put together a summary of some common search algorithms and how they work. This post covers key search algorithms used in computer science, explaining their approaches, strengths, weaknesses, and showing Python implementation examples.
<!--truncate-->

## Breadth-First Search (BFS)

Breadth-First Search explores a maze like ripples spreading out from a stone dropped in water - it checks all possible paths one step at a time before moving further. It uses a queue data structure, which means it processes paths in the order they were discovered (first-in, first-out).

Imagine a simple maze where you're trying to find the exit. BFS would first check all paths that are one step away from your starting position, then all paths two steps away, and so on. It keeps track of where it's been to avoid going in circles.

The key strength of BFS is that it guarantees finding the shortest possible path to the exit, making it excellent for scenarios where the shortest route is crucial. However, it requires significant memory as it needs to store all possible paths it discovers. 

In our maze example, BFS would find the shortest path to the exit, but it would explore many unnecessary areas if the exit happens to be far from the start.

```python
def bfs_maze(maze, start, end):
    # Queue to store paths we need to explore
    # Each queue entry stores current position and path taken
    queue = [(start, [start])]
    # Keep track of where we've been
    visited = {start}
    
    while queue:
        # Get the next path to explore from the front of the queue
        current, path = queue.pop(0)
        
        # Check if we've reached the end
        if current == end:
            return path
            
        # Look at all possible moves (up, down, left, right)
        for next_pos in get_valid_moves(current, maze):
            if next_pos not in visited:
                visited.add(next_pos)
                queue.append((next_pos, path + [next_pos]))
                
    return None  # No path found
```

## Depth-First Search (DFS)

Depth-First Search behaves like an explorer who always goes as far as possible down each path before backtracking. It uses a stack data structure, meaning it processes the most recently discovered path first (last-in, first-out).

Using our maze example, DFS would pick one direction and keep going until it either hits a dead end or finds the exit. If it reaches a dead end, it backtracks to the last junction and tries a different path.

DFS uses minimal memory compared to BFS as it only needs to remember the current path it's exploring. However, it doesn't guarantee finding the shortest path - it will find a path to the exit, but it might not be the most efficient one. 

In our maze, DFS might find a long, winding path to the exit even if there's a much shorter route available.

```python
def dfs_maze(maze, start, end):
    # Stack to store paths we need to explore
    # Each stack entry stores current position and path taken
    stack = [(start, [start])]
    # Keep track of where we've been
    visited = {start}
    
    while stack:
        # Get the next path to explore from the top of the stack
        current, path = stack.pop()  # Key difference from BFS - pop from end
        
        if current == end:
            return path
            
        # Look at all possible moves (up, down, left, right)
        for next_pos in get_valid_moves(current, maze):
            if next_pos not in visited:
                visited.add(next_pos)
                stack.append((next_pos, path + [next_pos]))
                
    return None  # No path found
```

## Greedy Best-First Search (GBFS)

Greedy Best-First Search is like having a compass that points towards your destination. It uses a heuristic (an educated guess) to decide which path looks most promising. In our maze example, if you could see the exit through the walls, GBFS would prefer paths that seem to lead straight towards it.

GBFS uses a priority queue, where paths that appear more promising (according to the heuristic) are explored first. The heuristic might be something simple like straight-line distance to the exit.

Unlike Dijkstra's algorithm, which methodically calculates the shortest path to every point it visits, GBFS makes quick decisions based solely on estimated distance to the goal. This makes GBFS typically faster than Dijkstra's algorithm, but at the cost of not guaranteeing the shortest path. 

In our maze, GBFS might get stuck following a path that looks promising but actually leads to a long detour around walls that aren't visible from the start.

```python
def gbfs_maze(maze, start, end):
    # Priority queue ordered by estimated distance to goal
    # Each entry stores: (estimated_distance, current_pos, path)
    priority_queue = [(estimate_distance(start, end), start, [start])]
    visited = {start}
    
    while priority_queue:
        # Get the path with the lowest estimated distance to goal
        _, current, path = heappop(priority_queue)
        
        if current == end:
            return path
            
        for next_pos in get_valid_moves(current, maze):
            if next_pos not in visited:
                visited.add(next_pos)
                # Key feature: priority based only on estimated distance to goal
                estimated_distance = estimate_distance(next_pos, end)
                heappush(priority_queue, 
                        (estimated_distance, next_pos, path + [next_pos]))
                
    return None  # No path found

def estimate_distance(pos, goal):
    # Simple Manhattan distance heuristic
    x1, y1 = pos
    x2, y2 = goal
    return abs(x1 - x2) + abs(y1 - y2)
```

## A* (A-Star) Search

A* combines the best aspects of Dijkstra's algorithm and GBFS. It uses both the actual distance travelled (like Dijkstra) and a heuristic estimate of the remaining distance (like GBFS) to make decisions. Think of it as having both a map showing how far you've come and a compass pointing to your destination.

Using our maze example, A* would consider both how far it has already travelled from the start and its estimate of how far it still needs to go to reach the exit. It uses a priority queue like Dijkstra's algorithm, but adds the heuristic component to guide its search more effectively.

While Dijkstra's algorithm methodically explores in all directions until it finds the goal, potentially visiting many unnecessary nodes, A* uses its heuristic to focus the search towards the goal while still guaranteeing the shortest path. In our maze, A* would find the shortest path while typically exploring fewer dead ends than Dijkstra's algorithm.

This makes A* particularly efficient when you have good information about your destination's location and can make accurate estimates of remaining distances. However, if your heuristic estimates are poor or unavailable, A* effectively becomes Dijkstra's algorithm, making Dijkstra's algorithm the better choice for scenarios where you can't reliably estimate distances to the goal.

```python
def astar_maze(maze, start, end):
    # Priority queue ordered by f_score (g_score + heuristic)
    # Each entry stores: (f_score, current_pos, path)
    priority_queue = [(estimate_distance(start, end), start, [start])]
    visited = {start}
    
    # Keep track of actual distance to reach each position
    g_scores = {start: 0}
    
    while priority_queue:
        _, current, path = heappop(priority_queue)
        
        if current == end:
            return path
            
        for next_pos in get_valid_moves(current, maze):
            # Calculate actual distance to reach next_pos
            tentative_g_score = g_scores[current] + 1
            
            if next_pos not in visited or tentative_g_score < g_scores[next_pos]:
                visited.add(next_pos)
                g_scores[next_pos] = tentative_g_score
                
                # f_score = actual distance + estimated remaining distance
                f_score = tentative_g_score + estimate_distance(next_pos, end)
                heappush(priority_queue, (f_score, next_pos, path + [next_pos]))
                
    return None  # No path found
```

## Dijkstra's Algorithm

Dijkstra's algorithm is like a cautious explorer who keeps track of the exact distance travelled to reach every point. It systematically expands outward from the starting point, always working on the path that has the shortest known distance so far.

In our maze example, Dijkstra's algorithm would maintain a record of the shortest path to every point it has discovered. It uses a priority queue, similar to A* and GBFS, but bases its decisions solely on the actual distance travelled rather than any estimates about the remaining distance.

The algorithm guarantees finding the shortest path not just to the exit, but to every point it visits along the way. This makes it particularly useful in networking scenarios where you might need to know the shortest path to multiple destinations. However, this thoroughness comes at a cost - it explores in all directions equally, regardless of where the goal is located.

Dijkstra's algorithm is ideal for situations where you either don't have reliable estimates of distances to the goal, or when you need to find shortest paths to multiple destinations. In our maze, it would find the shortest path to the exit while also finding the shortest paths to every junction it explores along the way.

The key difference between Dijkstra's algorithm and A* is that Dijkstra's algorithm doesn't use any heuristic information about the goal's location. This makes it more widely applicable but potentially slower than A* in scenarios where good heuristics are available. The difference from GBFS is that Dijkstra's algorithm guarantees finding the shortest path, while GBFS trades this guarantee for potentially faster initial solution finding.

```python
def dijkstra_maze(maze, start, end):
    # Priority queue ordered by distance from start
    # Each entry stores: (distance, current_pos, path)
    priority_queue = [(0, start, [start])]
    visited = {start}
    
    # Keep track of shortest distance to reach each position
    distances = {start: 0}
    
    while priority_queue:
        current_distance, current, path = heappop(priority_queue)
        
        if current == end:
            return path
            
        for next_pos in get_valid_moves(current, maze):
            # Calculate distance to reach next_pos
            new_distance = current_distance + 1
            
            if next_pos not in visited or new_distance < distances[next_pos]:
                visited.add(next_pos)
                distances[next_pos] = new_distance
                heappush(priority_queue, 
                        (new_distance, next_pos, path + [next_pos]))
                
    return None  # No path found
```

## When to Use Each Algorithm

In my experience, choosing the right algorithm depends on your specific needs:

- Use **BFS** when you need the shortest path and all steps cost the same (like moving through a grid)
- Use **DFS** when you want to explore as deeply as possible before backtracking or when memory is limited
- Use **Greedy Best-First Search** when speed is more important than finding the absolute shortest path
- Use **A*** when you need the shortest path and have a good heuristic to guide your search
- Use **Dijkstra's algorithm** when you need the shortest path but don't have a reliable heuristic, or when you need shortest paths to multiple destinations

I often find A* to be the most practical choice for pathfinding problems, as it combines the guarantees of Dijkstra's algorithm with the efficiency of a heuristic approach. However, if I'm working with a simple grid where all moves cost the same, BFS is often cleaner and simpler to implement while still guaranteeing the shortest path.