# Lecture 9: SAT — Explained Super Simply 🧩

*(SAT solvers, but told like a story a kid could follow)*

---

## 1. What is SAT? The "make everyone happy" puzzle

Imagine you're planning a birthday party and you have a bunch of **rules** from your friends:

- "I'll come if **Anna OR Ben** comes." (at least one of them)
- "I'll come if **Ben OR Chloe (but NOT Anna)** comes."
- "I'll come if **Anna is NOT there**."

Each rule is a little wish-list where **at least one thing has to be true**. In SAT-speak:

- A **variable** = a yes/no switch (Anna comes? on/off). We call them `x₁, x₂, ...`
- A **literal** = a switch or its opposite (`Anna` or `not-Anna`).
- A **clause** = one rule = "at least one of these must be true" (the OR list).
- The **whole formula** = ALL rules must hold at the same time (they're joined by AND).

> **The SAT question:** Can I flip the switches (each person comes or doesn't) so that **every single rule is happy at once**?
>
> If yes → the puzzle is **satisfiable (SAT)**. If it's impossible no matter what → **unsatisfiable (UNSAT)**.

That's it. SAT = "pick at least one happy thing from every rule."

Fun fact from the lecture: SAT was the **very first problem ever proven to be "NP-complete"** — basically the granddaddy of all "really hard to solve" problems. If you had a fast trick for SAT, you'd have a fast trick for a huge family of hard problems.

---

## 2. The first solver: DPLL — smart guessing with cleanup

How do we solve it? The oldest clever method is called **DPLL**. Think of it like solving a Sudoku:

You **guess**, you **fill in everything that's forced**, and if you hit a wall, you **rub it out and try the other way**.

DPLL has three moves:

### 🧹 Move 1: Unit Propagation ("forced moves")
If a rule has shrunk down to **only one option left**, you have no choice — you *must* pick it.

*Example:* A rule says "Anna OR Ben." You already decided Ben is NOT coming. Now the rule screams: **Anna MUST come!** You're forced. And forcing Anna might force someone else... so you keep going like dominoes until nothing else is forced. This chain reaction is the single most important move in the whole lecture. 🁢🁢🁢

### 🎨 Move 2: Pure Literal ("free lunch")
If a switch only ever shows up in its "on" form (never "off") across all the rules, then just turn it **on** — it can only help, never hurt. Cross off every rule it satisfies.

*Example:* If **nobody ever says "I'll only come if Chloe stays home,"** and some people say "I'll come if Chloe comes," then just invite Chloe! No downside.

### 🌳 Move 3: Guess and Backtrack
When nothing is forced and there's no free lunch, just **pick a switch and guess** (say "Anna comes = true"). Do all the forced dominoes again. If it leads to a **contradiction** (some rule ends up with zero happy options — written `⊥`, "boom"), then you were wrong: **undo it** and try "Anna = false" instead.

This creates a **tree** of guesses. You climb down; if you hit boom, you climb back up and take the other branch.

**A tiny worked example from the slides:** the solver guesses variable 1 → dominoes → 💥 boom. Tries the opposite → dominoes → 💥 boom again. So it climbs up and tries variable 1 the other way... and eventually every branch goes boom, which *proves* the puzzle is impossible (UNSAT).

---

## 3. Making it fast: the "Trail" and "Two Watched Literals"

DPLL is correct but a naïve version is slow. Two clever engineering tricks fix that.

### 📜 The Trail — a stack of decisions
Keep one long list (a "trail") of everything you've turned true so far, **in order**. Split it into **levels**:
- **Level 0** = things that are true *forever* (forced from the very start).
- Each new **guess** starts a new level, followed by all the dominoes it triggered.

To undo a guess, you just **chop off the top level** of the list. Cheap and easy — like tearing the last page off a notepad.

### 👀 Two Watched Literals — the lazy watchman trick
Here's the genius part. To do unit propagation you need to notice *"uh oh, this rule is down to its last option."* Checking every rule every time would be slow.

Instead, in each rule you only **keep an eye on 2 options** (two "watched" literals). The rule is: **always watch two options that aren't dead yet.**

- As long as you can watch two live options, that rule *can't* be a forced move yet — so you can happily **ignore it.**
- Only when one of your two watched options dies do you go looking for a replacement to watch. If you can't find one → the rule just became a forced move (or a boom).

**Why it's magical:** the lecture asks *"when we backtrack (undo), what do we have to fix about the watched literals?"* and the answer is:

> **Nothing! 🎉** Doing nothing is the cheapest thing possible.

Because undoing a guess can only turn switches **back from dead to alive** — it never kills a live one. So your "watch two live ones" rule stays true automatically. Free.

*Everyday picture:* You're a lifeguard watching a pool. You only need to keep **two swimmers** in view to know the pool's "active." People leaving the pool never creates an emergency, so you never have to react to that. Only when a swimmer you're watching leaves do you glance for another one. Way less work than staring at all 50 swimmers.

---

## 4. DPLL's big flaw: it never learns 😩

Here's the problem. Imagine one corner of your party rules is **secretly impossible** — like a tiny knot of friends whose demands can never all be met. But that knot is buried deep, not obvious up front.

DPLL will wander into that knot, hit boom, back out... and then later **wander right back into the exact same knot and hit the exact same boom.** Over and over. It has **no memory of its mistakes.**

The lecture notes this can make DPLL take *insanely* long — and that's true no matter how cleverly you choose your guesses. We need a solver that **remembers.**

---

## 5. Learning from mistakes: Resolution

The trick for "remembering" is a logic tool called **resolution**. It's how you combine two rules to make a brand-new true rule.

**The idea:** if one rule says "**A or X**" and another says "**B or not-X**," then no matter whether X is on or off, you can prove "**A or B**" must be true. You've *cancelled out X* and learned something new.

*Kid version:* 
- Rule 1: "We're having **pizza OR it's raining**." 
- Rule 2: "We're having **salad OR it's NOT raining**." 
- Combine them (rain cancels out): "**We're having pizza OR salad.**" — a new fact you just *discovered* by mashing two rules together. 🍕🥗

If you keep resolving and eventually reach the **empty rule** (a rule with zero options = "this is flat-out impossible"), congratulations: you've **proven the whole puzzle is UNSAT.**

---

## 6. The modern champion: CDCL 🏆

Modern SAT solvers use **CDCL = Conflict-Driven Clause Learning.** It's DPLL... but it *learns from every boom.* This is the heart of the lecture.

Here's the loop, in plain words:

1. **Guess** a switch, then run all the forced dominoes (unit propagation), building up the trail.
2. **Every forced move remembers *why*** — which rule forced it (its "reason").
3. **Boom!** You hit a contradiction.
4. Now you **trace backwards** through the "reasons" using resolution, asking *"what actually caused this crash?"* You mash the guilty rules together until you've distilled a **brand-new learned rule** that captures the real reason for the disaster.
5. **Add that learned rule to your rulebook forever.** Now you can *never* make that same mistake again — the domino effect will warn you early next time.
6. **Backjump:** instead of undoing just one step, **leap way back** to the earliest point where your new knowledge would have helped, and continue from there.

**The goal, two ways it can end:**
- Fill in every switch with no boom → 🎉 **you found an answer (SAT)!**
- Learn the "empty rule" → ❌ **you proved it's impossible (UNSAT).**

### The "aha" concept: the First UIP
When you trace back a crash, you stop at a special spot called the **First Unique Implication Point (UIP)** — it's the single "bottleneck" moment in the current level that all the trouble funnels through. Learning the rule *right there* gives the tightest, most useful lesson. (You don't need the math — just remember: **learn from the closest single choke-point that caused the crash.**)

### Why CDCL is so much better
- It **actually learns** from failures (unlike DPLL).
- The lessons are **globally useful** — good everywhere in the search, not just locally.
- **Backjumping can skip whole useless branches** at once. If you guessed something that had *nothing* to do with the crash, CDCL realizes it and jumps clean over it instead of plodding back one step at a time.
- It always **finishes** (terminates), because every crash teaches a genuinely *new* lesson, and there are only so many possible lessons to learn.

*Big-picture analogy:* DPLL is a kid doing a maze who keeps hitting the same dead end. CDCL is a kid who, every time they hit a dead end, **draws an X on the map** so they never go there again — and even better, realizes *"wait, the wrong turn was 5 steps back"* and jumps straight there.

---

## 7. The "secret sauce" tweaks that make real solvers fast

Real-world SAT solvers add a bunch of engineering tricks on top. Here's each one in a sentence:

- **VSIDS (variable picking):** Prefer to guess switches that have been **causing lots of recent crashes** — those are the "spicy," important ones. It's like a firefighter rushing to wherever the fires keep flaring up. 🔥

- **Restarts:** Every so often, **throw away all your guesses and start the search fresh** — but **keep everything you learned.** Sounds silly, but it stops you getting stuck down a bad rabbit hole. (Like restarting a video game level but keeping your XP and unlocked items.) 🎮

- **Phase Saving:** When you undo a switch, **remember which way it was set** and try that same way next time. Saves you re-discovering good settings for parts of the puzzle you already figured out.

- **Clause Deletion (LBD / "glue score"):** You learn *so many* rules that your rulebook gets bloated and slow. So you **throw away the least useful ones.** The best quality measure is the **glue score (LBD)**: rules touching **fewer different guess-levels are stickier and more valuable** — keep those, toss the rest. Modern solvers sort rules into "keep forever," "keep for now," and "toss aggressively" tiers. 🗑️

- **Conflict Clause Minimization:** After learning a rule, **trim off any redundant parts** so it's short and punchy (shorter rules = faster and more powerful).

- **Pre-/In-processing:** Clean up and simplify the whole rulebook **before and during** solving — merging duplicate rules, deleting useless ones, removing variables. The single most useful one is **Bounded Variable Elimination (BVE)**: get rid of a switch entirely by folding its rules together, as long as it doesn't blow up the rulebook. This part is described as *"not deep theory, just hard engineering"* — lots of fiddly "when and how" decisions.

- **SAT/UNSAT Stages:** Finding an answer and *proving there's no answer* need different styles, so the solver **switches its personality** depending on which it currently thinks it's dealing with.

- **Local Search (probSAT / YalSAT):** A totally different, "wander around and fix things" style: start with a guess, find an unhappy rule, and **flip a switch to make things better** (picking flips that break the fewest other rules). Modern solvers run this on the side to suggest good settings to the main engine.

---

## 8. The one-paragraph takeaway 📌

**SAT** asks: *can I set a bunch of true/false switches so every rule is satisfied?* The old solver **DPLL** guesses, cascades forced moves (**unit propagation**), and backtracks — but it's dumb because it **forgets its mistakes**. The modern solver **CDCL** fixes this by **learning a new rule from every crash** (via **resolution**), then **backjumping** far back so it never repeats that mistake. Speed comes from clever engineering: the **trail** with **two watched literals** (so undoing costs *nothing*), smart guessing (**VSIDS**), **restarts**, **phase saving**, throwing out junk rules by **glue score**, and lots of pre-processing. Most of the solver's time is spent on **unit propagation**, which is why it's so heavily optimized.

> **For the exam, the lecture says to focus on:** CDCL, the trail & decision levels, conflict resolution (learning + backjumping), and the *high-level ideas* behind the tricks (why we pick variables the way we do, that pre-/in-processing exists, etc.). You don't need to memorize every optimization's guts. ✅
