---

title: FizzBuzz Revisited: A Tale of Two Algorithms
authors: simonpainter
tags:
  - personal
  - programming
  - python
date: 2025-03-04

---

## Introduction: Beyond the Basics

FizzBuzz has long been a staple of programming interviews. The problem is deceptively simple: print numbers from 1 to n, but replace multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both with "FizzBuzz". It's not meant to be a challenging algorithmic puzzle; most candidates with basic programming knowledge should solve it without difficulty.

So why does this trivial problem persist in the interview landscape? Because FizzBuzz's true value isn't in filtering out candidates who can't code—it's in opening discussions about complexity, language characteristics, optimisation, and the subtle costs of different operations. The best interviewers don't just ask candidates to solve FizzBuzz; they use it as a starting point for a deeper technical conversation.

In this article, we'll explore two common FizzBuzz implementations, benchmark them in both Python and C, and discover some surprising results that highlight why seemingly trivial problems can reveal profound insights about programming languages and performance optimisation.

## Two Approaches to FizzBuzz

There are primarily two ways to implement FizzBuzz:

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

At first glance, these approaches appear to have different computational characteristics:

- **Conditional approach**: Best case requires only one modulo operation (for numbers not divisible by 3), while worst case requires two (for potential FizzBuzz numbers).
- **Concatenation approach**: Always performs two modulo operations, regardless of the number.

Many developers intuitively favour the conditional approach because of this apparent efficiency in the most common case. After all, only 1/3 of numbers are divisible by 3, and only 1/5 are divisible by 5, so the short-circuit logic seems advantageous.

But is this intuition correct? Let's extend our problem to find out.

## Extending FizzBuzz: Enter "Jazz"

To explore the scalability of each approach, we'll add a third rule: Multiples of 7 should include "Jazz". This creates more possible combinations:

- Multiples of 3 only: "Fizz"
- Multiples of 5 only: "Buzz"
- Multiples of 7 only: "Jazz"
- Multiples of 3 and 5: "FizzBuzz"
- Multiples of 3 and 7: "FizzJazz"
- Multiples of 5 and 7: "BuzzJazz"
- Multiples of 3, 5, and 7: "FizzBuzzJazz"

The conditional approach now requires more branches:

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

While the concatenation approach simply adds one more check:

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

The difference in complexity is now apparent. The conditional approach grows exponentially with the number of rules (2^n possible combinations), while the concatenation approach grows linearly.

## Benchmarking Methodology

To test these implementations, we created benchmarks in both Python and C.

Our methodology:
1. Process numbers from 1 to 1,000,000
2. Time the execution of each approach (conditional vs concatenation)
3. Time the execution of each extended approach (FizzBuzzJazz)
4. Calculate the relative performance differences
5. Determine how well each approach scales when adding the additional "Jazz" rule

The benchmark code avoids I/O operations during timing to prevent them from affecting measurements. For C, we managed memory carefully with fixed-size buffers and used appropriate string handling functions.

## Python Results

Our Python benchmark yielded these results:

```
Standard FizzBuzz:
- Conditional Method:   0.102924 seconds
- Concatenation Method: 0.099827 seconds
- Concatenation is 1.03x faster

Extended FizzBuzzJazz:
- Conditional Method:   0.202059 seconds
- Concatenation Method: 0.126328 seconds
- Concatenation is 1.60x faster

SCALING ANALYSIS (Adding Jazz):
- Conditional Method:   1.96x slower
- Concatenation Method: 1.27x slower
```

In Python, the concatenation approach performs slightly better even for standard FizzBuzz. When we add the Jazz rule, the difference becomes more pronounced, with concatenation being 1.6 times faster. The scaling also favours concatenation, which slows down by only 27% versus the conditional approach's 96% slowdown.

These results challenge our intuition. Despite performing more modulo operations in the common case, the concatenation approach outperforms the conditional one. Why?

Several factors contribute:
1. **Branch prediction**: Modern CPUs try to predict which path an if-statement will take. The conditional approach has multiple branches with varying probabilities, making prediction harder.
2. **Simpler control flow**: The concatenation approach has a more consistent execution pattern, which can be more efficiently optimised by the compiler/interpreter.
3. **Operation cost**: While more modulo operations are performed, this cost is outweighed by the benefits of simpler control flow.

## C Results

The C benchmark showed different characteristics:

```
Standard FizzBuzz:
- Conditional Method:   0.061906 seconds
- Concatenation Method: 0.036563 seconds
- Concatenation is 1.69x faster

Extended FizzBuzzJazz:
- Conditional Method:   0.031024 seconds
- Concatenation Method: 0.033429 seconds
- Conditional is 1.08x faster

SCALING ANALYSIS (Adding Jazz):
- Conditional Method:   0.50x slower
- Concatenation Method: 0.91x slower
```

These results contain some surprises. For standard FizzBuzz, the concatenation approach maintains its advantage and is even more pronounced at 1.69 times faster. However, for FizzBuzzJazz, the conditional approach becomes slightly faster.

Most surprising is that adding the Jazz rule actually made the conditional method *faster* in C. The "0.50x slower" actually means it took half the time of the original algorithm!

## Understanding the Language Differences

Why do we see such different behaviour between Python and C?

### String Handling Efficiency

In C, string operations have different performance characteristics:
- `strcpy()` used in the conditional approach is very efficient for complete string assignments
- `strcat()` used in the concatenation approach is relatively expensive as it must find the end of the string before appending
- Each `strcat()` call adds overhead that doesn't exist in Python's efficient string concatenation

### Compiler Optimisations

The C compiler appears to be heavily optimising the conditional approach:
- Direct modulo checks for combined values (like `i % 105`) may be optimised
- The branching pattern in FizzBuzzJazz may allow for better predictability
- The compiler might recognise common subexpressions in modulo operations

### Memory Access Patterns

The conditional approach makes fewer memory writes in C:
- One `strcpy()` per number versus potentially multiple `strcat()` calls
- This difference becomes more significant as rules are added

## The Broader Lessons

This seemingly trivial exercise reveals several profound lessons about software development:

1. **Intuition can be misleading**: Our intuitive understanding of algorithmic efficiency doesn't always match reality. Always measure!

2. **Language matters**: The same algorithm can have dramatically different performance characteristics in different languages.

3. **Complexity scaling is important**: How an algorithm's performance changes as the problem grows can be more important than its performance on the original problem.

4. **Modern hardware has complex performance characteristics**: Branch prediction, cache behaviour, and compiler optimisations can have more impact than simple operation counts.

5. **Performance is context-dependent**: The concatenation approach is better in Python and for simple cases in C, but the conditional approach scales better with additional rules in C.

## FizzBuzz as an Interview Tool

This exploration demonstrates why FizzBuzz remains valuable in interviews:

- It starts simply but opens doors to deeper discussions
- It allows candidates to demonstrate knowledge of language specifics
- It can reveal how candidates think about scaling and complexity
- It provides an opportunity to discuss testing and performance measurement
- It can lead to discussions about optimisation and when it's appropriate

The next time you interview a candidate with FizzBuzz, don't stop at the first working solution. Ask them to compare alternative implementations. Discuss how the solution might scale if additional rules were added. Explore how the approach might differ in another language. These discussions will yield far more insight into a candidate's abilities than the basic solution alone.

## Conclusion: The Devil in the Details

FizzBuzz may be a simple problem, but it illustrates a fundamental truth of programming: the details matter. Performance characteristics are often non-intuitive and language-dependent. True mastery comes not from knowing the "right" way to solve a problem, but from understanding the trade-offs between different approaches and having the wisdom to choose the appropriate solution for your specific context.

So the next time someone dismisses FizzBuzz as too simple for interviews, remember this tale of two algorithms—and how much we can learn from even the most elementary problems when we take the time to look deeper.