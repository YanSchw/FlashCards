# Flashcards

A mobile-first spaced-study flashcard app. Angular + TypeScript + Tailwind CSS,
data-driven from plain JSON, progress saved per-profile in `localStorage`. No
backend, no auth, no build-time coupling to the content.

## Run it

```bash
npm install
npm start        # dev server at http://localhost:4200
npm run build    # production build into dist/
```

## How it works

**Flow:** Home (pick a profile + course) → Dashboard (progress overview) →
Study (a shuffled session of _K_ cards) → back to Dashboard.

**Profiles.** Several people can share one device. Each named profile keeps its
own progress under the `flashcards.v1` key in `localStorage`. No accounts.

**Content.** Every course is a self-contained JSON file in
[`public/courses/`](public/courses/), listed in
[`index.json`](public/courses/index.json). Courses never share cards. See
[FLASH_CARD_GUIDE.md](FLASH_CARD_GUIDE.md) to add cards (built for AI agents
converting PDFs → decks).

### Card states

Each card's state is derived from that profile's recent attempts (the last **3**
tries, each stored with a timestamp):

| State                | Color  | Rule                                                              |
| -------------------- | ------ | ---------------------------------------------------------------- |
| **Unanswered**       | gray   | No attempt in the last **72 h**.                                 |
| **Wrong**            | red    | Every attempt in the last 72 h was wrong.                        |
| **Needs Repetition** | yellow | Some success in 72 h, but not yet locked in.                     |
| **Memorized**        | green  | All recent attempts correct **and** the last one within **12 h**. |

### Weighted shuffle

A study session samples _K_ cards (weighted, without replacement) so the cards
you're worst at surface first:

| State            | Weight |
| ---------------- | ------ |
| Memorized        | 0.1    |
| Needs Repetition | 1.0    |
| Wrong            | 2.0    |
| Unanswered       | 3.0    |

You can pull _K_ from the **whole course** or from a **single lecture**. If fewer
than _K_ cards exist, you get all of them.

### Study controls

- **Tap / Space** — flip the card.
- **Swipe right / →** — mark correct ("Got it").
- **Swipe left / ←** — mark wrong ("Missed").

## Project layout

```
public/courses/         JSON content (the source of truth)
src/app/core/           models, card-id hashing, card-state logic, weighted shuffle
src/app/services/       courses loader + progress/localStorage store
src/app/pages/          home · dashboard · study (lazy-loaded routes)
src/app/ui/             shared presentational components
reference/              the original single-file prototype
```
