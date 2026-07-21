# Lecture 07 — Linear Programming (LP) & Mixed Integer Programming (MIP)

> Algorithm Engineering · Summer 2026
> Easy-to-understand summary with examples.

## The big picture

Imagine you run a lemonade stand and want to make the most money possible. You have rules: only so much sugar, only so many lemons, only so many cups. Figuring out the *best plan* under a bunch of rules like this is called **optimization**.

This lecture covers two related tools:

- **LP (Linear Programming)** — the "easy" version, where answers can be fractions (e.g. "make 3.5 jugs of lemonade").
- **MIP (Mixed Integer Programming)** — the "hard" version, where some answers *must* be whole numbers (you can't build 3.5 bridges or hire 2.7 people).

**Key message:** LP is fast and easy for computers. MIP is genuinely hard (NP-complete). So the trick behind every MIP solver is: **use the easy LP over and over again to slowly crack the hard MIP.**

---

## Part 1 — Linear Programming (the easy problem)

### What it is

You maximize something (money) while obeying **linear constraints** (simple straight-line rules like "sugar used ≤ sugar available").

Good news: **LP is in P** — computer-science speak for *"computers can solve this quickly, even when it's big."* Runtime depends mainly on the number of variables `n`, constraints `m`, and how sparse the problem is.

### The three ways computers solve LP

| Algorithm | Idea (kid version) | Strengths | Weaknesses |
|---|---|---|---|
| **Simplex** 🚶 | Walks along the *edges* of the shape of valid answers, corner by corner | Many cheap steps; great at *warm starts* (resuming after a small change); produces clean "basic" solutions | Not proven to be fast (polynomial); hard to parallelize |
| **Barrier / Interior Point** 🎈 | Floats *through the middle* of the shape and homes in | Fewer, powerful steps; parallelizable; *proven* fast | Each step expensive; bad at warm starts; "crossover" to a clean solution can dominate |
| **PDLP (PDHG)** ⚡ | Many cheap steps, but can use **GPUs** | Very fast to *moderate* precision; only needs matrix-vector ops | Not proven fast; warm starts "not great, not terrible" |

> ⚠️ **Caveat:** it *looks* easier in low dimensions! Our 2D drawings are cute, but real problems live in thousands of dimensions.

> 🍋 **Lemonade analogy:** Simplex = try each corner one by one · Barrier = start in the middle and zoom to the sweet spot · PDLP = a fast helper that gets you *close* super quickly.

---

## Part 2 — From LP to MIP: the whole-number headache

An MIP is just an LP with one extra demand: some variables **must be whole numbers**.

- Only integer variables → **Integer Program (IP)**
- Only {0,1} variables → **Binary Program (BP)** — a `{0,1}` variable is a yes/no switch ("Build the bridge? 1 = yes, 0 = no")

**MIP, IP, and BP are all NP-complete.** That "whole numbers only" rule is what makes everything hard. They are solved in practice by **MIP solvers** using *Branch & Cut* + extensions.

> 🧩 **Why is "whole numbers only" so hard?** With fractions, valid answers form a smooth shape you can slide around in. With whole numbers, valid answers are just scattered *dots* — and there can be a mind-bogglingly huge number to check. You can't just "slide to the best one" anymore.

---

## Part 3 — The star example: Traveling Salesperson Problem (TSP)

A salesperson must visit every city exactly once and return home, using the **shortest total route**. The lecture uses a random 50-city instance.

The solver cracks it like a **treasure hunt with two clues** it keeps improving:

- **UB (Upper Bound)** = the best *real, complete route* found so far. *"A route this good exists."*
- **LB / relaxation value** = a *dream lower estimate* from the easy LP. *"No route could possibly be better than this."*

When these two numbers meet, you've **proven** the best route.

| Step | What the solver did | Estimate (LB) | Best real route (UB) |
|---|---|---|---|
| 1 | Quick rough guess (heuristic) | — | 54277 |
| 2 | Solve easy LP, ignore some rules | 49125 | 54277 |
| 3 | Add 10 "no-cheating" rules | 51766 | 54277 |
| 4 | Add "comb" rules | 51817 → 51936 | 54277 |
| 5 | Branch (force a decision) | 52019 → **52021** | **52021** ✅ |

The estimate climbed from 49125 up to 52021, the real route improved down to 52021, they **met** → **Optimal!** 🎉

The two techniques that make this happen are **Cutting Planes** and **Branch & Bound**.

---

## Part 4 — Cutting Planes ✂️ (adding "no-cheating" rules)

**The problem:** You solve the easy LP and get a *fractional* answer, like "use 0.5 of this road." But you can't use half a road!

**The idea:** Add a new rule (a **cutting plane**) that slices off that silly fractional answer *without ever removing a single valid whole-number answer*. A good cut must be:

- **linear**,
- **satisfied by all** (or at least all potentially optimal) integer solutions,
- **violated** by the current fractional solution `x*` (by more than a tiny ε).

Then you re-solve. You keep an easy LP, lose no valid integer solution, and get a new answer because the cut removed `x*`. Finding such a cut is called the **separation problem** (usually solved by a heuristic that can fail).

![Cutting plane geometric intuition: a blue feasible region contains green integer dots; a red dashed cut slices off the fractional LP optimum without removing any integer point](/courses/algorithm-engineering-ss2026/images/cutting-plane-intuition.svg)

> The lecture also shows a TSP-specific cut called a **comb inequality** — a "handle" `H` with an odd number of "teeth" `T` poking out. You don't need the details: it's just a hand-crafted "no-cheating" rule that bumped the estimate up.

---

## Part 5 — Branch & Bound 🌳 (splitting into "what-if" worlds)

When cutting planes aren't enough, you **branch**: pick a variable stuck at a fraction (say `x = 3.5`) and split into two smaller worlds — *"what if x ≤ 3?"* and *"what if x ≥ 4?"* — then solve each separately. This builds a tree of possibilities.

The magic word is **bound**. If a branch's *dream estimate* (LB) is already **worse** than a real answer you've already found (UB), you can **throw that whole branch away** without exploring it. This is called **pruning**, and it's what saves you from checking billions of possibilities.

![Branch and bound tree: the root splits into two children; the left child reaches the optimal integer solution 52021, and the right child is pruned because its bound 52360 is already worse](/courses/algorithm-engineering-ss2026/images/branch-and-bound-tree.svg)

Branching + cutting together is called **Branch & Cut** — the engine inside every real MIP solver.

---

## Part 6 — Duality 🪞 (the "proof from the other side")

Every maximization LP (the **primal**) has a mirror-image minimization LP (the **dual**). To build the dual, take your constraints, multiply each by a weight (`y ≥ 0`), and add them up cleverly to get a *ceiling* on how good any answer could possibly be.

**Strong Duality Theorem:** if the primal LP has an optimal solution `x*`, the dual has an optimal solution `y*`, and **their values are exactly equal.**

> ⚖️ **Kid analogy — guessing a tower's height:**
> - The **primal** builds up brick by brick: *"I can reach at least this high."* (a floor)
> - The **dual** measures from the ceiling down: *"It can't be taller than this."* (a ceiling)
> - Strong duality says the **floor and ceiling meet at the exact same number.** The moment they touch, you've *proven* the true height.

This is exactly *why* UB and LB meeting in the TSP example counts as **proof** of the best answer. Duality is the mathematical guarantee behind the whole squeeze.

**Dualization rules (quick reference, primal max → dual min):**

| Primal | Dual |
|---|---|
| `xᵢ ≥ 0` | `≥`-constraint |
| `xᵢ` free | `=`-constraint |
| `xᵢ ≤ 0` | `≤`-constraint |
| `≤`-constraint | `yⱼ ≥ 0` |
| `=`-constraint | `yⱼ` free |
| `≥`-constraint | `yⱼ ≤ 0` |

---

## Part 7 — What's inside a real MIP solver? 🔧

The machinery that makes solvers like **Gurobi** and **CPLEX** fast:

### 🎯 Branch variable selection — *which* fractional variable to split on?

- **Most Fractional** — pick the one closest to `x.5` (simple, often mediocre).
- **Pseudo-Cost Branching** — keep a running "report card" per variable estimating how helpful splitting on it usually is. Fast, but chicken-and-egg: *scores get better over time, but the earliest choices matter most.*
- **Strong Branching** — actually *test-solve* both children for several candidates and pick the best. Accurate but expensive.
- **Reliability Branching** — the clever hybrid: Strong Branching early, then trust the pseudo-cost report cards once they're reliable.

### 🔎 Exploration order & warm-starting

The tree can be explored in different orders. Reusing the previous LP solution (**warm-starting**) is huge, since switching a few variable bounds usually needs only a few simplex iterations. There's a memory-vs-speed tradeoff in how much you store at each node.

### ✂️ Cut management

Solvers auto-generate cuts from **templates** (Gomory cuts, cover cuts, clique cuts, mixed-integer rounding…). But too many cuts slow the LP down, so solvers keep a **cut pool** and forget cuts that aren't pulling their weight. Constant balancing act.

### 🧹 Presolve

Before solving anything: eliminate useless variables/constraints, tighten bounds, break symmetry, rescale numbers for stability, and expose hidden structure. Often the single biggest speedup.

### ⚡ Primal heuristics — find good *real* answers fast (→ better upper bounds for pruning)

- **Construction** (build from nothing): Zero Heuristic, Zero-Objective Heuristic, LP rounding, **Diving** (round + re-solve), **Feasibility Pump** (bounce between the LP answer and the nearest rounded point until they line up).
- **Improvement / "polishing"** (take a solution and make it better): **RINS** and **RENS** (fix the parts a solution and its relaxation agree on, re-solve the rest as a small sub-MIP) and **Local Branching** (allow at most `k` variables to change, then re-solve).

---

## One-paragraph takeaway

**LP is the easy problem computers solve fast; MIP is the hard version where answers must be whole numbers.** Solvers crack MIP by leaning on LP repeatedly: solve a relaxed (fraction-allowed) version to get a *dream lower bound*, use *heuristics* to grab a real *upper bound*, then squeeze the two together using **cutting planes** (adding no-cheating rules to shave off fractions) and **branch & bound** (splitting into what-if worlds and pruning hopeless ones). **Duality** proves that when the two bounds meet, you've truly found the best answer. Everything else — branch selection, cut management, presolve, warm-starting, primal heuristics — is engineering to make that squeeze happen *faster*.

---

## Recap checklist

- [ ] Efficient LP solver (root relaxation, later warm-starting)
- [ ] Branch & Bound (exploration order, branch variable selection, propagation & conflict analysis)
- [ ] Cutting planes (templates & heuristics, cut management: selection / scoring / forgetting)
- [ ] Presolve (size reduction, tightening, numerical preprocessing, exposing structure)
- [ ] Primal heuristics

**What can *you* do to help a solver?**

- Primal heuristics — often the easiest addition (MIP start + callback)
- Cutting planes — parameter tuning, custom cuts at the root, or custom cuts in a callback (note: this has consequences for presolve)
