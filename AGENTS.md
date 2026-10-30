# Publication instructions

The production application is https://sat-study-room.chalkydaisy5.chatgpt.site/.
GitHub Pages serves the root index.html redirect to that URL, so visitors always reach the latest production version. Preserve this behavior. If the production URL changes, update the redirect, canonical URL, fallback link, and README together.

After changes to SAT Study Room, also update the public application source under dist/ in yapperyap/sat-study-room. Exclude College Board questions, passages, explanations, images, generated question indexes and content-embedded downloads. Never publish .openai configuration, tokens, or other secrets. Original application code is MIT; third-party content is excluded.
