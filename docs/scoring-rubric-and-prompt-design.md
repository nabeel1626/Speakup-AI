# Scoring Rubric and Prompt Design

This document defines a coaching rubric for Frontend Developer and Data Analyst mock interviews. Scores are evidence-based coaching signals, not hiring decisions or objective measurements of a person's ability.

## Shared Scoring Scale

Score every dimension from 1 to 5. Use whole numbers only. A score of 3 means the answer meets the basic expectation; 1 and 5 are reserved for clear evidence at the low and high ends. Do not award points for length, accent, speaking speed, confidence style, or familiarity with a particular company.

| Score | Anchor |
| --- | --- |
| 1 | Missing, incorrect, or unsupported; little relevant evidence. |
| 2 | Limited evidence; important gaps or unclear reasoning. |
| 3 | Adequate baseline; mostly correct, with some missing detail. |
| 4 | Strong, specific evidence; sound reasoning with minor omissions. |
| 5 | Thorough, accurate, well-prioritized evidence; tradeoffs or validation are explicit. |

## Role Rubrics

The weights are shared to make scores comparable in shape. The role-specific evidence below defines what relevance and technical depth mean for each role.

| Dimension | Weight | Frontend Developer evidence | Data Analyst evidence |
| --- | ---: | --- | --- |
| Relevance | 25% | Addresses the asked user interface, browser, or product problem; stays on the question. | Addresses the business question, population, metric, and decision being asked about. |
| Technical Depth | 25% | Correctly explains implementation details, constraints, tradeoffs, and how behavior or performance would be verified. | Correctly explains data definitions, query or statistical methods, assumptions, and how results would be validated. |
| Structure | 20% | Gives a comprehensible sequence such as diagnose, implement, verify. | Gives a comprehensible sequence such as define, analyze, validate, recommend. |
| Clarity | 15% | Uses precise, understandable language and explains necessary terms. | States findings and caveats plainly, without hiding uncertainty behind jargon. |
| Confidence / Filler Words | 15% | Uses direct, appropriately qualified statements and has few distracting fillers, based only on observable delivery evidence. | Same standard: direct but calibrated statements and few distracting fillers, based only on observable delivery evidence. |

Do not use vocal confidence as a proxy for correctness, competence, personality, or likely job performance. If only written text is available, mark Confidence / Filler Words as `N/A` and renormalize the other weights for a provisional score; do not infer confidence from polished prose. The sample runs below include transcript-level delivery observations so all five dimensions can be illustrated.

## Calculation

For a dimension scored from 1 to 5, its contribution is `weight x score / 5`. Add the five contributions for a total from 0 to 100. Keep one decimal place during calculation and show the final total as a whole percentage. Do not round dimension scores to improve a result.

## Scoring Prompt

Use this prompt with the selected role rubric, interview question, answer transcript, and (when available) delivery observations:

> You are a consistent interview coach. Score the answer against the supplied role rubric and the exact question. Treat the rubric as a coaching aid, not a hiring recommendation.
>
> Score Relevance, Technical Depth, Structure, Clarity, and Confidence / Filler Words independently from 1 to 5 using the supplied anchors. For each score, quote or point to concrete evidence in the answer. Do not let a strong or weak impression in one dimension change another dimension's score. Evaluate only what the answer demonstrates; do not fill in unstated knowledge or penalize a candidate for not discussing details the question did not call for.
>
> Evaluate Confidence / Filler Words only from supplied audible delivery observations or a verbatim transcript that preserves fillers. Do not infer confidence from grammar, vocabulary, accent, fluency in a second language, speaking speed, or assertive personality. If delivery evidence is absent, return `N/A` for this dimension and calculate a provisional total by renormalizing the other weights.
>
> Return valid JSON with `scores` (one score or `N/A` per dimension), `evidence` (one concise evidence note per dimension), `weighted_total`, `strength`, and `next_step`. Calculate the total from the supplied weights; do not add criteria. Include a brief caveat if the answer or delivery evidence is incomplete.

## Three Sample Runs

These are controlled, illustrative dry runs of the prompt above, not outputs from a connected language model. Each sample includes the role, question, answer, and delivery evidence used for scoring. Totals use the same calculation and anchors.

### Run 1: Frontend Developer, strong evidence

**Question:** How would you investigate and improve a slow React product page?

**Answer:** "I would reproduce the slow interaction and check the browser performance trace and Core Web Vitals before changing code. If the largest contentful paint is image-bound, I would check image dimensions, responsive sources, and loading priority. I would use the React Profiler to find expensive renders, then split code or reduce repeated work where the trace supports it. I would compare the same interaction before and after and watch for regressions on a slower device."

**Delivery evidence:** Verbatim transcript; steady pace, no observed fillers, pauses before the diagnostic and validation steps.

| Dimension | Score | Weighted points | Evidence |
| --- | ---: | ---: | --- |
| Relevance | 5 | 25 | Directly addresses investigation and improvement of React page performance. |
| Technical Depth | 5 | 25 | Names traces, Core Web Vitals, image loading, React Profiler, code splitting, and before/after validation. |
| Structure | 5 | 20 | Clear reproduce, diagnose, implement, and verify sequence. |
| Clarity | 4 | 12 | Specific and easy to follow; some technical terms are not unpacked, reasonably for this role. |
| Confidence / Filler Words | 5 | 15 | Delivery evidence supports a direct, measured answer with no observed fillers. |
| **Total** |  | **97** | Strong, relevant answer with an explicit validation loop. |

### Run 2: Frontend Developer, incomplete evidence

**Question:** How would you investigate and improve a slow React product page?

**Answer:** "Um, I think maybe I would add Redux and memoize all the components because React can be slow. Then I would ask users if it feels better."

**Delivery evidence:** Verbatim transcript; two audible fillers, hesitant phrasing, otherwise understandable pace.

| Dimension | Score | Weighted points | Evidence |
| --- | ---: | ---: | --- |
| Relevance | 3 | 15 | Mentions a React page and perceived slowness, but does not establish a diagnosis. |
| Technical Depth | 2 | 10 | Names Redux and memoization without showing either addresses the measured bottleneck; no technical verification. |
| Structure | 2 | 8 | Suggests changes followed by user feedback, but has no diagnostic or measurable sequence. |
| Clarity | 3 | 9 | The proposal is understandable, though broad and weakly explained. |
| Confidence / Filler Words | 2 | 6 | The transcript contains two fillers and repeated hedging; this is a delivery observation, not a competence judgment. |
| **Total** |  | **48** | Useful next step: measure first, then connect a targeted change to the observed bottleneck. |

### Run 3: Data Analyst, strong but qualified evidence

**Question:** A campaign's conversion rate fell last week. How would you determine whether the campaign caused it?

**Answer:** "First I would confirm the conversion definition and compare like-for-like cohorts, including traffic source, device, and the same weekdays. I would check tracking changes and sample counts, then quantify the change with uncertainty intervals rather than treating a week-over-week difference as causal. If the campaign was randomized, I would compare assigned groups and verify exposure; otherwise I would look for concurrent changes and describe the result as an association. I would report the effect size, uncertainty, and what additional evidence would change the recommendation."

**Delivery evidence:** Verbatim transcript; measured pace, one brief pause, no observed fillers; uncertainty is stated without trailing off.

| Dimension | Score | Weighted points | Evidence |
| --- | ---: | ---: | --- |
| Relevance | 5 | 25 | Directly tests campaign attribution for the reported conversion-rate decline. |
| Technical Depth | 5 | 25 | Covers metric definition, comparable cohorts, tracking, sample counts, randomization, exposure, and causal limits. |
| Structure | 5 | 20 | Defines and validates the measure, checks comparability, tests design, then reports implications. |
| Clarity | 4 | 12 | Clear and calibrated; "uncertainty intervals" could be explained for a nontechnical stakeholder. |
| Confidence / Filler Words | 4 | 12 | Calm, measured delivery and no observed fillers; the pause is not treated as a deficit. |
| **Total** |  | **94** | Strong analytical reasoning with appropriate limits on causal claims. |

## Consistency and Fairness Check

- **Arithmetic:** The three weighted totals are 97, 48, and 94 out of 100. Each dimension uses the same scale and weight across roles; differences come from answer evidence and role-specific expectations.
- **Question fit:** Relevance is judged against the exact question. The analyst is not rewarded for unrelated technical detail, and the frontend candidate is not expected to claim a specific framework fix without evidence.
- **Independent dimensions:** Run 2's hesitancy affects only the delivery dimension; its technical score is low because the proposed fixes are not tied to diagnosis, not because of its tone.
- **Delivery limits:** Delivery observations are necessarily context-dependent. Text-only use must return `N/A` and renormalize, rather than treating polished writing as vocal confidence.
- **Fairness boundary:** These examples are too small to establish statistical fairness across accents, disabilities, cultures, or language backgrounds. A deployed evaluator needs diverse, consented test data, human review, and an appeal/correction path. A 15% delivery weight should be reconsidered if reliable audio evidence or accessibility accommodations are unavailable.

## Prompt Phrasings That Cause Drift

This is a qualitative sensitivity review of the three examples, not a repeated model benchmark. No live model endpoint is configured in this repository, so model-to-model or run-to-run variance has not been measured.

| Prompt phrasing | Likely drift | Stabilizing wording |
| --- | --- | --- |
| "Score the candidate's overall quality." | Halo effect: polished delivery or a confident tone can inflate technical scores. | "Score each dimension independently and cite evidence for each score." |
| "Be strict; only top candidates should score highly." | Systematic downward shift unrelated to the defined anchors; ambiguous threshold for a 3. | "Use the 1-5 anchors; a 3 means the stated baseline expectation is met." |
| "Assess confidence and professionalism." | Penalizes quiet, accented, neurodivergent, or non-native delivery styles and can confuse style with skill. | "Assess only observable fillers and directness; do not infer competence or personality." |
| "Reward detailed answers." | Length bias: verbosity earns points even when irrelevant or unsupported. | "Reward only relevant evidence; do not award points for answer length." |
| "Give a generous score to encourage the user." | Inflates scores and weakens comparability between sessions. | "Be supportive in feedback, but keep scores anchored to demonstrated evidence." |

## Build-Log Post

**Rubric and sample scores:** see [the scoring summary screenshot](scoring-rubric-sample-scores.png).

**Commentary:** The three totals look directionally fair for these examples: specific diagnosis and verification earn higher technical and structure scores; unsupported prescriptions do not. The most important fairness safeguard is refusing to infer vocal confidence from text. The examples also show why a high total should not be presented as an objective judgment: the delivery score is context-sensitive, and three hand-scored examples cannot establish population-level fairness. Before product use, test the same answers across repeated runs and diverse delivery conditions, review disagreements with humans, and allow users to correct inaccurate transcripts or feedback.