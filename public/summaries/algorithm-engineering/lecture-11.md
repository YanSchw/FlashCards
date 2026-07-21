# Lecture 11: Decomposition — Explained Simply

## The Big Idea (in one sentence)

Some problems are too big and tangled to solve all at once. **Decomposition** means: chop the giant problem into small easy pieces, solve the pieces, and use a little bit of "glue" to make sure the pieces fit together.

> **Kid version:** Imagine a giant jigsaw puzzle. Instead of staring at all 1000 pieces at once, you sort them into little piles (corners, sky, grass), solve each pile, then join the piles. Same puzzle — much easier.

---

## Why do this at all?

Hard optimization problems are often made of **loosely connected smaller problems**. There are lots of "local" decisions that would be easy on their own, but a few **global rules** tie everything together and make it hard.

The trick: if we can pull apart those few annoying "tying-together" rules (called **coupling constraints**), the leftover pieces become easy. This lecture shows **three different ways** to do that pulling-apart.

---

## The Running Example: Facility Location

We'll use one example the whole way through so you can see how each method attacks the *same* problem differently.

**The story.** You run a delivery company. You can open warehouses ("facilities") in various towns. Each warehouse:

- costs money to open (**opening cost** $f_i$),
- can only serve so many customers (**capacity** $c_i$),
- has a delivery cost to reach each customer (**service cost** $s_{ij}$ = cost for warehouse $i$ to serve client $j$).

Every customer ("client") **must** be served by exactly one warehouse. **Goal: serve everyone as cheaply as possible** (opening costs + delivery costs).

### Writing it as one big math problem (a "MIP")

We use yes/no (0 or 1) decision variables:

- $x_i = 1$ if we **open** warehouse $i$, else 0.
- $y_{ij} = 1$ if client $j$ is **assigned** to warehouse $i$, else 0.

$$\min \; \sum_i f_i x_i + \sum_j \sum_i s_{ij} y_{ij}$$

subject to:

| Rule | Meaning in plain English |
|------|--------------------------|
| $\sum_j y_{ij} \le c_i x_i$ | A warehouse can't serve more clients than its capacity — and only if it's actually open. |
| $y_{ij} \le x_i$ | You can only assign a client to a warehouse that's open. |
| $\sum_i y_{ij} = 1$ | **Every client is served by exactly one warehouse.** ← this is the troublemaker |
| $x_i, y_{ij} \in \{0,1\}$ | Everything is yes/no. |

That third rule — "every client served exactly once" — is what **couples** all the warehouses together. Without it, each warehouse could just do its own thing. Every method below is basically a different clever way of dealing with that one rule.

---

# Method 1: Lagrangian Relaxation

### The idea: turn rules into prices

Instead of *forbidding* the machine from breaking a rule, we let it break the rule — but **charge it a fee** every time it does. Push the fee up when it cheats, and eventually it stops cheating on its own.

> **Everyday example:** A library wants books returned on time. Option A: lock the doors so no one can leave with a late book (a hard rule — annoying to enforce). Option B: charge a late fee. If books still come back late, raise the fee. People adjust their own behavior. Lagrangian relaxation is Option B for math problems.

### The recipe

Take the annoying constraint and move it *into the objective* as a penalty. General form — a constraint like $\sum_i a_{ij} x_i = b_j$ becomes a penalty term:

$$\min \; \sum_i c_i x_i \;+\; \sum_j \mu_j\Big(b_j - \sum_i a_{ij}x_i\Big)$$

Here $\mu_j$ is the **price** (the "penalty" or "Lagrange multiplier") for breaking rule $j$.

### Why is it called a *relaxation*?

Because we didn't throw the rule away — we made it optional-with-a-fee. Any solution that obeyed the original rules is still allowed and costs the same (its penalty is zero, since it doesn't break anything). We only *added* new options, so the answer can only get cheaper or stay equal. **That means the relaxed answer is a lower bound**: $L(\mu) \le \text{OPT}$ — it's never more expensive than the true best answer. Handy, because it tells us "the real answer is at least this much."

### Applied to warehouses

We dualize (turn into a price) the troublemaker rule "each client served once." The problem becomes:

$$\min \sum_i f_i x_i + \sum_j\sum_i s_{ij}y_{ij} + \sum_j \mu_j\Big(1 - \sum_i y_{ij}\Big)$$

Reshuffle the algebra and something beautiful happens — the delivery cost $s_{ij}$ just gets *discounted* by the price $\mu_j$:

$$\min \sum_i f_i x_i + \sum_j\sum_i (s_{ij}-\mu_j)\,y_{ij} + \sum_j \mu_j$$

Now **there's no rule connecting the warehouses anymore.** Each warehouse is a separate, tiny problem:

> **For each warehouse $i$:** "Given these discounted delivery prices $(s_{ij}-\mu_j)$, and my capacity $c_i$, which clients are worth serving to minimize my own cost?"

This little subproblem is **super fast** — you can basically solve it greedily (grab the most profitable clients until full). We just turned one huge problem into many tiny independent ones. 🎉

### Getting the prices right (the loop)

We don't know the perfect prices $\mu$ up front, so we hunt for them:

1. Start with some prices (e.g. all zero).
2. Solve all the tiny warehouse subproblems → get result $L(\mu)$ (a lower bound).
3. Look at how badly each client's rule was broken. Client $j$'s **violation** is $g_j = 1 - n_j$, where $n_j = \sum_i y_{ij}$ is how many warehouses served it.
   - Served by **nobody** ($n_j=0$) → we under-covered → *raise* its price to make serving it more attractive.
   - Served by **too many** → we over-covered → *lower* its price.
4. Update each price: $\;\mu_j \leftarrow \mu_j + t_k\, g_j\;$ (nudge in the direction of the violation, by step size $t_k$).
5. Repeat until the lower bound and a real (upper-bound) solution meet.

This price-updating rule is called the **subgradient method** — think of it as feeling your way uphill in fog: you can't see the peak, but you can feel which way is up and take a step that way.

### How big should each step be? (step lengths $t_k$)

- **Diminishing but non-summable** ($t_k \to 0$ but $\sum_k t_k = \infty$): steps shrink over time but never add up to a finite amount. Guarantees convergence but can be slow — like taking smaller and smaller steps so you don't overshoot the peak.
- **Polyak / Held–Karp rule:** a smarter step that uses the gap between your best-known answer (UB) and current bound: $\;t_k = \lambda_k \frac{UB - L(\mu^k)}{\|g^k\|^2}$, usually starting $\lambda_k = 2$ and halving it whenever progress stalls (needs $\lambda_k \in (0,2)$).
- Fancier options exist (e.g. **deflected subgradient**, which also remembers the previous direction so it doesn't zig-zag as much).

**One safety rule:** for *inequality* rules (like $\le$), the price must be kept one-sided ($\mu_j \ge 0$ or $\le 0$). Otherwise you could accidentally "penalize" a rule that has slack in the wrong direction, and get a bogus bound $L(\mu) > \text{OPT}$ — which would be a lie, since a relaxation should never claim more than the truth. (Equality rules can use any sign.)

---

# Method 2: Dantzig–Wolfe & Column Generation

### The idea: build from ready-made pieces

Instead of prices, let each warehouse **propose complete little plans**, then have a "boss" pick the best combination.

> **Everyday example:** You're catering a party and hire several food trucks. Each truck says: "Here are the menus I *can* make." (Taco truck: menu A serves the vegetarians, menu B serves everyone, etc.) You, the organizer, don't design menus — you just **pick one menu per truck** so that every guest gets fed exactly once, as cheaply as possible. Each ready-made menu is called a **pattern**.

### The setup

For each warehouse $i$, a **pattern** $p$ is one legal way it could operate: a specific set of clients it serves (or serving nobody = staying closed). Each pattern has a cost $s_i^p$ and a client-set $C_i^p$. Let $P_i$ = all feasible patterns for warehouse $i$.

New decision variable: $x_i^p = 1$ if warehouse $i$ uses pattern $p$.

**Master problem** (the "boss" who picks patterns):

$$\min \sum_i \sum_{p\in P_i} s_i^p\, x_i^p$$

subject to:

- **Pick exactly one pattern per warehouse:** $\sum_{p\in P_i} x_i^p = 1$ for each $i$.
- **Every client covered exactly once** across all chosen patterns: $\sum_i \sum_{p:\, j\in C_i^p} x_i^p = 1$ for each client $j$.

Notice the win: the messy capacity/opening logic is now *baked inside* each pattern. The boss only worries about combining them.

### The catch: WAY too many patterns

A warehouse could serve *any* subset of clients — that's astronomically many patterns. We can't list them all. Solution: **column generation** — don't list them, *grow them on demand*, lazily.

> **Everyday example:** You don't memorize every possible pizza before ordering. You start with a couple of options, and only "invent" a new pizza when someone asks for one that would actually be better. Column generation invents new patterns only when they'd improve the answer.

### How column generation works

1. Start with just a **small subset** of patterns (the "Restricted Master Problem", RMP).
2. Solve the RMP as an easier LP (allow fractions for now).
3. Ask: **"Is there a pattern we left out that would make things cheaper?"** In LP terms, a helpful pattern is one with **negative reduced cost**. If none exists, we're already optimal.
4. Finding that best missing pattern is itself a little optimization called the **pricing problem**.
5. Found one? Add it and repeat. None left? Done.

### The pricing problem for warehouses

Solving the RMP gives us "dual values" $\alpha_i$ (one per warehouse) and $\beta_j$ (one per client) — think of them as the current going-rates. For a fixed warehouse $i$, we look for its best new pattern:

$$\min \; f_i - \alpha_i + \sum_j (s_{ij}-\beta_j)\, y_j \quad\text{s.t.}\quad \sum_j y_j \le c_i,\; y_j\in\{0,1\}$$

If this comes out **negative**, we found a money-saving pattern — add it. This little problem is **easy (greedy works!)** — and notice it's essentially the *same* tiny subproblem we solved in the Lagrangian method! The two approaches are secretly close cousins.

### Practical trouble & fixes

The dual values can **jump around wildly** between iterations, especially early (garbage patterns) and late (dithering between near-ties). Two remedies:

- **Stabilization:** gently discourage the dual from leaping too far from a trusted "stability center," using small penalty/slack terms. Only move the center when you've genuinely improved. (Keeps the search calm instead of frantic.)
- **Stopping rules:** compute a lower bound (often falls out of the pricing step for free) so you know when you're close enough to quit.

### Branch & Price (getting whole-number answers)

The LP gives fractions ("use 0.5 of pattern A"), but real warehouses can't run half a plan. So we combine column generation with **branch & bound** → **Branch & Price**: at each branching node, we re-run column generation.

Things to know:
- The RMP's LP bound is **stronger** (tighter) than the plain original LP — a real advantage.
- **Branch on the *original* variables** ($x_i$, $y_{ij}$), not the pattern variables — branching on patterns is awkward and messes up the pricing problem. E.g. forcing $y_{ij}=0$ just tells the pricing problem "don't put client $j$ in warehouse $i$'s patterns."
- Not natively supported by Gurobi/CPLEX; **SCIP** supports it (and can use Gurobi under the hood).
- Cutting planes get tricky, and using it well is "**considered an art**." Column generation is also useful beyond decomposition (e.g. for TSP).

---

# Method 3: Benders' Decomposition

### The idea: guess the hard part, let a helper price out the rest

Split into a **master** that decides the *hard* strategic choices, and a **subproblem** that fills in the *easy* details and reports back how good (or impossible) that choice really was — via **cuts** (new constraints that teach the master a lesson).

> **Everyday example:** Planning a road trip. The **master** decides the big thing: *which cities to visit* (guessing the total cost optimistically — "eh, probably $500"). The **subproblem** then works out the *actual* cheapest driving route for that city list and says: "Nope, that itinerary really costs $800, and here's a rule so you stop lowballing plans like this." That "here's a rule" is a **Benders cut**. The master re-plans with the lesson learned, and repeat. Where Dantzig–Wolfe enumerates *pieces*, Benders enumerates *guesses about the hard part and corrects them*.

### For warehouses: which to open vs. who serves whom

- **Master decides the hard part:** which warehouses to open ($x_i$). It uses a stand-in variable $\theta$ for "the delivery cost I'll pay later," starting optimistically:

$$\min \sum_i f_i x_i + \theta$$

with a rough feasibility guard ($\sum_i c_i x_i \ge n$ = enough total capacity for all $n$ clients), plus a **growing set of Benders cuts**, and $x_i \in\{0,1\},\ \theta \ge 0$. The $\theta$ is called an **epigraph variable** — just a placeholder for the not-yet-known delivery cost.

- **Subproblem (given the open warehouses):** now that we know which warehouses are open, find the cheapest way to assign every client:

$$\min \sum_{i:\,x_i=1}\sum_j s_{ij} y_{ij} \quad\text{s.t.}\quad \sum_j y_{ij} \le x_i c_i,\;\; \sum_i y_{ij}=1,\;\; y_{ij}\in\{0,1\}$$

**Nice fact:** with the warehouses fixed, this assignment problem is just a **Min-Cost Flow** problem (picture clients and warehouses as a network with source $s$ and sink $t$). That's solvable in polynomial time, and the LP even gives whole-number answers automatically. Easy helper. ✅

### The loop

1. Solve the master → get a set of open warehouses + an optimistic cost guess $\theta$.
2. Fix those warehouses, solve the subproblem. Two outcomes:
   - **Feasible:** you get a real assignment (maybe your new best solution!) **and** an **optimality cut** — a constraint of the form $\theta \ge \alpha - \sum_i \alpha_i x_i$ that forces the master's guess $\theta$ to be more realistic next time. (It's built by multiplying each subproblem constraint by its dual value and adding up.)
   - **Infeasible:** the chosen warehouses genuinely can't serve everyone → a **feasibility cut** (from a *Farkas' certificate*, which is basically a mathematical proof of "this can't work") is added to forbid that kind of bad choice.
3. Repeat. The master's optimistic guess and reality squeeze together until they meet.

> **Why cuts help:** each cut is a lesson: "plans shaped like this cost at least X" or "plans shaped like this are impossible." The master gets smarter every round instead of blindly re-guessing.

### Logic-Based Benders (the powerful generalization)

The classic cut recipe needs the subproblem to be a nice **LP** (so we can use its duals). **Logic-Based Benders' Decomposition (LBBD)** drops that requirement — the subproblem can be a **constraint program (CP), SAT, MIP, dynamic program**, anything.

Instead of an LP dual, the cut is derived **logically** from the *inference dual*: "what's the best bound on the cost that we can *prove* from the constraints (even using search)?" These logical cuts can be **much stronger** than plain linear combinations. The price you pay: there's **no universal recipe** — you must design **problem-specific** cuts/certificates (an infeasible core, a custom bound, etc.) for each new problem.

---

## Putting It All Together

Three ways to break the *same* warehouse problem apart:

| Method | Core trick | The "glue" | Everyday analogy |
|--------|-----------|-----------|------------------|
| **Lagrangian relaxation** | Turn the coupling rule into a **price/fee** and let each warehouse optimize alone | Iteratively adjust prices $\mu$ (subgradient steps) | Late fees at the library — raise the fee until behavior fixes itself |
| **Dantzig–Wolfe / Column Generation** | Each warehouse offers ready-made **patterns**; a master picks a combo | Generate new patterns *lazily* via a pricing problem | Food trucks propose menus; you pick one per truck |
| **Benders' decomposition** | Master picks the **hard** choices; a subproblem prices out the rest | Add **cuts** that correct the master's optimistic guesses | Pick the cities; a helper computes the real route and gives you a rule |

**And the honest closing note from the lecture:** these methods are powerful but **fiddly** — they usually need a lot of **tuning** to actually beat just throwing the whole problem at a solver. So before a serious implementation, **look up the problem-specific details and tricks** for the method you pick.

---

### One-line memory hook for each

- **Lagrangian:** *"Don't ban it — bill it."* (rules become prices)
- **Dantzig–Wolfe / Column Gen:** *"Pick from a menu you grow as you go."* (combine patterns, invent new ones on demand)
- **Benders:** *"Guess the hard part, let a helper fact-check it with cuts."* (master + subproblem + lessons learned)
