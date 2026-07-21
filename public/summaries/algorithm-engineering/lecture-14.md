# Lecture 14 — Super Simple Version
### "From Model to Decision: The Analytics Lifecycle and Decisions Over Time"

---

## The one big idea (read this first)

Imagine you're really, really good at building the perfect LEGO castle. That's cool!
But building the castle is **only a tiny part** of the job.

The real job is:
1. Figuring out *which* castle people actually need,
2. Getting the right LEGO bricks,
3. Making sure people actually *use* the castle,
4. And keeping it standing when the wind blows and things change.

This lecture says: **the fancy math (the "model") is the easy, small part.** The hard part is everything *around* it — and the hard part is where most projects fail.

The lecture has **two lenses** (two ways of looking):

- **Lens 1 – The Project Lens:** How a real project runs from start to finish (7 steps).
- **Lens 2 – The Time Lens:** What to do when you have to decide *again and again*, as new surprises keep happening.

---

# PART 1 — The Project Lens
### "Your amazing math is just 1 box out of 7"

## Three kinds of questions

Think of a weather app. There are three levels of smart:

| Level | The question it answers | Example |
|-------|------------------------|---------|
| **Descriptive** | *What happened?* | "It rained yesterday." |
| **Predictive** | *What will happen?* | "It will probably rain tomorrow." |
| **Prescriptive** | *What should we DO?* | "Bring an umbrella!" |

They stack like a cake 🍰. The top layer ("what should we do?") only works if the layers underneath are solid. Fancy optimization lives on the *top* layer.

## The 7 steps of a real project

Here's a story we'll use the whole way through:

> 🚚 **The Delivery Van Problem:** A delivery company's vans keep coming home after 7 PM, so the company has to pay expensive overtime. Can we get all vans home by 6 PM?

Now watch how a real project handles this — in **7 steps**:

1. **Business Problem Framing** — *Find a problem worth money, and agree on it.*
   👉 "Vans come home late and overtime costs us a fortune. Goal: home by 6 PM."

2. **Analytics Problem Framing** — *Turn the fuzzy wish into a clear, measurable goal.*
   👉 Not "make delivery better" (too vague!) but "plan van routes so every van is back by 6 PM with no late deliveries."

3. **Data** — *Get the facts, and make sure they're clean and trustworthy.*
   👉 Addresses, delivery times, how much each van can carry. Fix the messy 3% of addresses that are wrong.

4. **Methodology** — *Pick the right tool for the job.*
   👉 With 300 stops every night, use a fast "good enough" method, not a slow "perfect" one.

5. **Model Building** — *Actually build the math.* ⭐
   👉 This is the LEGO castle! And surprise: **this is only about 10–15% of the whole project's time.**

6. **Deployment** — *Get real people to actually use it.*
   👉 Ship it so drivers get routes by 5 AM, dispatchers can tweak a stop, and there's a backup plan if it breaks.

7. **Lifecycle Management** — *Keep it working long after everyone moves on.*
   👉 Watch a dashboard, retrain new staff, and check the savings are still real six months later.

### 🎯 The punchline
The cool math is **step 5**, and it's a *small slice* of the pie. Most projects don't fail because the math was wrong. They fail in the *other* steps.

## It's a cogwheel, not a straight line ⚙️

The 7 steps don't go neatly 1 → 2 → 3. They loop backwards!

> **Example:** You're on step 3 (Data) and discover there's no reliable info on delivery time windows. Oops — now you have to go *back* to step 2 and change the goal from "no late deliveries" to "as few late deliveries as possible."

A surprise late in the project can undo a decision made early. Like building your LEGO castle and realizing you need a bigger base — you have to take some of it apart.

## Where projects actually DIE 💀

Mostly at **step 6 (Deployment)**. And usually not for technical reasons — for *people* reasons:

- 🙅 A perfect plan that the workers **don't trust** = a plan nobody uses. (Dispatchers ignore "weird" routes.)
- 💥 **No backup** for when the computer fails one night = one bad night kills the whole project.
- 😐 **No boss championing it** = the moment it annoys someone, it gets dropped.

> Deployment isn't "putting software on a computer." It's **changing how people do their jobs** — and people don't love change.

## The 3 questions that predict success

There's a checklist of 20 risks, but **3 matter most**. Ask the boss these in 30 minutes:

1. **Decision Scope:** Can you say the decision in *one sentence*? (Fuzzy = doomed.)
2. **Value:** What's it worth per *year*, in real dollars/hours? ("Being efficient" is not a value. "Saving €120,000" is.)
3. **Process Maturity:** Has this company ever successfully used a system like this before?

A red flag on any of these should change the whole plan — not be swept under the rug.

## Real-world proof
- 📦 **UPS ORION** (delivery routing): took **~3 years** of testing and *hundreds* of staff before it paid off. The math was the easy bit.
- 🖨️ **HP** forecasting for 18,000+ products: the model *helps* humans, it doesn't replace them.

---

# PART 2 — The Time Lens
### "A plan breaks. You need a policy."

## The nurse story 🏥

> **Ward 5-West** is a 30-bed hospital ward. We built a super-smart scheduler that makes a *perfect* 2-week nurse roster in under an hour. We were proud!
>
> One month later, the hospital calls, furious: **the nurses hate it and want to go back to doing it by hand.** 😤

Why?! The math was perfect. The data was honest. What went wrong?

## A plan vs. a policy (THE key idea) 🔑

Here's the heart of Part 2. Imagine planning a road trip:

- **A PLAN** is deciding your *entire route in advance* — every turn, before you leave the driveway.
  - Problem: the moment there's a traffic jam or a closed road, your plan is useless.
- **A POLICY** is a *rule for what to do in any situation*: "If there's traffic, take the next exit."
  - This *never* breaks, because it reacts to whatever actually happens.

The nurse roster was a **plan**. But real life keeps throwing surprises:

> A nurse calls in sick 🤒 → the whole perfect 2-week plan shatters → the day becomes a scramble.

No fixed plan survives two weeks of surprises, because **the surprises arrive *after* you've committed to the plan.**

### Two "fixes" that didn't work
- **Plan only 2 days ahead?** ❌ Nurses can't run their lives (childcare, second jobs) on 2 days' notice.
- **Re-do the whole plan every time something changes?** ❌ A tiny €40 saving might move a nurse off the Thursday she arranged her whole week around. Chaos.

So the answer isn't a *better plan*. It's switching from making **plans** to making a **policy**.

## How to set up the problem: 3 questions first

Before touching any math, answer these:

1. **What are the decisions, and who owns them?**
   👉 Two decisions: *what roster we publish*, and *what we do when a shift comes up short* (call a backup nurse? offer overtime? call an agency?). Owner: **the charge nurse** — and she *must be in the room* while we build it. (A tool built without its owner gets ignored — and it *should*.)

2. **How do we measure "good"?**
   👉 Not one number! Six things that fight each other: 💰 cost, 🛡️ safe coverage, ⚖️ fairness, 😊 honoring nurse requests, 🧷 stability (does the roster survive the week?), and 😱 worst-case safety.

3. **What's uncertain?**
   👉 Sick calls, new patients arriving, how sick they are, whether a nurse *accepts* the overtime you offer. ("Offering is not getting!")

## The "wind tunnel" 🌬️ (the simulator)

You can't test schedules on *real* nurses and real sick patients — mistakes hurt people. So you build a **simulator**: a pretend hospital.

> Think of how engineers test a toy car design in a **wind tunnel** instead of crashing 100 real cars. The simulator doesn't predict *who* gets sick next Tuesday — it shows how your *rule* behaves across *thousands* of pretend months.

⚠️ **Careful:** the pretend months must be realistic. Flu seasons come in *waves* (sick days cluster together!), so you can't just scatter sick days randomly, or you'll hide the truly bad weeks.

## Judge by the average of MANY tries (Monte Carlo) 🎲

One pretend month is just an anecdote — like judging a dice as "lucky" after one roll.

**Monte Carlo** = roll the dice *thousands* of times and take the average. Run your policy across *many* pretend futures and average the cost. That's a fair score.

(Fun fact: to make your score twice as trustworthy, you need *4×* as many pretend runs.)

## Watch out for the tail! 🐉

The number of patients isn't one fixed number — it's a *range*, with a scary "tail" where several bad things happen at once.

> If you staff for a **normal** night, you look super efficient... until one crazy-busy night lands and you're dangerously short-staffed. Being short-staffed hurts *way* more than being slightly over-staffed.

So don't score your policy on the *average* night. Score it on the **worst 5% of nights** (called **CVaR95**). Plan for the dragon, not the puppy.

## Don't hide the trade-offs 📊

Cost, safety, and fairness pull against each other. Don't secretly mash them into one number — that *hides* what you're giving up.

Instead, **show the boss a picture**: "Here's the cheap-but-risky option, here's the safe-but-costly option, and here's the sweet spot in the middle." Let the *owner* pick the point. 👉

## Respect the humans' method 🙌

Remember, the nurses' by-hand routine actually worked *better* in real life! So instead of throwing it away, we make it the **baseline to beat**.

We ask the charge nurse her rule and write it down as a **ladder** — when a shift is short, climb the steps until it's filled:
1. Pull a spare "float" nurse 🧑‍⚕️
2. If not enough, offer overtime ⏰
3. If not enough, call an agency 📞
4. If nothing works, accept being short and let the simulator show the cost 📉

We trust her *structure*, then let the simulator fine-tune the exact cutoffs. Often her rule was right — the cutoff should've just been one step higher. **Anything fancier we build must beat *this* real rule — not a strawman.**

## Four families of "policies" (four ways to decide)

Warren Powell says every decision-rule fits into one of **4 boxes**:

| Family | In plain words | Nurse example |
|--------|---------------|---------------|
| **PFA** (rule) | Just follow a simple rule. | The escalation ladder above. |
| **CFA** (fudged goal) | Solve the math, but tweak it to match real costs. | Re-solve the roster with tuned "safety padding." |
| **VFA** (know a state's worth) | Learn what a *situation* is worth later on. | "Going into the weekend with spare nurses is worth a lot." |
| **DLA** (look ahead) | Simulate the future before deciding. | "Use overtime now, or save the spare nurse for tomorrow's likely gap?" |

> ⚠️ Fancier is **not** always better! A super-complex method that's too slow to run during the morning huddle, or too confusing for the charge nurse to trust, is *useless*.

## The optimizer over optimizers 🪆

Here's the mind-bending final idea. It's like nested Russian dolls:

- The **innermost** doll: each single decision is a little optimization ("what's cheapest right now?").
- The **middle** doll: tune the *settings* (the thresholds θ) of your chosen rule.
- The **outermost** doll: pick *which of the 4 families* is best.

And you judge *all* of it by running it in the simulator. You're basically **optimizing your optimizer.** 🤯

## The last, best tip 🚶
> Sometimes the cheapest fix of all is to **just walk around the ward and talk to people.** A simple "nurses can swap their own shifts" rule might dissolve *half* the problems before any computer runs.

Also: use AI to *help build* the policy (draft rules, explain a choice) — but when it's actually time to decide, **use the solver, not the chatbot.**

---

# 🎁 The whole lecture in 3 sentences

1. **The clever math is the small, easy part** — real projects live or die in the framing before it and the deployment/upkeep after it (that's the 7-step Project Lens).
2. **When decisions repeat and surprises keep coming, a fixed *plan* will break — you need a *policy*** (a rule that reacts to whatever happens), which you test safely in a *simulator* and judge over many pretend futures (that's the Time Lens).
3. **Both lenses agree:** the hard part was never solving the puzzle — it's *framing* it right and *sustaining* it afterward. 🏰
