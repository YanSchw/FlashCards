# Flashcard Authoring Guide (for AI agents & humans)

This guide tells an AI agent how to turn source material (a PDF, lecture notes,
a chapter) into flashcards this app can load. Follow it exactly and the output
drops in with zero code changes.

---

## 1. Where cards live

```
public/courses/
  index.json                    <- registry of all courses
  algorithm-engineering.json    <- one self-contained course
  computer-networks.json        <- another self-contained course
```

- **One JSON file per course.** A course never references another course; there
  is no shared state between courses.
- Every course file listed in `index.json` is loaded by the app.

### Registering a new course

Add one entry to `public/courses/index.json`:

```json
{
  "courses": [
    { "id": "algorithm-engineering", "file": "algorithm-engineering.json" },
    { "id": "your-course-id", "file": "your-course-id.json" }
  ]
}
```

`id` must be unique, lowercase, kebab-case, and match the `id` inside the file.

---

## 2. The exact JSON format

```json
{
  "id": "your-course-id",
  "title": "Human Readable Course Title",
  "description": "One short sentence shown on the course card.",
  "lectures": [
    {
      "id": "lecture-01-slug",
      "title": "Lecture 01 · Topic Name",
      "description": "One short sentence shown under the lecture title.",
      "cards": [
        {
          "topic": "A Short Group Name",
          "question": "The prompt shown on the front of the card?",
          "answer": "The answer shown on the back. Wrap the <b>key phrase</b> in bold."
        }
      ]
    }
  ]
}
```

### Field rules

| Field                | Required | Rules                                                                 |
| -------------------- | -------- | --------------------------------------------------------------------- |
| `id` (course)        | yes      | kebab-case, unique, equals the filename stem and the `index.json` id. |
| `title`              | yes      | Plain text. No HTML.                                                   |
| `description`        | no       | Plain text, ~1 sentence.                                              |
| `lectures[].id`      | yes      | kebab-case, unique **within the course**.                             |
| `lectures[].title`   | yes      | Plain text.                                                           |
| `cards[].topic`      | yes      | Short label used for grouping/filtering (e.g. "Branch Prediction").   |
| `cards[].question`   | yes      | Plain text. One idea per card. End with a `?` when it's a question.   |
| `cards[].answer`     | yes      | May contain **only** `<b>…</b>` for emphasis. No other HTML.          |

### Card identity (why wording matters)

The app assigns each card a stable id by hashing `topic + question + answer`.
That id is the key for its saved progress. Practical consequences:

- **Editing a card's text resets its progress** (it becomes a "new" card).
- **Two cards with identical topic + question + answer collide.** Keep every
  card unique.

---

## 3. Content rules (the guard rails)

Follow all of these when generating cards:

1. **Faithful to the source only.** Never invent facts, numbers, or claims that
   are not in the provided material. If the source doesn't answer it, don't ask it.
2. **Atomic.** One concept per card. Split compound questions.
3. **Self-contained.** A card must be answerable without seeing its neighbours.
   Don't write "What is the second reason mentioned above?".
4. **Question on the front, answer on the back.** Never put the answer in the
   question.
5. **Concise answers.** 1–3 sentences. Bold the single most important phrase with
   `<b>…</b>` — exactly one or two per answer, not the whole sentence.
6. **Plain, active language.** Prefer intuition and analogies over jargon dumps,
   matching the existing decks' tone.
7. **Group with `topic`.** Reuse a small, consistent set of topic labels per
   lecture (roughly 4–8), so filtering and the dashboard stay meaningful.
8. **Valid JSON only.** UTF-8, double quotes, no trailing commas, no comments.
   Escape any literal `"` inside strings. The only HTML allowed is `<b>`.
9. **No secrets / no PII.** Don't copy names, emails, or credentials from source
   material into cards.
10. **Aim for 15–40 cards per lecture** unless the source is unusually short or long.

---

## 4. Recommended system prompt (PDF → cards)

Give this to an LLM alongside the extracted text of one lecture/chapter:

```
You convert study material into flashcards as strict JSON.

OUTPUT: a single JSON object for ONE lecture, matching this shape:
{ "id": "<kebab-case>", "title": "<string>", "description": "<string>",
  "cards": [ { "topic": "<short group>", "question": "<string>", "answer": "<string, may use <b></b>>" } ] }

RULES:
- Use ONLY facts present in the provided material. Do not add outside knowledge.
- One idea per card. Each card must stand alone (no references to other cards).
- Question on the front; never reveal the answer in the question.
- Answers are 1–3 sentences; wrap the single key phrase in <b>…</b>.
- Group cards with a small, consistent set of `topic` labels.
- Output valid JSON only. No markdown fences, no commentary, no trailing commas.
- The only HTML permitted anywhere is <b>…</b>.

MATERIAL:
<paste the extracted lecture text here>
```

Then drop the returned lecture object into the course file's `lectures` array
(or wrap it in a new course file and register it in `index.json`).

---

## 5. Validate before shipping

- The file is valid JSON: `node -e "JSON.parse(require('fs').readFileSync('public/courses/<id>.json','utf8'))"`
- The course is registered in `index.json` with a matching `id`.
- `npm run build` succeeds and the course appears on the home screen.
