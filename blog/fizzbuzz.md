---

title: "FizzBuzz Revisited: A Tale of Two Algorithms"
authors: simonpainter
tags:
  - algorithms
  - programming
  - python
date: 2026-09-30

---

## Introduction: Beyond the Basics

FizzBuzz has long been a staple of programming interviews. The problem is deceptively simple: print numbers from 1 to n, but replace multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both with "FizzBuzz". It's not meant to be a challenging algorithmic puzzle; most candidates with basic programming knowledge should solve it without difficulty.

So why does this trivial problem persist in the interview landscape? Because I believe FizzBuzz's true value isn't in filtering out candidates who can't code; it's in opening discussions about complexity, language characteristics, and the subtle costs of different operations. The best interviewers don't just ask candidates to solve FizzBuzz; they use it as a starting point for a deeper technical conversation.
<!-- truncate -->
In this article, I'll explore two common FizzBuzz implementations, count the actual work each one does, and then benchmark them in Python and C to see whether intuition and arithmetic agree. I got the arithmetic wrong the first time I wrote this post, which turned out to be a better lesson than the one I set out to write.

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

At first glance, the conditional approach looks like the efficient one. It short-circuits: surely it can skip a check once it finds a match, so most numbers only need one or two modulo operations rather than the concatenation approach's fixed two. That was my assumption when I first wrote this article, and it's wrong.

Work it through case by case. Of every 15 consecutive numbers, only one is a multiple of 15 and gets away with a single modulo operation. Four are multiples of 3 (but not 15), costing two operations. Two are multiples of 5 (but not 15), costing three operations, because the cascade has to fail the 15 check and the 3 check first. The remaining eight numbers, the ones divisible by neither 3 nor 5, are the most common case in the whole set, and they fail all three checks: `i % 15`, `i % 3`, and `i % 5`, before falling through to `str(i)`. That's three modulo operations for the majority case.

Add it up: (1x1 + 4x2 + 2x3 + 8x3) / 15 = 39 / 15 = 2.6 modulo operations per number, on average, for the conditional approach.

The concatenation approach, meanwhile, always evaluates exactly `i % 3` and `i % 5`. No branching, no short-circuiting, just two operations every time.

So the conditional approach doesn't do less work in the common case. It does more, on average, because the most frequent outcome (no match at all) is the most expensive path through the cascade. My original intuition had the comparison backwards.

## Extending FizzBuzz: Enter "Jazz"

To explore the scalability of each approach, I decided to add a third rule: multiples of 7 should include "Jazz". This creates a variety of new combinations: "Fizz" for multiples of 3 only, "Buzz" for multiples of 5 only, "Jazz" for multiples of 7 only, "FizzBuzz" for multiples of both 3 and 5, "FizzJazz" for 3 and 7, "BuzzJazz" for 5 and 7, and finally "FizzBuzzJazz" for numbers divisible by all three.

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

The gap between the two approaches gets worse, not better. Numbers coprime to 3, 5, and 7 make up 48 out of every 105, and each one now has to fail seven modulo checks (`105`, `15`, `21`, `35`, `3`, `5`, `7`) before landing on `str(i)`. Working through the same case-by-case sum as before gives an average of 617 / 105, or roughly 5.9 modulo operations per number for the conditional approach, against a flat 3 for concatenation.

The conditional approach also grows combinatorially with the number of rules, since every new divisor multiplies the number of branches, while the concatenation approach grows linearly: one new `if` per rule. Let's measure both approaches and see whether the numbers back up the arithmetic.

## Benchmark Methodology

I ran both languages on the same machine: an Apple M1 MacBook Pro running macOS, using Python 3.13.7 and Apple clang 21.0.0 (`gcc -O2`). Each function processes numbers from 1 to 1,000,000 and accumulates the length of the result string into a running total, so the string is actually used and the compiler can't optimise the work away.

For Python, I ran all four functions 11 times each, shuffling the run order on every repeat with `random.shuffle` so no single function is consistently advantaged by running first or last, then took the mean and standard deviation:

```python
import random
import statistics
import time

N = 1_000_000
REPEATS = 11

def fizz_buzz_conditional(n):
    total = 0
    for i in range(1, n + 1):
        if i % 15 == 0:
            result = "FizzBuzz"
        elif i % 3 == 0:
            result = "Fizz"
        elif i % 5 == 0:
            result = "Buzz"
        else:
            result = str(i)
        total += len(result)
    return total

# ...the other three functions follow the same pattern...

FUNCS = {
    "fizzbuzz_conditional": fizz_buzz_conditional,
    "fizzbuzz_concatenation": fizz_buzz_concatenation,
    "fizzbuzzjazz_conditional": fizz_buzz_jazz_conditional,
    "fizzbuzzjazz_concatenation": fizz_buzz_jazz_concatenation,
}

results = {name: [] for name in FUNCS}
for _ in range(REPEATS):
    order = list(FUNCS.items())
    random.shuffle(order)
    for name, func in order:
        start = time.perf_counter()
        func(N)
        results[name].append(time.perf_counter() - start)

for name, times in results.items():
    print(name, statistics.mean(times), statistics.stdev(times))
```

For C, I used a `volatile long sink` that every function adds its result into, so the compiler cannot prove the loop's output goes unused and eliminate it. I shuffled run order with `srand(42)` and a Fisher-Yates shuffle, using `clock_gettime(CLOCK_MONOTONIC, ...)` for timing, across 21 repeats per function.

I've kept the full scripts short enough to paste inline above; the complete versions (with all four functions and the shuffle logic) are straightforward extensions of what's shown. If you want to check my working, the arithmetic in the previous sections and the code above are all you need to reproduce this.

## Python Results

Running the harness gave these means and standard deviations, in seconds, over 11 randomised runs:

| Function | Mean (s) | Stdev (s) |
|---|---|---|
| FizzBuzz conditional | 0.1568 | 0.0030 |
| FizzBuzz concatenation | 0.1342 | 0.0029 |
| FizzBuzzJazz conditional | 0.2430 | 0.0056 |
| FizzBuzzJazz concatenation | 0.1734 | 0.0025 |

Concatenation beats conditional by about 14% for plain FizzBuzz, and by about 29% once the Jazz rule is added. That's the arithmetic from the last section showing up directly in wall-clock time: concatenation does a flat 2 or 3 modulo operations per number, conditional does 2.6 rising to roughly 5.9, and CPython pays for every one of those extra operations because each `%` is a bytecode dispatch through the interpreter loop.

There's no branch prediction story here worth telling. CPython doesn't compile the if-elif cascade down to machine branches the way C does; it interprets bytecode, and interpreter dispatch plus repeated `str(i)` calls dominate the timing far more than anything the CPU's branch predictor is doing underneath. And even if it did matter at the hardware level, the divisibility pattern here repeats with a period of 15 (or 105 for the Jazz version), which is about as predictable a pattern as a branch predictor will ever see. The honest explanation is simpler and less exciting: the conditional approach loses because it does more modulo operations, not fewer.

## C Results

The same four functions, compiled with `gcc -O2`, over 21 randomised runs:

| Function | Mean (s) | Stdev (s) |
|---|---|---|
| FizzBuzz conditional | 0.0264 | 0.0011 |
| FizzBuzz concatenation | 0.0331 | 0.0010 |
| FizzBuzzJazz conditional | 0.0260 | 0.0009 |
| FizzBuzzJazz concatenation | 0.0333 | 0.0012 |

This is where my original article went wrong. In an earlier, less careful benchmark I only ran each function once per language, in a fixed order, and got numbers that looked like conditional FizzBuzzJazz (0.031s) beating conditional FizzBuzz (0.033s), a roughly 6% gap on a 30-millisecond run. I wrote a few paragraphs about the compiler restructuring the branch cascade and CPU pipelines rewarding "the right kind of complexity". None of that was justified. A 6% difference on a run that short, measured once, with no variance data, is well within the range you'd expect from timer granularity, a cold first run in a fixed benchmark order, or the compiler eliding work whose result is never read. I hadn't ruled any of those out, so I shouldn't have written it up as a genuine optimisation phenomenon.

With a volatile sink forcing every result to be used, and 21 randomised runs per function, the picture is far less dramatic. Adding the Jazz rule makes no measurable difference to either implementation: conditional stays at roughly 0.026s whether it's checking three divisors or seven, and concatenation stays at roughly 0.033s. The 0.0004s gap between the two conditional means is smaller than either one's own standard deviation, so it's noise, not a trend.

What is real, and consistent across every run I did, is that the conditional approach is about 20% faster than concatenation in C, for both rule sets. I'd originally put this down to `strcat()` needing to scan for the end of the buffer before appending, while `strcpy()` in the conditional branch just writes from the start. With an empty destination buffer that scan costs almost nothing, so I don't think that's carrying much of the difference either. The more likely explanation is `sprintf("%d", i)`, which every function calls for the numeric case: it's the most expensive single operation in the loop, and it gets called on exactly the same numbers in every implementation, so it can't explain a difference between them. What can: the conditional cascade's early exits are genuine branches that a compiled, optimised C binary can predict and pipeline well, in a way an interpreted Python loop never gets the chance to. Consistency across my runs rules out random noise as the explanation for that 20% gap; it doesn't rule out some other systematic effect I haven't isolated, and I'd want disassembly output before claiming more than that.

## Python vs C: A Tale of Two Languages

Put the two languages side by side and a simpler pattern emerges than my first draft suggested. In Python, concatenation wins in both rule sets, and the gap widens as the operation count for conditional climbs from 2.6 to 5.9 modulo operations per number. In C, conditional wins in both rule sets, by a fairly stable 20%, and neither approach is measurably affected by adding the Jazz rule once you account for noise.

The lesson isn't that C defies the arithmetic while Python obeys it. It's that Python's interpreter overhead is large enough that extra modulo operations show up directly in the timing, while C's compiled, branch-predicted execution absorbs that same arithmetic difference almost entirely, leaving room for other factors (cascade structure, instruction-level parallelism) to dominate instead. Neither result required a compiler doing something clever with the modulo operations themselves. I don't have disassembly to back up a stronger claim than that, so I'm not making one.

## Lessons from a Simple Problem

My FizzBuzz adventure taught me to count operations before trusting intuition, and then to measure before trusting the count. My first instinct (fewer modulo calls in the common case for the conditional approach) was wrong on the arithmetic before it ever got near a stopwatch. Working through the case-by-case sum would have told me that in about five minutes, no benchmark required.

Second, once the arithmetic is right, language still matters. The same operation-count difference produces a clear win for concatenation in Python and barely registers in C, because the two languages pay for that arithmetic in very different ways.

Third, "the numbers looked consistent across a dozen runs" isn't the same as "the effect is real". Consistency rules out random noise. It says nothing about systematic error: a fixed run order, a cold cache on the first execution, or a compiler quietly discarding work whose result you never read. I made that mistake in the original version of this article, and the fix was a volatile sink and a shuffled run order, not a cleverer theory.

Fourth, and most usefully for an interview: asking a candidate to count the operations in their own solution, out loud, before running anything, tells you more about how they think than the working code does.

## FizzBuzz: More Than Meets the Eye

This exploration demonstrates why I believe FizzBuzz remains valuable in interviews despite its simplicity. It starts as a basic programming exercise but opens doors to deeper discussions about operation counts, language characteristics, and what a benchmark can and can't tell you.

The next time you interview a candidate with FizzBuzz, don't stop at the first working solution. Ask them to count the operations each branch performs. Ask how that count changes if you add a third or fourth rule. Ask how they'd prove a performance claim rather than just asserting it. These discussions will yield far more insight into a candidate's abilities than the basic solution alone.

## Conclusion: The Devil in the Details

FizzBuzz may seem like a trivial problem, but getting its analysis wrong taught me more than getting it right would have. Performance characteristics are language-dependent and worth measuring properly, but the first thing worth getting right is the arithmetic you're trying to explain.

In Python, the concatenation approach wins clearly, and the gap grows as extra rules push the conditional approach's average operation count higher. In C, the conditional approach wins by a stable margin in both rule sets, and adding rules doesn't move either implementation's timing outside its own noise.

So the next time someone dismisses FizzBuzz as too simple for interviews, remember this tale of two algorithms, and how a wrong assumption about modulo operations, followed by an honest correction, taught me more than the original benchmark ever did. In programming, as in life, the devil is often in the details, and the details are worth checking twice.

Have you caught yourself publishing a confident explanation that didn't survive a second look? I'd love to hear about it.
