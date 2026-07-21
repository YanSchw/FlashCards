# Lecture 5: Optimization Fundamentals — The Super-Simple Guide 🎒

## The big idea (in one sentence)

The first half of the course was about making programs **run faster**.
Now we switch to a different job: solving **optimization problems** — puzzles
where we want the *best possible answer*, not just *an* answer. This lecture
tours the main tricks for doing that, all using one famous puzzle: the **Knapsack**.

---

## The one puzzle to rule them all: The Knapsack 🎒

Imagine you have a **backpack** that can only hold a certain amount of weight
before it rips. In front of you is a pile of treasures. Each treasure has:

- a **weight** (how heavy it is), and
- a **price** (how much it's worth).

**Your goal:** pick which treasures to stuff in the bag so the total value is
as high as possible — *without going over the weight limit.*

That's it. That's the Knapsack problem. Think of a kid on Halloween with a candy
bag that can only hold so much: you want the tastiest loot, but the bag fills up.

> **In math-speak:** you have `n` items, each with weight `wᵢ` and price `pᵢ`,
> and a capacity `c`. Choose items to **maximize total price** while keeping
> **total weight ≤ c**.

### Our example bag for the whole lecture

The backpack holds **6 units of weight** (`c = 6`). Here are the treasures:

| Item | Price 💰 | Weight ⚖️ |
|------|---------|-----------|
| 1    | 5       | 4         |
| 2    | 4       | 3         |
| 3    | 3       | 2         |
| 4    | 2       | 1         |

**Spoiler — the best you can do is a value of 9**, by taking items **2, 3, and 4**
(weight 3 + 2 + 1 = 6, exactly full; value 4 + 3 + 2 = 9). Keep this "9" in mind —
every method below is just a different way to *discover* that 9.

Now let's meet the eight ways to crack this puzzle. 👇

---

## 1. Dynamic Programming — "Solve baby puzzles first, then build up" 🧱

**The idea:** Instead of solving the whole hard puzzle at once, solve lots of
**tiny puzzles**, write each answer in a chart, and reuse those answers to solve
bigger puzzles. Like building a LEGO castle: you make small pieces first, then
snap them together.

**The tiny puzzle for Knapsack** is called `K(w, i)`:

> "If my bag could only hold weight `w`, and I were only allowed to use the first
> `i` treasures, what's the best value I could get?"

For each treasure, there are just **two choices**:

- **Skip it** → the answer is the same as without it: `K(w, i−1)`
- **Take it** → grab its price, but the bag now has less room:
  `pᵢ + K(w − wᵢ, i−1)`

You keep whichever is bigger:

```
K(w, i) = max{  K(w, i−1),           ← don't take item i
                pᵢ + K(w − wᵢ, i−1)  ← take item i
             }
```

You fill in a whole chart (rows = which items are allowed, columns = bag sizes 0…6).
The very bottom-right corner is your final answer: **9.** ✅

**Kid version:** It's like a "cheat sheet" chart. Once you've written down the
answer to a small question, you never have to figure it out again — you just
peek at your chart.

**Reality check from the lecture:**
- This shows up a *lot* in theory books (approximation algorithms, FPT algorithms, etc.).
- But the charts often get **way too big** to be practical.
- It's **rarely the best choice in real life**, and mostly works for "easy" problems.
- Knapsack is a lucky **exception** — most real problems aren't this tidy!
- Sometimes a **recursive** version (called *memoization* — "remember as you go")
  beats building the full chart, because it skips squares you never need.

---

## 2. Greedy — "Always grab the best bang-for-your-buck first" 🤑

**The idea:** Be a little greedy. Sort the treasures by **value per weight**
(the lecture calls this *efficiency*, `eᵢ = pᵢ / wᵢ`). Then go down the list and
grab each item **if it still fits**.

**Kid version:** Eat the candy that gives the most yumminess *per bite* first.

Let's compute value-per-weight for our example:

| Item | Price ÷ Weight | Efficiency |
|------|----------------|------------|
| 4    | 2 ÷ 1          | **2.0** 🥇 |
| 3    | 3 ÷ 2          | **1.5** 🥈 |
| 2    | 4 ÷ 3          | **1.33** 🥉 |
| 1    | 5 ÷ 4          | 1.25       |

Grab in that order: Item 4 (bag now 1), Item 3 (bag now 3), Item 2 (bag now 6 — full!).
Item 1 won't fit. Value = 2 + 3 + 4 = **9.** 🎉

**Why it's useful:**
- It's **super fast** (`O(n log n)` — basically just sorting).
- It's **always a real, valid answer** you could actually pack…
- …but it can sometimes be **less than perfect** (in our lucky example it hit 9,
  but greedy doesn't always win).

Because greedy gives a *real* achievable value, it's a **lower bound** — a
guaranteed "you can do *at least* this well." Think of it as a **floor.** 🔽

---

## 3. Fractional Greedy — "Pretend you can cut items in half" ✂️

Now the opposite trick: give yourself a **magic knife** that can slice treasures.
Fill the bag with the most efficient items, and when the next item doesn't fully
fit, take *just enough of a slice* to fill the bag exactly to the brim.

**Kid version:** You're allowed to snap a chocolate bar in half to perfectly top
off your candy bag.

This "dream scenario" can only ever be **as good or better** than the real puzzle
(because slicing gives you *more* freedom). So its value is a **ceiling** —
an "you can *never* beat this" score. That's an **upper bound.** 🔼

> **Why bounds matter:** Once you have a floor (greedy) and a ceiling (fractional),
> you've trapped the true answer between them. If the floor and ceiling ever
> **touch**, you're done — you've found the exact best answer!

**The proof (in plain words):** Suppose a fractional plan *isn't* "greedy-shaped."
Then there's a more-efficient item you took only partly and a less-efficient item
you took some of. You can always **shuffle weight** from the worse item to the
better one — this never lowers your value and keeps the bag legal. Repeat until
the plan *is* greedy-shaped. So greedy is the best you can do with slicing. And
since real (no-slicing) answers are just a special case of sliced answers, greedy
slicing must be ≥ the real best. That makes it a valid ceiling. ✅

The fancy word for "an easier version of a problem that gives you a bound" is a
**relaxation**. Fractional Knapsack is a *relaxation* of Knapsack.

---

## 4. Brute Force & the Search Tree — "Try literally everything" 🌳

Picture a **decision tree**. At the top you've decided nothing. Then you ask,
"Take item 1? Yes or No." That splits into two branches. Then "Take item 2?"
splits each of those again… and so on.

- Each **dot (node)** = a partial plan ("took 1, skipped 2, undecided on 3 & 4…").
- Each **line (edge)** = one yes/no decision.
- For just 4 items, this full tree already has **31 dots.**

**The problem:** tons of these branches are **junk** — either **impossible**
(bag overflows) or just **bad** (low value). Checking all of them is a waste.

---

## 5. Backtracking — "Turn around the moment a path is hopeless" ↩️

**The idea:** While walking down the tree, if your bag is **already too heavy**,
STOP. Don't explore anything below that dot — it's all doomed anyway. Chop that
whole branch off and back up.

**Kid version:** If your backpack already ripped, there's no point trying to cram
in *more* stuff. Turn back.

For our example, this trims the tree from **31 dots down to 25.** Small win, but
it adds up fast on bigger puzzles.

### Constraint Propagation — "Let logic auto-fill some choices" 🧠

Even smarter: before blindly branching, use **logic** to figure out forced moves:

- **Pure logic:** If an item *can't possibly fit* given what you've already packed,
  automatically mark it **"leave it."**
- **Objective-based logic:** If some leftover items are basically **free value**
  and they all still fit, automatically mark them **"take it"** — why wouldn't you?

This "figure out the obvious consequences" step is called **propagation**. It
prunes the tree even more before you waste time exploring.

> **A tougher example** in the lecture (bag capacity 19, six items) has the best
> answer **77**, using items {2, 3, 4, 5}. Even with backtracking + propagation,
> two annoyances remain: lots of **so-so (suboptimal) branches** still get
> explored, and the **same sub-trees get re-solved** over and over.

**Conflict Analysis:** when something goes wrong (infeasible), don't just note
"*that exact combo* failed" — figure out the **general rule** for *why* it failed,
so you can avoid a whole family of dead ends. (This idea grows up into fancy
"SAT solvers" and "CP-SAT" later in the course.)

---

## 6. Branch & Bound — "Give up if your best-case dream can't beat your record" 🏆

Backtracking throws away **impossible** branches. Branch & Bound is bolder — it
also throws away branches that are **possible but pointless.**

**The key question:** *"Could this branch ever beat the best answer I've already found?"*
If not — even in its wildest dreams — **delete it.**

**How it works:**
1. Keep your **best-so-far value** (your floor / lower bound `lb`) — get a first
   one quickly with the greedy heuristic.
2. For each branch, compute its **dream ceiling** (upper bound, e.g. via the
   fractional trick).
3. **If a branch's ceiling ≤ your current record → prune it.** It literally cannot
   help, so don't even look.

**Kid version:** You already found a candy haul worth 9. A friend says "this other
pile could get you *at most* 7." You don't even bother checking it — 7 can't beat 9.

**Some knobs you can turn ("open factors"):**
- **What order to explore?**
  - *Depth-first* → uses little memory
  - *Best-first* → chases the highest ceilings
  - *Breadth-first* → explores broadly
- You **always** need an upper bound; for a *complete* plan, the floor and ceiling
  are the same number.
- **Which item to branch on?** Nobody knows the perfect choice, so people use
  clever heuristics: *strong branching*, *pseudocost branching*, *reliability
  branching*, machine-learning-based, and more.

---

## 7. Branch & Cut — "Add smart rules to lower the ceiling faster" ✂️📉

This is Branch & Bound with a **turbo boost.** First, some vocabulary ladder:

- **Linear Program (LP):** variables can be any real number → **easy** to solve.
- **Binary Program (BP):** variables must be **0 or 1** (take it / leave it) → **hard.**
- **Integer Program (IP):** variables must be whole numbers → **hard.**
- **Mixed Integer Program (MIP):** a blend of whole-number and real variables.

Knapsack is naturally a **binary program** (take item = 1, leave item = 0).

**The usual way to get a ceiling:** *relax* the hard "must be 0 or 1" rule into
the easy "can be anything from 0 to 1" — turning the hard puzzle into an easy LP.
(For Knapsack, this LP relaxation is *exactly* the fractional-greedy trick from §3!)

**The clever new part — "cuts":** The easy LP sometimes hands you a **fractional**
answer (like "take 0.5 of item 4") that no *real* packing could ever match. So you
add a **new rule (a "cut")** that:

- ❌ **forbids** that impossible fractional answer, but
- ✅ **keeps every real** (whole-item) answer legal.

Adding cuts pulls the **ceiling down** closer to reality, so you can prune branches
much sooner. A simple example cut: "these specific items together don't fit, so you
can take **at most all-but-one** of them."

**Kid version:** The dreamy fractional plan says "take half a toy." You slam down a
rule: "**No half-toys allowed here!**" Now the dream score drops, and it's easier
to prove a branch is hopeless.

**Greedy separation** is just one automatic recipe for *finding* a good cut: walk
through the fractional solution from biggest to smallest, gather items until they'd
overflow, and if the fractions add up to "too much," add a cut. Then re-solve. If
no cut is found, accept the ceiling and go back to branching.

---

## 8. Metaheuristics — "Smart guessing for when the puzzle is a monster" 🎲

Sometimes the puzzle is just **too big** or **too nasty** for the exact methods
above to finish in your lifetime. So we use **metaheuristics**: clever strategies
that hunt for a *really good* answer without promising it's *the perfect* one.
(They're also handy for quickly finding that first "floor" value to help pruning.)

There are three big families:

### a) Constructive heuristics — "Build a guess, quickly" 🧩
Start with an empty bag and **grow** a solution step by step (often greedily).
You can sprinkle in **randomness** (so different runs try different things) and
**repeat** it many times, keeping the best. Fast — there's a trade-off between
*trying more attempts* and *each attempt being good.*

### b) Local search — "Take your answer and keep tweaking it" 🔧
Start with some solution `S`. Look at its **neighbors** (solutions that are one
small change away — e.g. swap one item). Move to a better neighbor. Repeat.

**Kid version:** You built a LEGO tower. You keep swapping one brick at a time to
make it a little taller each round.

- **The big danger — local optima:** you might climb a *small hill* and get stuck,
  thinking you're at the top, while a *taller mountain* sits nearby. 🏔️
- **Escape trick — Simulated Annealing:** occasionally allow a step *downhill* on
  purpose, so you can wander off your little hill and find a bigger one.
- Other flavors: *2-OPT*, *Large Neighborhood Search (LNS)*, *Limited Discrepancy
  Search*, and more.

**Exploration vs. Exploitation** ⚖️ — the eternal balancing act:
- **Exploration** = wandering widely to scout new areas of the map.
- **Exploitation** = polishing what you've got to squeeze out the best nearby answer.
- **Good strategy:** start **explorative** (roam broadly), then gradually
  **intensify** (focus and polish).

### c) Population-based — "Keep a whole team of answers and breed the best" 👨‍👩‍👧‍👦
Instead of nursing a single solution, keep a **whole population** of them. Each
round (a *generation*), **mix and combine** solutions to make a new batch, favor
the good ones, and sprinkle in diversity so you don't all become clones.

**Kid version:** It's like breeding the fastest race-horses: keep the best, mix
their traits, and each generation gets a little better.

Examples: **Genetic algorithms**, **memetic algorithms**, **particle swarms.**

---

## 🧠 The 9 Key Ideas to Remember

1. **Tree search** — think of solutions as a tree of yes/no decisions.
2. **Relaxation** — solve an easier version to get a bound (ceiling).
3. **Constraint propagation** — use logic to auto-decide the obvious moves.
4. **Backtracking** — cut off branches that **can't hold any valid** answer.
5. **Branch & Bound** — cut off branches that **can't hold a *better*** answer.
6. **Heuristic starting answers** are worthwhile → they give a floor for better pruning.
7. **Strengthening bounds** (Branch & Cut) is worthwhile → cuts lower the ceiling.
8. **Metaheuristics** are often the **best in practice** because they *scale* to huge problems.
9. Metaheuristics can still **team up** with exact methods (more on that later).

---

### 🎯 The one-picture takeaway

Every method here is just a smarter way to search the giant tree of "take it / leave it"
choices:

- **Greedy** grabs a quick *floor* 🔽
- **Fractional relaxation** gives a *ceiling* 🔼
- **Backtracking** cuts *impossible* branches
- **Branch & Bound** cuts *pointless* branches
- **Branch & Cut** shrinks the ceiling to cut *even more*
- **Metaheuristics** cleverly *guess* when the tree is too enormous to fully search

Trap the true answer between the floor and the ceiling, squeeze them together,
and you've solved the Knapsack. 🎒✨