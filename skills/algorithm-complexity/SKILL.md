---
name: algorithm-complexity
description: Practical algorithm and performance mentoring to analyze, review, and optimize time and space complexity in Node.js and TypeScript production code. Guides Big-O derivation, loops, recursion, V8 call stack growth, auxiliary memory, and complexity trade-offs.
argument-hint: "[code snippet or function name]"
---

# Algorithm Complexity

Produce practical algorithm and performance mentoring that helps developers understand, analyze, review, and improve the time and space complexity of Node.js and TypeScript production code.

Rather than superficially labeling code as "O(n)" or reflexively asserting "use O(1)", teach developers to reason about algorithmic scalability, loop mechanics, call stack growth, hidden built-in costs, and memory trade-offs.

## Scope

**In scope:**
- Time complexity classification and asymptotic growth analysis: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(n³) cubic, O(2ⁿ) exponential, and O(n!) factorial.
- Complexity bounds and behavioral cases: best case, average case, worst case, amortized complexity, upper bounds (Big-O / $O$), tight bounds ($\Theta$), and lower bounds ($\Omega$).
- Space complexity decomposition: strictly distinguishing Input Space, Auxiliary Space (extra memory used by the algorithm during execution), and Total Space.
- Node.js runtime memory structures: V8 call stack growth from recursion (stack frame limits ~10,000 frames), iteration vs. recursion stack frames, heap allocation, temporary data structures (`Map`, `Set`, arrays, buffers), and memory/time trade-offs.
- Big-O derivation rules: dropping constants, dropping lower-order terms, additive rules for sequential blocks, multiplicative rules for nested iterations, branch complexity, and hidden costs of JavaScript/TypeScript standard library built-ins (e.g., `indexOf`, `includes`, `slice`, `splice`, `filter`, array spreading, string concatenation).
- Mentoring and review discipline: explaining the mechanical "why" behind algorithmic scaling and guiding developers through step-by-step refactoring of high-complexity hotspots.

**Out of scope:**
- Measuring live production I/O or network execution latency — hand over to `/engineering-mentor:performance-review`.
- Relational database query tuning, table indexes, and SQL query plans — hand over to `/engineering-mentor:database-review`.
- Profiling Node.js process crashes, event loop lag, or garbage collection leaks — hand over to `/node-mentor:debug-node`.

## When to Use

Use when:
- Reviewing TypeScript/JavaScript code with loops, nested iterations, recursion, or heavy data-structure transformations to identify scalability bottlenecks.
- Analyzing the asymptotic time and space complexity of an existing algorithm, function, or pull request.
- Mentoring developers on why an implementation slows down non-linearly as dataset sizes grow.
- Evaluating memory overhead, recursion stack depth, or potential stack overflow (`Maximum call stack size exceeded`) / out-of-memory risks.
- Choosing the right data structure (`Array` vs. `Map` vs. `Set`) for an in-memory Node.js processing pipeline.
- Refactoring quadratic O(n²) or cubic O(n³) operations into linear O(n) or linearithmic O(n log n) alternatives.
- Calculating amortized cost for dynamic array resizing, hash table rehashing, or batch processing workflows.

Do not use when:
- The bottleneck is external database queries or remote HTTP calls rather than CPU/memory algorithmic complexity.
- Estimating execution times for tiny, fixed-size datasets ($n \le 10$) where constant factors and memory layout dominate asymptotic Big-O behavior.

## Workflow

1. **Identify the Input Variables:** Define what $n$, $m$, $k$, etc. represent in the algorithm (e.g., array length, string length, graph vertices/edges, tree depth). Never assume a single $n$ when multiple independent collections are processed.
2. **Deconstruct Code Structure:** Trace control flow — sequential execution blocks, single loops, nested loops, conditional branches, and recursive invocations.
3. **Account for Hidden Built-In Costs:** Inspect standard library and language built-in operations inside loops (e.g., `Array.prototype.indexOf`, `includes`, `find`, `slice`, `splice`, `filter`, string concatenations, set lookups) to ensure internal operations are not mistakenly assumed to be O(1).
4. **Derive Asymptotic Time Complexity:**
   - **Sequential blocks (Additive Rule):** Sum the costs of successive steps ($T(n) = T_1(n) + T_2(n)$).
   - **Nested loops (Multiplicative Rule):** Multiply outer loop iterations by inner loop work ($T(n) = \text{outer iterations} \times \text{inner work}$).
   - **Recursive calls:** Solve recurrence relations via recursion tree expansion or step counting.
   - **Simplify:** Drop constant multipliers ($O(3n) \to O(n)$) and drop lower-order terms ($O(n^2 + 5n + 10) \to O(n^2)$).
5. **Analyze Best, Average, Worst, and Amortized Cases:** Evaluate input variations (e.g., already sorted vs. reverse sorted inputs, hash collision frequency, dynamic array capacity doubling).
6. **Decompose Space Complexity:**
   - Measure **Input Space** (size of parameters passed into the function).
   - Measure **Auxiliary Space** (additional memory allocated during execution: local variables, temporary collections, call stack frames).
   - Calculate **Total Space** ($\text{Input Space} + \text{Auxiliary Space}$).
   - Inspect maximum call stack depth for recursive functions to assess stack-overflow risk in Node.js.
7. **Formulate Mentoring and Trade-Off Guidance:** Explain the mechanical cause of the bottleneck, demonstrate the production impact as $n$ scales, and guide the developer through refactoring options with explicit time-vs-space trade-offs.

## Rules

### Big-O Derivation Rules

To derive Big-O complexity from code, apply these fundamental rules systematically:

1. **Drop Constants:** Big-O measures growth rate as $n \to \infty$. Constant factors do not alter the growth category.
   - $O(2n) \to O(n)$
   - $O(100) \to O(1)$
   - $O(0.5 n^2) \to O(n^2)$

2. **Drop Lower-Order Terms:** Only the term with the fastest growth rate matters as $n$ approaches infinity.
   - $O(n^2 + 3n + 100) \to O(n^2)$
   - $O(n \log n + n) \to O(n \log n)$
   - $O(2^n + n^3) \to O(2^n)$

3. **Additive Rule (Sequential Operations):** When operations execute sequentially, sum their complexities:
   ```typescript
   // Step 1: O(n)
   for (const item of items) {
     doConstantWork(item);
   }

   // Step 2: O(m)
   for (const record of records) {
     doConstantWork(record);
   }
   // Total Time: O(n + m). If n === m, O(2n) -> O(n).
   ```

4. **Multiplicative Rule (Nested Operations):** When operations nest, multiply the outer loop iterations by the inner work:
   ```typescript
   // Outer loop runs n times: O(n)
   for (const item of items) {
     // Inner loop runs m times: O(m)
     for (const other of others) {
       doConstantWork(item, other); // O(1)
     }
   }
   // Total Time: O(n * m). If items and others both have size n, O(n^2).
   ```

5. **Loop with Halving / Doubling Iterations (Logarithmic Rule):** When the loop variable multiplies or divides by a constant factor on each step, the loop executes in $O(\log n)$ iterations:
   ```typescript
   let i = 1;
   while (i < n) {
     i = i * 2; // O(log n)
   }
   ```

6. **Branching / Conditional Rule:** A conditional branch executes one path. Analyze the worst-case branch unless reasoning about average or amortized execution:
   ```typescript
   if (condition) {
     // O(n) branch
   } else {
     // O(1) branch
   }
   // Worst-Case Time: O(n)
   ```

### Time Complexity Classes and Behavior

Always distinguish the standard complexity classes and understand their practical scaling behavior:

- **O(1) — Constant Time:** Runtime does not depend on the input size $n$.
  - *Examples:* `Map.prototype.get()`, `Set.prototype.has()` (without hash collisions), array index lookup (`arr[i]`), pushing to an array (`arr.push()`).
- **O(log n) — Logarithmic Time:** Each step reduces the remaining problem size by a fractional factor (typically half).
  - *Examples:* Binary search in a sorted array, operations on balanced search trees, binary heap insertion/extraction.
- **O(n) — Linear Time:** Runtime grows in direct linear proportion to input size $n$.
  - *Examples:* Iterating through an array, `arr.indexOf()`, `arr.includes()`, `arr.find()`, copying an array (`[...arr]`).
- **O(n log n) — Linearithmic Time:** Occurs when dividing a problem into logarithmic subproblems and performing linear work to combine them.
  - *Examples:* V8's `Array.prototype.sort()` (TimSort), Merge Sort, Heap Sort.
- **O(n²) — Quadratic Time:** Work grows with the square of input size. Routinely caused by nested loops over the same collection or linear built-ins inside loops.
  - *Examples:* Nested loops, bubble sort, brute-force pair comparisons.
- **O(n³) — Cubic Time:** Work grows with the cube of input size. Often caused by three nested loops.
  - *Examples:* Naive matrix multiplication, checking all triplets in an array.
- **O(2ⁿ) — Exponential Time:** Runtime doubles with each additional element in the input. Impractical for production workloads beyond very small $n$ ($n > 25$).
  - *Examples:* Recursive calculation of Fibonacci numbers without memoization, generating all subsets (power set).
- **O(n!) — Factorial Time:** Runtime multiplies by $n$ at each step. Completely intractable for $n > 12$.
  - *Examples:* Generating all permutations of an array, brute-force Traveling Salesperson Problem.

### Complexity Bounds and Cases

When describing algorithmic performance, do not use "O" loosely to mean "takes this long". Use precise terminology:

1. **Upper Bound (Big-O / $O$):** Mathematical ceiling on growth rate. Represents the worst possible growth rate as $n \to \infty$.
2. **Tight Bound (Big-Theta / $\Theta$):** Both an upper and lower bound. Describes the exact asymptotic growth rate when upper and lower bounds coincide.
3. **Lower Bound (Big-Omega / $\Omega$):** Mathematical floor on growth rate. Represents the minimum work an algorithm must perform.

Distinguish the four execution cases:
- **Best Case:** Input configuration requiring the least work (e.g., target element is at index 0 in linear search: $\Omega(1)$).
- **Average Case:** Expected runtime over all possible valid inputs of size $n$, assuming a probability distribution (e.g., QuickSort average case: $\Theta(n \log n)$).
- **Worst Case:** Input configuration maximizing work (e.g., QuickSort on already sorted array with naive pivot: $O(n^2)$).
- **Amortized Complexity:** Average cost per operation across a sequence of operations, guaranteeing that occasional expensive steps are paid for by frequent cheap steps.
  - *Dynamic Array Appends:* Appending (`push`) is $O(1)$ most of the time. When capacity is exceeded, an array of size $2n$ is allocated and elements copied ($O(n)$ step). Over $n$ appends, total copy work is $O(n)$, giving an amortized cost of $O(1)$ per append.
  - *Hash Table Insertions:* Average amortized $O(1)$, but can spike to $O(n)$ during rehashing/resizing or pathological key hash collisions.

### Space Complexity: Input vs. Auxiliary vs. Total Space

Always separate the components of memory consumption:

1. **Input Space:** Memory required to store the input data given to the function. For an array of size $n$, input space is $O(n)$.
2. **Auxiliary Space:** Extra or temporary memory allocated by the algorithm *excluding* the input data.
   - In-place algorithms (e.g., in-place array reversal, two-pointer swaps) use $O(1)$ auxiliary space.
   - Algorithms that allocate a new array, `Map`, or `Set` of size $n$ use $O(n)$ auxiliary space.
3. **Total Space:** Sum of Input Space and Auxiliary Space ($\text{Total} = \text{Input} + \text{Auxiliary}$).

When evaluating an algorithm's memory footprint:
- **O(1) Auxiliary Space:** Modifies data in-place or uses only primitive tracking variables.
- **O(log n) Auxiliary Space:** Typically the call stack depth of balanced divide-and-conquer recursion.
- **O(n) Auxiliary Space:** Allocating temporary arrays, `Map` instances, `Set` instances, or unbalanced recursion call stacks.

### Call Stack and Recursion Memory (V8 / Node.js)

Every function call in a recursive algorithm allocates a new stack frame on the call stack containing parameters, return addresses, and local variables.
- Recursive depth $d$ consumes $O(d)$ auxiliary stack space.
- JavaScript engines (V8 in Node.js) do **not** perform tail call optimization (TCO) in production.
- Node.js default call stack limit is approximately 10,000 frames. Deep recursive algorithms with $O(n)$ stack depth will throw `RangeError: Maximum call stack size exceeded` for large inputs.
- Refactor recursive algorithms with linear depth to iterative loops with explicit queues or stacks to prevent runtime crashes.

### Hidden Complexity in JavaScript / TypeScript Built-Ins

A frequent source of accidental quadratic complexity in Node.js production code is calling linear-time built-in library functions inside a loop:

- **Array Search Methods:** `arr.includes()`, `arr.indexOf()`, `arr.find()`, `arr.findIndex()` are $O(n)$ linear searches. Calling them inside a `for` loop, `arr.filter()`, or `arr.map()` turns an $O(n)$ loop into an $O(n^2)$ quadratic bottleneck.
- **Array Mutation Methods:** `arr.shift()`, `arr.unshift()`, and `arr.splice()` re-index elements and take $O(n)$ time. Calling `arr.shift()` inside a loop of size $n$ results in $O(n^2)$ time.
- **Array Slicing and Spreading:** `arr.slice()` and `[...arr]` allocate a new array and copy $k$ elements, taking $O(k)$ time and $O(k)$ auxiliary space.
- **String Concatenation in Loops:** Because strings are immutable primitives in JavaScript, `str += chunk` inside an $n$-iteration loop creates a new string copy on each iteration, causing $O(n^2)$ time and massive garbage collection pressure. Use an array buffer (`chunks.push(chunk)`) followed by `chunks.join('')` instead.

### Memory vs. Time Trade-offs in Node.js Services

Engineering mentoring must guide practical trade-offs rather than dogmatic optimizations:

- **Trading Space for Time (Caching / Indexing):** Using an $O(n)$ auxiliary `Map` to reduce lookup time from an $O(n^2)$ nested loop down to $O(n)$ linear time. This is almost always the right trade-off in web request handlers when dataset size is modest ($n < 100,000$).
- **Trading Time for Space (Streaming Pipelines):** Using Node.js streams (`stream.Readable`, `stream.Transform`) with $O(1)$ auxiliary buffer space when processing large files (e.g. 500MB CSV or 10M records) to prevent process Out-Of-Memory (OOM) crashes.

### Mentoring Discipline: Teach Why, Don't Just State Big-O

When providing complexity feedback during reviews or pairing:
1. **Never make unsupported assertions:** Do not write "Change this to O(1)" without explaining *how* and *why*.
2. **Translate to production impact:** Show the developer what the complexity curve means with real numbers:
   - For $n = 1,000$: $O(n)$ is $1,000$ operations; $O(n^2)$ is $1,000,000$ operations.
   - For $n = 50,000$: $O(n)$ completes in milliseconds; $O(n^2)$ takes 2.5 billion operations, pegging the CPU, blocking the Node.js event loop, and causing request timeouts.
3. **Provide actionable refactoring steps:** Provide the before-and-after code, highlight the data structure change, and compare time and space complexities explicitly.

## Constraints

- Never guess the complexity of standard library functions without verifying runtime mechanics for V8 / Node.js.
- Never conflate Input Space with Auxiliary Space when reporting space complexity.
- Never demand complex data structure optimizations for small, bounded collections ($n \le 10$) where constant factors, cache locality, and allocation overhead make simple arrays faster in practice.
- Never propose an algorithmic optimization that sacrifices correctness, type safety, or error handling for negligible gains.

## Edge Cases

- **Variable-Bound Inner Loops:** An inner loop whose limit depends on the outer loop index $i$ (e.g., `for (let j = i + 1; j < n; j++)`): $\sum_{i=1}^{n-1} (n - i) = \frac{n(n-1)}{2} \to O(n^2)$, not $O(n)$.
- **Distinct Input Dimensions ($n$ and $m$):** Processing an array of size $n$ against another of size $m$ is $O(n \cdot m)$ or $O(n + m)$, not $O(n^2)$ or $O(n)$, unless $n \approx m$ is proven.
- **Event Loop Blocking in Node.js:** Because Node.js is single-threaded, an $O(n^2)$ or $O(2^n)$ CPU-bound synchronous block will starve the event loop, freezing all concurrent HTTP requests and health checks.
- **Amortized Constant vs. Worst-Case Latency Spikes:** In low-latency systems, an $O(1)$ amortized operation (like hash table insertion or dynamic array resizing) can produce an occasional $O(n)$ latency spike.

## Failure Handling

When code structure is too dynamic or relies on inputs that cannot be mathematically bounded (e.g., while-loops terminating on non-deterministic external network I/O, event listeners, or database polling), state that algorithmic complexity is **indeterminate from code alone**. Explicitly name the missing loop termination invariants or missing runtime constraints required to complete analysis.

## Expected Output

Mentoring outputs provide:

1. **Current Complexity Breakdown:** Time complexity (Best, Average, Worst, Amortized) and Space complexity (Input, Auxiliary, Total).
2. **Derivation Walkthrough:** Step-by-step breakdown explaining outer loops, inner operations, and hidden built-in costs.
3. **Production Scaling Impact:** Explanation of how execution time and event loop responsiveness scale as $n$ grows.
4. **Refactoring Recommendation:** Step-by-step code transformation with a comparative Before-vs-After complexity table.

## Examples

### Positive Example: Refactoring Quadratic Nested Lookup to Linear Time

#### Initial Code:
```typescript
interface User { id: string; name: string; }
interface Order { id: string; userId: string; amount: number; }

export function attachUserNames(orders: Order[], users: User[]): (Order & { userName: string })[] {
  // orders has length n, users has length m
  return orders.map(order => {
    // Array.prototype.find performs a linear scan over users: O(m)
    const user = users.find(u => u.id === order.userId);
    return {
      ...order,
      userName: user ? user.name : 'Unknown',
    };
  });
}
```

#### Mentoring & Complexity Breakdown:
- **Input Dimensions:** $n = \text{orders.length}$, $m = \text{users.length}$.
- **Initial Time Complexity:** $O(n \times m)$. The outer `.map()` runs $n$ times. Inside each iteration, `.find()` scans up to $m$ users. If $n = 10,000$ and $m = 10,000$, this performs up to $100,000,000$ comparisons.
- **Initial Auxiliary Space:** $O(1)$ auxiliary space (excluding the returned array of size $n$).
- **Bottleneck:** Repeated linear scan for each order, blocking the Node.js event loop.
- **Optimization Strategy:** Trade $O(m)$ auxiliary space to build a lookup `Map` in one pass, turning each lookup from $O(m)$ into $O(1)$.

#### Refactored Code:
```typescript
export function attachUserNames(orders: Order[], users: User[]): (Order & { userName: string })[] {
  // Precompute user lookup map: O(m) time, O(m) auxiliary space
  const userMap = new Map<string, string>();
  for (const user of users) {
    userMap.set(user.id, user.name);
  }

  // Map orders in single linear pass: O(n) time
  return orders.map(order => ({
    ...order,
    userName: userMap.get(order.userId) ?? 'Unknown', // O(1) map lookup
  }));
}
```

#### Comparative Complexity Table:
| Metric | Before | After | Trade-off / Rationale |
|---|---|---|---|
| **Time Complexity** | $O(n \times m)$ | $O(n + m)$ | Replaced nested scan with sequential preprocessing + $O(1)$ lookups. |
| **Auxiliary Space** | $O(1)$ | $O(m)$ | Allocated a `Map` storing $m$ user IDs and names. |
| **Production Impact** | ~100M operations for $n=m=10k$ | ~20k operations for $n=m=10k$ | Prevents CPU saturation and event-loop blocking. |

### Negative Example: Superficial Complexity Analysis with Hidden Built-in Costs

#### Flawed Reviewer Statement:
> "This function only has one `for` loop, so its time complexity is $O(n)$ and it is already optimal."

```typescript
function deduplicateItems(items: string[]): string[] {
  const result: string[] = [];
  for (const item of items) {
    if (!result.includes(item)) { // HIDDEN O(k) LINEAR SCAN
      result.push(item);
    }
  }
  return result;
}
```

#### Correct Mentoring Analysis:
The analysis is incorrect because it ignores the hidden complexity of `result.includes(item)`. On iteration $i$, `result` has up to $i$ elements. `includes()` performs an $O(i)$ linear scan. The total time is $\sum_{i=0}^{n-1} i = \frac{n(n-1)}{2} = O(n^2)$.
The correct refactoring uses a `Set`:
```typescript
function deduplicateItems(items: string[]): string[] {
  return Array.from(new Set(items)); // O(n) time, O(n) auxiliary space
}
```

## Related Skills

- `/engineering-mentor:performance-review` — Related: Consumes complexity analysis when diagnosing measured latency or CPU bottlenecks.
- `/engineering-mentor:code-review` — Related: Checks code changes and pull requests against performance and scalability standards.
- `/node-mentor:debug-node` — Related: Diagnoses crashes, event loop blocking, and memory leaks in Node.js runtimes.
