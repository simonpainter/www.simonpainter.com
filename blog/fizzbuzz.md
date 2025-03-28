---

title: "FizzBuzz Revisited: A Tale of Two Algorithms"
authors: simonpainter
tags:
  - personal
  - programming
  - python
  - algorithms
  - educational
date: 2025-03-04

---

## Introduction: Beyond the Basics

FizzBuzz has long been a staple of programming interviews. The problem is deceptively simple: print numbers from 1 to n, but replace multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both with "FizzBuzz". It's not meant to be a challenging algorithmic puzzle; most candidates with basic programming knowledge should solve it without difficulty.

So why does this trivial problem persist in the interview landscape? Because I believe FizzBuzz's true value isn't in filtering out candidates who can't code—it's in opening discussions about complexity, language characteristics, optimisation, and the subtle costs of different operations. The best interviewers don't just ask candidates to solve FizzBuzz; they use it as a starting point for a deeper technical conversation.
<!-- truncate -->
In this article, I'll explore two common FizzBuzz implementations, benchmark them in both Python and C, and share some surprising results that highlight why seemingly trivial problems can reveal profound insights about programming languages and performance optimisation.

## Two Approaches to FizzBuzz

There are primarily two ways I've seen FizzBuzz implemented:

### 1. The Conditional Approach

This approach uses an if-elif cascade to handle each case separately:

```python
def fizz_buzz_conditional(n):
    for i in range(1, n + 1):
        if i % 15 == 0:  # Optimisation: directly check divisibility by 15
            result = "FizzBuzz"
        elif i % 3 == 0:
            result = "Fizz"
        elif i % 5 == 0:
            result = "Buzz"
        else:
            result = str(i)
        # In a real implementation, we would print result here
```

### 2. The Concatenation Approach

This approach builds a string by checking each condition independently:

```python
def fizz_buzz_concatenation(n):
    for i in range(1, n + 1):
        result = ""
        if i % 3 == 0:
            result += "Fizz"
        if i % 5 == 0:
            result += "Buzz"
        if not result:
            result = str(i)
        # In a real implementation, we would print result here
```

## The Simple vs. Complex Discussion

At first glance, these approaches appear to have different computational characteristics. The conditional approach seems more efficient because in the best case, it requires only one modulo operation (for numbers not divisible by 3), while in the worst case it needs two (for potential FizzBuzz numbers). Meanwhile, the concatenation approach always performs two modulo operations, regardless of the number.

Many developers (including me at one point) intuitively lean toward the conditional approach because of this apparent efficiency. After all, only one-third of numbers are divisible by 3, and only one-fifth are divisible by 5, so the short-circuit logic seems advantageous. It's the kind of micro-optimisation that I've felt quite pleased about in the past.

But is this intuition correct? Let's extend our problem to find out.

## Extending FizzBuzz: Enter "Jazz"

To explore the scalability of each approach, I decided to add a third rule: Multiples of 7 should include "Jazz". This creates a variety of new combinations: "Fizz" for multiples of 3 only, "Buzz" for multiples of 5 only, "Jazz" for multiples of 7 only, "FizzBuzz" for multiples of both 3 and 5, "FizzJazz" for 3 and 7, "BuzzJazz" for 5 and 7, and finally "FizzBuzzJazz" for numbers divisible by all three.

The conditional approach now requires a much more complex branching structure:

```python
def fizz_buzz_jazz_conditional(n):
    for i in range(1, n + 1):
        if i % 105 == 0:  # 3*5*7 = 105
            result = "FizzBuzzJazz"
        elif i % 15 == 0:  # 3*5 = 15
            result = "FizzBuzz"
        elif i % 21 == 0:  # 3*7 = 21
            result = "FizzJazz"
        elif i % 35 == 0:  # 5*7 = 35
            result = "BuzzJazz"
        elif i % 3 == 0:
            result = "Fizz"
        elif i % 5 == 0:
            result = "Buzz"
        elif i % 7 == 0:
            result = "Jazz"
        else:
            result = str(i)
```

While the concatenation approach remains elegantly simple with just one additional line:

```python
def fizz_buzz_jazz_concatenation(n):
    for i in range(1, n + 1):
        result = ""
        if i % 3 == 0:
            result += "Fizz"
        if i % 5 == 0:
            result += "Buzz"
        if i % 7 == 0:
            result += "Jazz"
        if not result:
            result = str(i)
```

The difference in complexity is now apparent. The conditional approach grows exponentially with the number of rules (2^n possible combinations), while the concatenation approach grows linearly. But complexity doesn't always translate directly to performance. Let's measure both approaches and see what happens.

## Benchmarking Methodology

To test these implementations, I created benchmarks in both Python and C, processing numbers from 1 to 1,000,000. I timed the execution of each approach, calculated their relative performance differences, and examined how they scaled when adding the "Jazz" rule.

My benchmark code avoided I/O operations during timing to prevent them from affecting measurements. For C, I managed memory carefully with fixed-size buffers and used appropriate string handling functions. I also ran multiple tests to ensure consistent results.

## Python Results: A Clear Winner

Running the Python benchmark multiple times revealed a consistent pattern. The concatenation approach consistently outperformed the conditional method for standard FizzBuzz, taking about 0.099 seconds compared to 0.112 seconds—making it about 13% faster. 

When I added the Jazz rule, this performance gap widened considerably. The concatenation method completed in around 0.130 seconds, while the conditional method needed 0.204 seconds—making concatenation about 57% faster for the more complex problem.

What about scaling? The concatenation approach slowed down by only about 31% when adding the Jazz rule, while the conditional approach became a whopping 82% slower. This scaling factor underscores the efficiency of the concatenation approach as complexity increases.

These results challenged my initial intuition. Despite performing more modulo operations in the common case, the concatenation approach consistently outperforms the conditional one in Python. 

Why does this happen? Several factors come into play. Modern CPUs struggle with unpredictable branching patterns, and the conditional approach presents the processor with multiple branches having different probabilities, making prediction difficult. The concatenation approach offers a more consistent execution pattern that the Python interpreter can optimise more effectively. And while the concatenation method does perform more modulo operations, this cost is outweighed by the benefits of simpler control flow.

## C Results: A Plot Twist

When I ran the same benchmarks in C, I encountered some truly surprising results. For standard FizzBuzz, the concatenation approach maintained its advantage, completing in about 0.035 seconds compared to 0.057 seconds for the conditional approach—making it roughly 61% faster.

But here's where things get interesting. For FizzBuzzJazz, the conditional approach actually became faster, taking around 0.031 seconds compared to 0.033 seconds for concatenation. The conditional approach was now about 8% faster!

Even more remarkably, adding the Jazz rule actually made the conditional method faster in C than the original FizzBuzz implementation. The FizzBuzzJazz version took only about 54% of the time required by the standard conditional FizzBuzz. That's right—adding more complexity made the code run faster.

This counter-intuitive result wasn't a fluke. I ran the test over a dozen times and found this pattern remained consistent across nearly all runs. Something fascinating was happening under the hood.

## Python vs C: A Tale of Two Languages

When I place the Python and C results side by side, I see a fascinating contrast. In both languages, concatenation wins for standard FizzBuzz. But for FizzBuzzJazz, Python strongly favours concatenation while C gives a slight edge to the conditional approach.

Most striking is how the two languages handle the addition of more rules. In Python, both approaches slow down as expected, though concatenation degrades more gracefully. In C, the concatenation approach slows down slightly, but the conditional approach actually speeds up—defying conventional logic.

These dramatic differences reveal the underlying nature of these two languages. Python, as an interpreted language, provides highly optimised string operations but doesn't apply complex branch optimisations. Its performance generally degrades predictably as code complexity increases. The concatenation approach benefits from Python's efficient string handling and simpler control flow.

C, on the other hand, operates much closer to the metal. The C compiler performs remarkable optimisations on predictable branch patterns and can recognise when operations share common factors. String operations in C behave differently too—`strcpy()` used in the conditional approach is very efficient for complete string assignments, while `strcat()` used in the concatenation approach must first find the end of the string before appending, adding overhead that doesn't exist in Python.

## The "Faster With More Work" Paradox

The most intriguing aspect of my findings is that in C, the conditional approach actually gets faster when adding the Jazz rule. This seems to violate common sense—how can doing more work take less time?

The answer lies in the C compiler's optimisation capabilities. When our code checks divisibility by various combinations of 3, 5, and 7, the compiler recognises patterns that allow it to optimise calculations. The more structured conditional checks in FizzBuzzJazz create a more predictable branch pattern that allows the CPU to better utilise its instruction pipeline and reduce pipeline stalls.

I think of it like planning a road trip with multiple stops. Sometimes, planning a more complex route with more destinations can actually be faster if those destinations are arranged in a more logical sequence that avoids backtracking. The C compiler essentially rearranges our complex branching code into a more efficient journey through the CPU's execution units.

The consistency of this result across multiple runs rules out measurement error or system fluctuations. It's a genuine optimisation phenomenon that reveals the sophisticated capabilities of modern compilers.

## Lessons from a Simple Problem

My FizzBuzz adventure has taught me several important lessons about software development. First, our intuition about performance can be misleading. What seems more efficient at first glance may not be in practice, and the only way to know for sure is to measure.

Second, language matters profoundly. The same algorithm can behave entirely differently depending on the language it's implemented in. What's optimal in Python may be suboptimal in C, and vice versa.

Third, how an algorithm scales with increasing complexity can be more important than its performance on simpler problems. The concatenation approach scaled beautifully in Python, while in C, the conditional approach showed remarkable scaling properties.

Fourth, modern hardware and compilers introduce complexities that can't be understood through simple reasoning about operation counts. Branch prediction, cache behaviour, and compiler optimisations can dramatically affect performance in ways that aren't obvious from the source code.

And finally, sometimes more complexity can paradoxically improve performance, as I saw with the conditional approach in C. The right kind of complexity can enable optimisations that actually make code run faster.

## FizzBuzz: More Than Meets the Eye

This exploration demonstrates why I believe FizzBuzz remains valuable in interviews despite its simplicity. It starts as a basic programming exercise but opens doors to deeper discussions about language characteristics, algorithm scaling, and performance optimisation.

The next time you interview a candidate with FizzBuzz, don't stop at the first working solution. Ask them to compare alternative implementations. Discuss how different approaches might scale if additional rules were added. Explore how the solution might differ in another programming language. These discussions will yield far more insight into a candidate's abilities than the basic solution alone.

## Conclusion: The Devil in the Details

FizzBuzz may seem like a trivial problem, but my extensive benchmarking reveals it can teach us profound truths about programming. Performance characteristics are often counter-intuitive and heavily dependent on language, compiler, and hardware.

In Python, the concatenation approach consistently wins and scales better as complexity increases. Both implementations slow down when adding rules, as you might expect.

In C, the story is more complex. The concatenation approach wins for simple FizzBuzz, but for FizzBuzzJazz, the conditional approach takes the lead. Most surprisingly, the conditional approach in C actually gets faster when handling more complex rules—a testament to the power of compiler optimisation.

These dramatically different behaviours highlight why empirical testing is essential when making performance decisions. What's efficient in one context may be inefficient in another, and sometimes adding complexity can paradoxically improve performance.

So the next time someone dismisses FizzBuzz as too simple for interviews, remember this tale of two algorithms—and how much we can learn from even the most elementary problems when we take the time to look deeper. In programming, as in life, the devil is often in the details, and simplicity on the surface can hide remarkable complexity underneath.

Have you encountered similar counter-intuitive performance results in your programming work? I'd love to hear about your experiences with optimisation paradoxes!