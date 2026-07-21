# Use these prompts step by step to retrieve content from PDFs using GenAI

# First let the AI paraphrase
```
can you summarize Lecture 05 of my Algorithm Engineering Lecture. make it as easy to understand as possible (if possible so even a child can understand) and add some really nice examples to make it even easier to understand.
```

# Now Let it convert to Markdown
```
Convert this Text into Markdown, ready to be copied. so i can put it in my notes.
```

# Convert to Flashcards
```
can you turn this summary into flash cards? always put a front and back. include all the important stuff from the slides. but keep the cards easy to learn smaller chunks (also no formulas more like the ideas and reasons)

create like 20-30 flashcards.

use the following JSON format to create a new lecture:
{
    "id": "lecture-01-slug",
    "title": "Lecture 01 · Topic Name",
    "description": "One short sentence shown under the lecture title.",
    "summary": "summaries/your-course-id/lecture-01-slug.md",
    "cards": [
    {
        "topic": "A Short Group Name",
        "question": "The prompt shown on the front of the card?",
        "answer": "The answer shown on the back. Wrap the <b>key phrase</b> in bold."
    },....
    ]
}
```