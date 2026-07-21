# Lecture 13 — Made Super Simple

### "Beyond the Single Objective: Trade-offs and Uncertainty"

---

## The big idea in one sentence

Normally we solve problems like *"make this ONE number as small as possible, and I know all the facts."* But real life is messier: usually you care about **several things at once**, and you **don't know exactly what will happen**. This lecture is about handling those two messy parts.

Think of it like planning a birthday party:

- You don't just want it *cheap*. You also want it *fun* and *not stressful*. That's **many goals at once**.
- And you don't know how many friends will actually show up. That's **uncertainty**.

The lecture has two halves that match these two problems.

---

# Part 1: When you want MANY things at once

### The problem: you can't have everything

Imagine you're picking ice cream. You want it to be:

- **cheap** 💰
- **tasty** 😋
- **healthy** 🥗

The problem? Making it healthier often makes it less tasty. Making it tastier often makes it more expensive. Improving one thing makes another thing worse. This is called a **trade-off**.

So the tricky question becomes: *"Which choice is actually the BEST?"* — and often there's no single right answer.

### "Dominance": the easy way to throw out bad choices

Here's a simple rule. Imagine three lunchboxes:

| Lunchbox | Price | Yumminess (lower = worse) |
|----------|-------|---------|
| A | 3 € | very yummy |
| B | 4 € | very yummy |
| C | 5 € | not yummy |

Lunchbox **C** is worse than A in *both* ways: it costs more AND tastes worse. So there's no reason to ever pick C. We say C is **dominated** — it loses on everything. Toss it out! 🗑️

But comparing **A vs B** is harder: A is cheaper, B might last longer, etc. Neither is clearly worse. These "nobody-clearly-beats-them" choices are the **good survivors**. The whole collection of survivors is called the **Pareto front**.

> 👉 **Key idea:** A survivor isn't automatically *great* — it just means nothing else beats it on every single point. (A boring-but-not-beaten choice is still boring!)

### Two different questions — keep them separate!

The lecture says: don't mix up these two questions.

1. **How do we DECIDE which is better?** (the rules for comparing)
2. **How do we FIND good options?** (the searching)

They're separate jobs, like *deciding what you want for dinner* vs. *actually cooking it*.

---

## Way 1: Tell the computer your preferences

If you *can* explain what "better" means, just write it down. Three ways to do that:

### 🥄 The "weighted sum" (mixing recipe)

Give each goal a number that says how much you care about it, then add them up.

*Example:* "1 point of tardiness costs me 1, but 1 changeover costs me 5, and 1 changed job costs me 0.2." Add it all into one score. Lowest score wins.

**Watch out!** The weights act like **exchange rates** (like turning euros into dollars). If you say "one changeover = five minutes late," you've secretly decided something big. Who said that trade was fair? 🤔 Also, if one goal is measured in *minutes* and another in *counts*, the numbers can trick you.

### 🪜 The "lexicographic" way (strict priority ladder)

Some things matter *infinitely* more than others. Do the most important one first, then the next.

*Example:* A parent packing a bag for a baby.
1. **First:** never forget the diapers. (Non-negotiable!)
2. **Only after that's handled:** try to also pack light.

You never trade away a diaper to save weight. The top rung of the ladder always wins. (You can allow a *tiny* bit of slack on the top goal if you want.)

### 🚧 The "ε-constraint" way (set hard limits)

Instead of weights, set rules like fences: *"do the best you can, BUT stay inside these limits."*

*Example:* "Make the trip as cheap as possible, **but** it must take **less than 2 hours** and have **at most 1 transfer**." You optimize one thing while the others just have to stay under a line.

---

## Way 2: When you *can't* decide — show all the good options

Sometimes nobody can say the "right" trade-off in advance. That's normal! People often only figure out what they want **after seeing the choices**.

*Example:* Shopping for shoes online. You don't know your perfect mix of price/comfort/style until you *see a few* side by side. Then you go "ooh, that one."

So the computer's job becomes: **produce a nice menu of good options**, especially:

- the **extremes** (cheapest, or most comfy)
- some **balanced** middle choices
- the **"knee"** — the sweet spot where you get a lot of one thing without giving up much of another. Like a phone that's *way* cheaper for only *slightly* less battery. 📱

Then a **human picks** from the menu.

**How the computer builds the menu:** it just runs the normal solver over and over with slightly different settings, and keeps a scrapbook (an **archive**) of all the "survivor" options, throwing out any that get beaten. One famous automatic version of this is called **NSGA-II** — it's like breeding better and better options over generations, while making sure they stay *spread out* and don't all bunch up in one corner.

---

# Part 2: When you DON'T know the future

Part 1 was "what do we *want*?" Part 2 is "what *world* will we face?"

### The sandwich shop story 🥪 (the "newsvendor")

A bakery must decide at **5 a.m.** how many sandwiches to make. But it only finds out how many customers want them at **lunchtime**. Decision now, truth later!

Here's the twist that makes it interesting:

- Make **too few** → you miss sales → you lose the **profit** (6 € each).
- Make **too many** → leftovers → you lose the **cost** (3 € each).

Being *short* hurts **more** than being *over* (6 vs 3). So even though the average demand is 100, you should actually prepare a bit **more** than 100 (about 109) — because running out is the bigger pain. Neat, right?

> 👉 **Lesson:** Just guessing the *average* future isn't enough. The **costs of being wrong** in each direction change your best choice.

### The trap of "just predict the average"

A common mistake: first predict *one* number for the future, then plan as if it's certain. But a single "best guess" throws away the most useful info — **how uncertain** things are. A perfect average can still lead to a bad decision.

### Ask 3 questions before anything else 🔍

1. **What is uncertain?** (the future? a broken sensor? a fuzzy setting?)
2. **What do we know about it?** (just a guess? a range? lots of past examples? real probabilities?)
3. **When do we find out — and can we still change our plan afterward?**

That third one matters a lot. Sometimes you decide *then* learn (sandwiches). Sometimes you can **watch and react** as you go — like a **GPS re-routing you** when there's traffic. Re-planning as you learn is often better than one giant nervous over-cautious plan. (But re-planning *too* much makes everyone dizzy and no one trusts the plan.)

---

## Two main ways to handle uncertainty

### 🛡️ Robust optimization: "prepare for the worst"

Pick a set of **possible worlds** and make a plan that survives **every single one**.

*Example:* Packing for a trip and bringing an umbrella, sunscreen, AND a jacket — because you're ready for *any* weather.

**The catch:** If you protect against *everything at once* (rain AND snow AND heatwave all at the same moment), you over-pack and it's exhausting. That "everything goes wrong together" world almost never happens — that's the **box** being too pessimistic.

**A smarter version (the "budget" idea):** Think of coin flips. 🪙 It's basically impossible to flip **all heads** 100 times in a row. Usually you land *near* half-and-half. So instead of guarding against the impossible all-heads disaster, you guard against a *realistic* amount of bad luck. This uses a famous math fact (the **Central Limit Theorem**): lots of little random things tend to *cancel out*, so the total wobble is smaller than you'd fear. This gives protection that's strong **but not silly**.

> 👉 **The price of robustness:** the safer you play, the fewer options you have and the worse your "everything's fine" outcome gets. Safety costs something. It's a *dial*, not an on/off switch.

### 🎲 Stochastic optimization: "weigh the futures by how likely they are"

Instead of only fearing the worst, use the **odds**. Give each possible future a probability and aim for the best result *on average*.

*Example — scenarios:*

| Weather | Chance | Lemonade to make |
|---------|--------|------|
| Cold day | 20% | few |
| Normal | 50% | some |
| Hot day | 30% | lots |

You pick **one** amount to prepare, and it's judged across *all* these weighted futures.

### The clever bonus: "recourse" (decide in stages) ⏳

The best trick: don't decide everything at once. Decide what you **must** now, and leave the rest for **after** you learn more.

*Example:* A pizza restaurant.
1. **Now:** hire enough staff for the evening (you must commit early).
2. **Later:** once you see how busy it is, *then* decide whether to call in extra help or order more dough.

The early decision is shared by all futures; the later reactions can **adapt** to what actually happens. This is called **two-stage** planning.

> ⚠️ **One golden rule — no cheating with a crystal ball!** ("Nonanticipativity.") Your *now* decision can't secretly peek at tomorrow's answer. You must decide the "now" part **the same way** no matter which future comes — because when you decide it, you genuinely don't know yet.

### When we can't do the math perfectly: use examples

Often you can't calculate the exact "average future." So you just grab a big **pile of sample futures** and average over those instead. More samples = steadier, more trustworthy answer (but a bigger, slower problem). And always **test your plan on FRESH examples** it hasn't seen — like studying with practice questions but checking yourself on a *new* quiz. Doing well on the ones you trained on doesn't prove you'll do well in real life.

> ⚠️ **"Average" is not the same as "safe."** Aiming for the best average might quietly accept a rare disaster (because it's rare). If a bad outcome would be *catastrophic*, you need extra rules to limit the chance of the really bad tail — not just the average.

---

## The whole lecture on one sticky note 📝

You started with: *"minimize one number, and I know everything."* Real life breaks both halves:

**When you want many things at once:**
- If you *can* say what "better" means → write it in (weights, priority ladder, or hard limits).
- If you *can't* → show the menu of good survivor options (the Pareto front) and let a human choose.

**When the future is uncertain:**
- First **diagnose**: what's uncertain, what do you know, and when do you find out?
- Then pick your style: **robust** (survive the worst plausible world), **stochastic** (weigh futures by their odds), or just **re-plan as you go**.
- And always **test on fresh scenarios** before trusting it.

That's it — Lecture 13 in a nutshell. 🥜
