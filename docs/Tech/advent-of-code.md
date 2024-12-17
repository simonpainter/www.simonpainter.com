---

title: Advent of Code

---


## 2015

### Day 1: Not Quite Lisp
#### Part 1
Count parentheses to determine final floor. Opening parenthesis means up one floor, closing means down one floor. It could have been done in a more efficient way. 

```python
floor = 0
for instruction in data[0]:
    if instruction == '(':
        floor += 1
    elif instruction == ')':
        floor -= 1
print floor
```

#### Part 2
Find first position that enters basement (floor -1). This meant stepping through the floors which I had already done in part 1 rather than simply counting all the left parentesise and counting the right parenthesise and subtracting right from left. 

```python
floor = 0
position = 1
for instruction in data[0]:
    if instruction == '(':
        floor += 1
    elif instruction == ')':
        floor -= 1
    if floor == -1:
        print position
        break
    position += 1
```

### Day 2: I Was Told There Would Be No Math
#### Part 1
Calculate wrapping paper needed for presents based on dimensions. Need surface area plus smallest side area.

```python
box = 0
l, w, h = int(dimensions[0]), int(dimensions[1]), int(dimensions[2])
box += 2*l*w
box += 2*w*h
box += 2*l*h
dimensions = [l,w,h]
box += sorted(dimensions)[0]*sorted(dimensions)[1]
```

#### Part 2
Calculate ribbon needed: smallest perimeter plus volume for bow.

```python
l, w, h = int(dimensions[0]), int(dimensions[1]), int(dimensions[2])
dimensions = sorted([l,w,h])
ribbon = (dimensions[0]+dimensions[1])*2  # Smallest perimeter
bow = l*h*w  # Volume for bow
total = ribbon + bow
```

### Day 3: Perfectly Spherical Houses in a Vacuum
#### Part 1
Track Santa's movement through a grid, following directional instructions. Each arrow moves one space in that direction, and we count unique coordinates visited.

```python
x = 0
y = 0
visits = []
visits.append(tuple([x,y]))

for instruction in instructions:
    if instruction == "^":
        x += 1
    elif instruction == "<":
        y -= 1
    elif instruction == ">":
        y += 1
    elif instruction == "v":
        x -= 1
    visits.append(tuple([x,y]))
print len(set(visits))
```

#### Part 2
Now Santa and Robo-Santa alternate moves, starting from the same position. Track both of their positions and count unique houses visited by either of them.

```python
x = [0,0]  # Santa and Robo-Santa x positions
y = [0,0]  # Santa and Robo-Santa y positions
actor = 0  # Toggle between Santa (0) and Robo-Santa (1)
visits = []
visits.append(tuple([x[actor],y[actor]]))

for instruction in instructions:
    if instruction == "^":
        x[actor] += 1
    elif instruction == "<":
        y[actor] -= 1
    elif instruction == ">":
        y[actor] += 1
    elif instruction == "v":
        x[actor] -= 1
    visits.append(tuple([x[actor],y[actor]]))
    actor = 0 if actor == 1 else 1
```


[Previous days remain the same...]

### Day 4: The Ideal Stocking Stuffer
#### Part 1
Find lowest number that produces MD5 hash starting with five zeros when combined with input.

#### Part 2
Similar to part 1 but requires six leading zeros, testing hash mining performance.

```python
input = "ckczppom"
x = 0
hash = ""
while hash[:6] != "000000":
    hash = hashlib.md5(input+str(x)).hexdigest()
    x += 1
```

### Day 5: Doesn't He Have Intern-Elves For This?
#### Part 1
String validation using multiple regex patterns for vowels, doubles, and forbidden strings.

```python
import re
count = 0
prog1 = re.compile(r".*[aeiou].*[aeiou].*[aeiou].*")  # Three vowels
prog2 = re.compile(r"(.)\1")  # Double letter
prog3 = re.compile(r"(ab|cd|pq|xy)")  # Forbidden strings

for line in data:
    result1 = prog1.search(line)
    result2 = prog2.search(line)
    result3 = prog3.search(line)
    if result1 != None and result2 != None and result3 == None:
        count += 1
```

#### Part 2
Advanced string patterns using regex for repeating pairs and letter sandwiches.

```python
import re
count = 0
prog1 = re.compile(r"(.{2}).*\1")  # Pair appears twice
prog2 = re.compile(r"((.).)\2")  # Letter repeats with one between

for line in data:
    result1 = prog1.search(line)
    result2 = prog2.search(line)
    if result1 != None and result2 != None:
        count += 1
```

### Day 6: Probably a Fire Hazard
#### Part 1
Manipulate a 1000x1000 grid of lights with various operations (on, off, toggle).

#### Part 2
Similar grid operations but with brightness levels instead of binary states.

```python
def do(this, that, what):
    this = this.strip().split(',')
    that = that.strip().split(',')
    for x in range(int(this[0]), int(that[0])+1):
        for y in range(int(this[1]), int(that[1])+1):
            if what == 'on':
                board[x][y] += 1
            if what == 'off':
                board[x][y] -= 1
                if board[x][y] < 0:
                    board[x][y] = 0
            if what == 'toggle':
                board[x][y] += 2

# Initialize 1000x1000 grid
board = [[0 for y in range(1000)] for x in range(1000)]

# Process instructions
for line in data:
    words = line.split(" ")
    if words[1] == 'on':
        do(words[2], words[4], words[1])
    elif words[1] == 'off':
        do(words[2], words[4], words[1])
    else:
        do(words[1], words[3], words[0])

# Calculate total brightness
total = sum(sum(row) for row in board)
```

### Day 7: Some Assembly Required
#### Part 1
Process circuit instructions to calculate wire values through bitwise operations. Each wire can carry a 16-bit signal and gates perform various operations (AND, OR, NOT, SHIFT).

Original iterative solution:
```python
wires = {}
errors = 1

while errors >= 1:
    errors = 0
    for line in data:
        try:
            instruction = line.split()
            # Direct assignment
            if len(instruction) == 3:
                if instruction[0].isdigit():
                    wires[instruction[2]] = int(instruction[0])
                else:
                    wires[instruction[2]] = wires[instruction[0]]
                    
            # NOT operation
            if len(instruction) == 4:
                if instruction[1].isdigit():
                    wires[instruction[3]] = int(instruction[1]) ^ 65535
                else:
                    wires[instruction[3]] = wires[instruction[1]] ^ 65535
                    
            # Binary operations
            if len(instruction) == 5:
                if instruction[1] == 'AND':
                    val1 = int(instruction[0]) if instruction[0].isdigit() else wires[instruction[0]]
                    wires[instruction[4]] = val1 & wires[instruction[2]]
                elif instruction[1] == 'OR':
                    val1 = int(instruction[0]) if instruction[0].isdigit() else wires[instruction[0]]
                    wires[instruction[4]] = val1 | wires[instruction[2]]
                elif instruction[1] == 'LSHIFT':
                    wires[instruction[4]] = wires[instruction[0]] << int(instruction[2])
                elif instruction[1] == 'RSHIFT':
                    wires[instruction[4]] = wires[instruction[0]] >> int(instruction[2])
        except:
            errors += 1
```

Alternative using NetworkX to handle dependencies:

```python
import networkx as nx

def build_circuit(data):
    G = nx.DiGraph()
    operations = {}
    
    for line in data:
        out = line.split(' -> ')
        dest = out[1].strip()
        source = out[0].split()
        
        # Handle different instruction types
        if len(source) == 1:  # Direct assignment
            if source[0].isdigit():
                G.add_node(dest, value=int(source[0]))
            else:
                G.add_edge(source[0], dest)
                operations[dest] = lambda x: x
        elif source[0] == 'NOT':
            G.add_edge(source[1], dest)
            operations[dest] = lambda x: ~x & 65535
        else:  # Binary operations
            G.add_edge(source[0], dest)
            G.add_edge(source[2], dest)
            if source[1] == 'AND':
                operations[dest] = lambda x, y: x & y
            elif source[1] == 'OR':
                operations[dest] = lambda x, y: x | y
            elif source[1] == 'LSHIFT':
                operations[dest] = lambda x, y: (x << int(y)) & 65535
            elif source[1] == 'RSHIFT':
                operations[dest] = lambda x, y: x >> int(y)
    
    return G, operations

# Process in topological order
G, operations = build_circuit(data)
values = {}
for wire in nx.topological_sort(G):
    if wire not in values:
        deps = list(G.predecessors(wire))
        if not deps:  # No dependencies, must be a constant
            values[wire] = G.nodes[wire]['value']
        elif len(deps) == 1:  # Unary operation
            values[wire] = operations[wire](values[deps[0]])
        else:  # Binary operation
            values[wire] = operations[wire](values[deps[0]], values[deps[1]])
```

#### Part 2
Reset circuit and override wire 'b' with previous value of 'a'.

Original approach:
```python
wires = {}
wires['b'] = 956  # Value from Part 1
# Rest same as Part 1
```

NetworkX approach:
```python
G, operations = build_circuit(data)
G.nodes['b']['value'] = 956  # Override b
# Rest same as Part 1
```

The NetworkX solution offers several advantages:
- Handles dependencies explicitly through graph structure
- Processes wires in correct order using topological sort
- More efficient as each wire is calculated exactly once
- Cleaner separation between circuit structure and evaluation

