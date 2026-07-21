# Lecture 02: Ray Tracing Fundamentals — The Easy Version

## The One Big Idea

In real life, light shoots out of the sun, bounces off everything, and *some* of it happens to land in your eye. That's billions of light rays, and most of them never reach you — so copying nature directly would be a huge waste.

**Ray tracing does it backwards.** Instead of starting at the light, it starts at *your eye* and asks: "If I shoot a beam from my eye through this one dot on the screen, what's the first thing it hits?" Whatever it hits decides the color of that dot.

> 🧒 **Think of a screen door.** Poke a stick straight through one of the tiny holes. Whatever the stick touches on the other side — that's the color for that hole. Do this for every hole, and you've drawn the whole picture. Each "hole" is a **pixel**.

The lecture lists **3 ways to make an image**:

- **From the light** → that's *nature* (too expensive to copy).
- **From the surfaces** → that's *rasterization* (like Bob Ross painting object by object — how video games traditionally work).
- **From the eye** → that's *ray tracing* (our topic).

---

## The 4 Steps of Ray Tracing (the recap)

1. **Primary rays** — Shoot one ray from the eye through each pixel and find the *closest* object it hits. (Closest matters — if a wall is behind a cup, you should see the cup, not the wall.)

2. **Shadow rays** — From that hit point, shoot a ray *toward the light*. If something blocks the way → the point is in shadow. If the path is clear → it's lit.
   > 🧒 It's like standing somewhere and asking "can I see the sun, or is a tree in the way?" If a tree blocks it, you're in the shade.

3. **Shading** — Now pick the actual color, based on: which object it is, which way its surface faces, whether it's lit or shadowed, and what it's *made of* (dull like chalk, shiny like a mirror, glossy like an apple).

4. **Secondary rays** — If you hit a mirror or glass, shoot *new* rays (a bounced one and a bent-through one) and repeat the whole process. This "do it again on the new ray" is called **recursion**.

---

## Graphics Cheats a Little (Assumptions)

The real world is insanely complicated, so ray tracing makes simplifying assumptions:

- Lights are treated as tiny **points** (reality: the sun is a big glowing ball).
- **Empty space is perfectly clear** (reality: fog, haze, and dusty air scatter light).
- **Simple material recipes** instead of real physics.
- **Pinhole camera** — a perfect tiny hole (reality: real lenses cause blur, distortion, etc.).
- Colors are just **Red-Green-Blue**, not the full rainbow spectrum.

These shortcuts are why computer images can look *almost* real but not quite.

---

## The Math Toolbox

**A ray is just "start + walk."** Written as **r(t) = o + t·d**: start at point **o** (your eye), walk in direction **d**, and **t** tells you how far.

- t > 0 → in front of you ✅
- t < 0 → behind you (ignore it)

> 🧒 Like giving directions: "Start at the door (o), walk toward the kitchen (d). After 3 steps (t=3) you're at the fridge."

**Dot product** (`a ∘ b`) → measures how much two arrows point the *same way*. If both arrows have length 1, the dot product is just the cosine of the angle between them. Handy for "how directly is this surface facing the light?"

**Cross product** (`a × b`) → gives you a brand-new arrow that sticks out *perpendicular* to two others. This is how you find a surface's **normal** (the "which way am I facing" arrow).

---

## Finding Where a Ray Hits Shapes

This is the heart of the lecture — "does my beam hit this shape, and where?"

### 🔵 Sphere
Plug the ray into the sphere's equation and you get a **quadratic equation** (`At² + Bt + C = 0`). The little piece under the square root (the **discriminant**) tells you everything:

- Negative → ray **misses** the ball.
- Zero → ray just **grazes** it (tangent).
- Positive → ray **goes through** (2 hits — you keep the closer one).

> 🧒 Like throwing a dart at a balloon: you either miss, barely scrape the edge, or punch through (entering one side and exiting the other).

### 📦 Axis-Aligned Box
A box is really just 6 flat walls. Find where the ray crosses each wall, then work out the **entry point (t_in)** and **exit point (t_out)**. The clever check: if `t_in > t_out` (you'd "exit" before you "enter" — impossible) **or** `t_out < 0` (the whole box is behind you), then the ray **misses**.

> 🧒 Imagine sliding a straw through a cardboard box. It pokes in on one side and out the other. If the "in" and "out" don't make sense in order, the straw actually went *past* the box, not through it.

### ▱ Plane
An infinite flat sheet. Substitute the ray into the plane's equation and solve for **t** directly. Quick and clean.

### △ Triangle
Triangles are the building blocks of almost every 3D model, so this one's important. It's a **two-step** trick:

1. First treat the triangle as its infinite **plane** and find where the ray hits it.
2. Then check: **is that hit point actually inside the triangle?**

To do step 2, you use **barycentric coordinates** — a "recipe" that mixes the three corners:

**p = a·v₀ + b·v₁ + (1−a−b)·v₂**

The point is **inside** the triangle only if `a ≥ 0`, `b ≥ 0`, and `a + b ≤ 1`.

> 🧒 Think of a triangle as a mixing bowl with three ingredients (one per corner). "1/3 + 1/3 + 1/3" gives you a point right in the middle. Crank one ingredient up to 1 (and the others to 0), and you land exactly on that corner. If your recipe adds up to more than 100%, you've spilled *outside* the triangle.

---

## Recursive Ray Tracing (Mirrors & Glass)

This is the famous **Whitted-style** ray tracing, and it's what makes ray-traced images so pretty. The final color of a pixel is a sum:

**L_pixel = L_direct + L_reflect + L_refract**
*(what the light gives it directly + what it sees in reflection + what it sees through it)*

The recipe for each pixel:

1. Shoot the ray, find the first hit.
2. Do direct lighting + shadows.
3. If it's a mirror → make a **reflected** ray. If it's glass → make a **refracted** (bent) ray.
4. **Do the whole thing again** on those new rays.
5. Stop after a set number of bounces (**recursion depth**) — otherwise two facing mirrors would bounce forever. More bounces = more realistic but slower.

### Mirror Reflection
Angle in equals angle out. The formula is **r = v − 2(n∘v)n**.

> 🧒 A ball bouncing off a wall leaves at the same angle it came in. Light does the exact same thing on a mirror.

### Refraction (Bending)
When light passes into a new material (air → water → glass), it **bends**, following **Snell's Law**: `n₁ sin θ = n₂ sin φ`. Each material has a "bendiness number" (**refractive index**):

| Material | Refractive index (n) |
|----------|----------------------|
| Vacuum   | 1.0    |
| Air      | 1.000277 |
| Water    | 1.333  |
| Glass    | 1.5 – 1.7 |
| Diamond  | 2.4    |

Diamonds bend light a *lot* — that's why they sparkle.

> 🧒 Stick a straw in a glass of water and it looks **broken/bent** at the surface. The straw is fine — the *light* is bending. That's refraction.

### Total Internal Reflection
When light tries to go from a "thick" medium to a "thin" one (like water → air) at a steep angle, sometimes it can't escape and reflects back inside instead. (In the math, this is when the square root would go negative.)

> 🧒 It's why the underside of a swimming pool's surface can look like a mirror when you're underwater looking up sideways.

### Fresnel Effect
At any surface, light is *both* reflected and let through, and the mix depends on the angle you look from. **Schlick's approximation** is the fast formula everyone uses.

> 🧒 Look **straight down** into a calm lake → you see the fish and rocks below. Look **across** the lake at a low angle → it turns into a shiny mirror reflecting the sky. Same water, different angle. That's Fresnel.

---

## The Whole Thing in Pseudo-Code (the exam-favorite slide)

- `RayTrace`: loop over every pixel, shoot a ray, get a color, paint the pixel.
- `Trace`: if the ray hits something → `Shade` it; if not → use the background color.
- `Shade`: add up direct light (with shadows), then — if the material reflects/refracts *and* we haven't bounced too many times — trace the reflected and refracted rays and mix everything together.

```
RayTrace( view )
    for each pixel (x, y):
        ComputeRay(x, y, view, &ray)
        Trace(0, ray, &color)
        PutPixel(x, y, color)

Trace( level, ray, &color )
    if Intersect(level, ray, max, &hit):
        Shade(level, hit, &color)
    else:
        color = BackgroundColor

Shade( level, hit, &color )
    for each light source:
        ComputeDirectLight(hit, &directColor)

    if material reflects && (level < maxLevel):
        ComputeReflectedRay(hit, &reflectedRay)
        Trace(level+1, reflectedRay, &reflectedColor)

    if material refracts && (level < maxLevel):
        ComputeRefractedRay(hit, &refractedRay)
        Trace(level+1, refractedRay, &refractedColor)

    color = directColor
          + reflection   * reflectedColor
          + transmission * refractedColor
```

---

## One-Line Summary

Ray tracing shoots beams **from your eye** into the scene, finds what each beam **hits** (using neat math for spheres, boxes, planes, and triangles), checks **shadows**, colors the spot, and — for **mirrors and glass** — keeps bouncing and bending rays until the picture looks real.
