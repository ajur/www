---
title: Designing the Landing Page
description: "Designing the landing page - main menu, and background animation for the site - with insights on using AI in the process."
created: 2026-03-27T14:03
published: 2026-03-27
tags:
  - site
  - devlog
  - ai
---
# devlog 3

After creating the basic project structure, I got to the fun part and started work on the landing page.

I really liked the visual aspect of the old page. It was bare, but in some way it reflected what I like. Thus, I wanted to preserve that and even expand on it. So the landing page would basically stay like before: minimal navigation, with animation in the background. And that's okay, because if I consider my old home page just a facade, then this new home is basically a refresh of it and an expansion of what lies beyond it.

Ok, so, what do I need?

First - **logo** - that was easy. I already had something I liked enough and had used as a loading animation for a few games. So that's settled.

Second - **navigation** - that was trickier – what to include, how to divide it, how to present it. There was some exploration done with AI, but more on that later. In the end, I had a nice minimal main menu.

Last but not least - **background** - I thought this one would be the most challenging. Especially because I wanted to expand it into multiple animations, with some controls to change them. Kind of like a gallery for generative art pieces. But to start, one landing animation was enough.

## First animation

I liked my old random walk, but here, for the first animation, I wanted a more subtle, noise-based animation. Since I wanted to do it without any library, I had to create a simple WebGL shader runner.
This is where AI coding came in. That's the part I basically vibe-coded: the shader runner and the shader itself (well, [aside from simplex noise](https://github.com/stegu/psrdnoise/)). 

I might not be proud of it, but after spending a bit too much time on CSS, I figured it wasn't that bad. Besides, I at least understand what's going on, for the most part - shader math is often just too much xD - and can review and adjust the parts that weren't working well. But I must admit that, for this kind of simple, common code, LLMs work fairly well. Especially when you know what you want, what to expect, and how to steer them to do exactly what you want. And I already noticed it's much easier to do in code, especially for a developer who already knows how to code, than with generative art or music.

And yeah, I lost the opportunity to learn more GLSL. But there is only so much free time I have, and falling into another rabbit hole of studying wouldn't bring me closer to finishing this site.

## Main menu

I also used it to refine the main menu. Not to generate it, because it often produced overbloated code and too much local CSS (there is still a lot of that), but to help with naming.

At first I had pretty normal names for my main subpages, and those are still in the links: `articles, projects, art, about`. But when I prepared the front page's vertical menu, it felt off. It was just too uneven and somewhat unappealing. So, as often happens recently in cases like this, I opened an AI chat and started discussing the issue at hand.

It proposed a few things, asked some follow-up questions, and kept narrowing the direction. But somewhere in the process, it made some good observations about my indecisiveness and about designing for content that I don't have yet and still don't know what it will be. 

I got almost roasted for focusing on the wrong things and doing stuff backwards... it led to me acknowledging and kinda embracing the issue, and you can read about it in [first devlog](../devlog-1). It was almost like talking with a psychologist :O

I found that, in general, my process of "discussing with AI" often lands in the realm of "talking to a rubber duck" - a commonly known practice in software development, where if you struggle with a solution, you just talk to someone about it, even a rubber duck, and will probably come up with a solution on your own. "Talking" with AI feels similar, but elevated.
AI will propose some solutions, but I often find them kinda meh... those are usually inspiring enough for me to find another way. Like, "I don't quite like it, but if I changed this and that, it would be kinda cool".

As for the main menu, I ended up with a 4x4 structure: four four-letter words that all looked a bit like they belonged in a codebase.:

- `text` - for articles - that was simple
- `code` - for projects - that was even simpler
- `self` - for the about page - `this` was also considered, but I went with the Python convention
- `misc` - for everything else - that was the hardest. At first I wanted gallery, or `art`, to be there, but I couldn't find a nice 4-letter word for it that would fit. So I went with the often-used dev shortcut for 'miscellaneous' for, well, everything else. And on that page there is basically a bunch of different things.

And that was it for the main page. Next was [adding articles handling](../devlog-4).