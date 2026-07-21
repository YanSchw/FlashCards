# Lecture 08 — Graph & Network Algorithms (Simple Summary)

## The Big Idea: Graphs Are Just "Dots and Lines"

A **graph** is a bunch of **dots** (*nodes*) connected by **lines** (*edges*).

- **Nodes** = things: people, cities, tasks, machines
- **Edges** = connections: roads, friendships, "must happen before"
- **Weights** = numbers on the lines: how long, how far, how expensive
- **Direction** = sometimes a line only goes one way (a one-way street)

> **Example:** A city map — crossroads are dots, streets are lines, and the "5 minutes" on a street is the weight.

A special kind is a graph with **no loops** (you can never walk in a circle back to the start). These are **DAGs** or **trees**, and they're much easier to solve — like a family tree where you only go downward to your kids, never back up.

The lecture covers **4 classic graph problems**.

---

## 1. Shortest Path — "What's the fastest way there?" 🚗

**Question:** Starting at A, what's the cheapest/fastest way to reach B?

**Kid example:** You're at home and want ice cream. Many routes exist — which is quickest?

**Dijkstra's algorithm:** Drop water at your start dot. It spreads outward, always filling the *nearest* dot next. When it reaches the goal, you've found the shortest path. It explores in **all directions equally**, like a flood. 🌊

**A\* ("A-star"):** Dijkstra + a *hint* about which direction the goal is in. Instead of flooding everywhere, it aims like a **flashlight cone** toward the goal.

> In the lecture: plain Dijkstra explored **1,253 dots**; A\* found the *same* best path with only **123 dots**.

- The hint must **never overestimate** the real distance. If it's an honest under-guess, A\* still finds the true best path.
- **Cool trick:** A\* solved a **sliding tile puzzle** (~180,000 possible arrangements) by treating each arrangement as a "dot" — and only had to look at **283** of them. It builds the graph as it goes instead of storing it all.

**Which algorithm when?**

| Situation | Use |
|---|---|
| No weights on edges | **BFS** (count steps) |
| Normal positive weights | **Dijkstra** |
| Some negative weights | **Bellman-Ford** |
| DAG (no loops) | **Dynamic programming** |

**Two "gotcha" variants:**

- **Time-dependent paths:** A road's travel time depends on *when* you enter it (rush hour). Sometimes a *longer* road that dodges traffic wins, or it's smart to **wait before leaving**. Still *easy* to solve (as long as leaving later never lets you arrive earlier).
- **Resource-constrained paths:** Cheapest route that *also* respects a limit (e.g. cheapest flight under a fuel budget). Looks easy but is secretly **very hard (NP-hard)** — the cheapest path may be "illegal," forcing a pricier legal one.

---

## 2. Matching — "Pairing things up" 💑

**Question:** Pair things together so no thing is used twice, in the best way.

**Rule:** A *matching* is a set of lines where **no two lines touch the same dot** — everyone gets at most one partner.

**Kid example:** At a school dance, pair up students so each has one partner. What pairs up the *most* people (or the *happiest* pairs)?

**Real examples:**

- 🫘 **Kidney exchange:** People need a kidney and have a willing but incompatible donor. Pair up families: "A's donor → B's patient, B's donor → A's patient." Finds swaps that save the most lives (example: 4 swaps, 8 of 9 patients helped).
- 🏭 **Assignment problem:** 5 orders, 5 machines, each pairing has a cost. Which assignment makes **total cost lowest**?

> Note: the *biggest* matching isn't always the *best* — a smaller set of pairs can be worth more if you count value instead of headcount.

---

## 3. Flow — "How much can we push through the pipes?" 🚿

**Question:** In a network of pipes with capacity limits, how much can you push from the tap (**source**) to the drain (**sink**)?

**Kid example:** Water flows from a tank through pipes of different widths to a bathtub. Skinny pipes let less through. The most you can get is limited by the **bottleneck** — the tightest pipe(s).

- **Max flow** = push as much as possible.
- **Min-cost flow** = each pipe charges a fee per unit; move what you need for the **least total money**.

**Key idea — the residual graph:** While filling pipes, the algorithm can **"undo" or reroute** water it sent earlier if that opens a better path. Being able to take back a bad decision is what reaches the true best answer.

> Min-cost flow is so flexible that shortest-path, assignment, and transportation problems are all **special cases** of it — a Swiss Army knife. 🔧

**Examples:** redistributing empty crates between warehouses over days; a work schedule where "one worker = one unit of flow" (answer: 3 workers, €420 total wage).

⚠️ Stays "easy" with **one type of stuff** flowing. With **several goods sharing pipes**, or if you must **pay to open a pipe**, it becomes hard.

---

## 4. Spanning Tree (MST) — "Connect everything, cheaply" 🌳

**Question:** Connect *all* dots using the **least total line length**, with no wasteful loops.

**Kid example:** Connect several houses with internet cable. Everyone must be reachable, but use as **little cable as possible** — no need to wire every house directly to every other. That minimal skeleton is the **Minimum Spanning Tree**.

> Lecture example: wiring a campus so every building reaches the data center — the answer used **18.8 km** of fiber.

Three simple **"greedy"** methods (**Kruskal, Prim, Borůvka**) all solve this *perfectly*. "Greedy" = "always grab the cheapest safe edge right now." For MST this is *provably* the best — rare, since greedy usually doesn't give the perfect answer.

---

## One-Line Summary of the Whole Lecture 📝

| Problem | Plain-English question | Real example |
|---|---|---|
| **Shortest Path** | Fastest way from A to B? | GPS navigation |
| **Matching** | Best way to pair things up? | Kidney swaps, job assignment |
| **Flow** | Most stuff through the pipes? | Water networks, logistics |
| **Spanning Tree** | Connect all, cheapest? | Wiring a campus |

**Warning:** Matching and flow algorithms usually run *fast* in practice, but their worst case is roughly **cubic** (twice as many dots → ~8× slower) — so for very big/tricky inputs they can get slow.

**Overall lesson** (per the joke philosopher *"Confucypus"* 🦆): if a problem is really a graph problem, use a graph algorithm — they're more specialized and much faster than a general-purpose solver.
