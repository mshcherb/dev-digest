# reviewer-core — docs

Deep dives on how `reviewer-core` works **today**, with `path:LINE` (`symbol`) links into the code.
The pipeline diagram and public API stay in [`../README.md`](../README.md); plans in [`../specs/`](../specs/).

| Topic | What it covers | Read when… |
|---|---|---|
| [review-engine.md](review-engine.md) | inputs, mode selection, prompt sections and fencing, LLM call, reduce, grounding drops, score | you change the prompt, grounding, strategy or scoring, or a finding vanished |

How the server builds the inputs and stores the result: [`../../server/docs/review-execution.md`](../../server/docs/review-execution.md).
