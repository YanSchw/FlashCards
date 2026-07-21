# Lecture 02 · CPU Architecture 1

> The big idea: two programs with the same Big-O can differ **enormously** in
> speed. Understanding the CPU is how you find — or hide — that constant factor.

## The pipeline

Modern CPUs run instructions on an **assembly line**: fetch, decode, execute and
more all happen at once on different instructions, so no stage sits idle. The
single goal behind every trick below is the same — **avoid waiting**.

- **Superscalar** — several independent instructions run at the same time.
- **Out-of-order** — a ready instruction can jump the queue; results still retire in order.
- **Speculation** — the CPU guesses what comes next and starts early, discarding wrong guesses.

Hundreds of instructions can be *in flight* at once, yet the output always matches
your written program.

## Latency vs throughput

| Term         | Question it answers                    |
| ------------ | -------------------------------------- |
| `latency`    | How long does **one** instruction take? |
| `throughput` | How **many** finish per unit of time?   |

The pipeline does **not** make a single instruction finish faster — it improves
throughput.

## Branch prediction

A **branch** is a decision point. The CPU reaches it before it knows the answer,
so it **predicts** and speculatively runs ahead:

- Right guess → smooth flow.
- Wrong guess (**misprediction**) → throw away the work and stall.

Predictable branches are basically free; random, coin-flip branches in a hot loop
are expensive. The fix for a truly unpredictable branch is **branchless code** —
but only when both paths are cheap.

## Memory & caches

RAM is *slow* (hundreds of cycles). **Caches** are small, fast memory next to the
CPU. Closer = faster but smaller (L1 → L2 → L3 → RAM). Two ideas drive everything:

1. **Spatial locality** — you'll soon use data next to what you just used.
2. **Temporal locality** — you'll soon reuse the same data.

So the CPU fetches a whole **cache line** at a time, and a **prefetcher** streams
predictable patterns ahead of you.

## Takeaways

- Predictable, sequential access is fast; scattered access is slow.
- Packed structures (arrays) beat pointer-chasing ones (linked lists).
- **Correctness → algorithm → data layout → micro-tuning.** And always *measure first.*
