---
title: DRAFT - devlog 3
description: "Designing the landing page - main menu, and background animation for the site - with insights on using AI in the process."
created: 2026-03-27T14:03
published: 2026-03-27
tags:
  - site
  - devlog
  - ai
---
# devlog 3

After creating the basic project structure, I went to the fun part and started work on the landing page.

I really liked the visual aspect of the main page. It was bare, but it was in some way reflecting what I like. Thus, I wanted to preserve that, and even expand. So, the landing page would basically stay like before – minimal navigation, with animation on the background. And that's ok, as if I consider my old home page as just a facade, then this new home is mostly refreshing and building the remaining rooms.

Ok, so, what do I need?

First - **logo** - that was easy. I already had something I liked enough, and used as a loading animation for a few games. So that's settled.

Second - **navigation** - that was trickier – what to include, how to divide it, how to present it. There was some exploration done with AI, but more on that later. In the end, I had a nice minimal main menu.

Last but not least - **background** - this was the most challenging, as I wanted to start with one animation, but in the end, the plan is to have more. To kinda have multiple animations, and some controls. Basically, to make it a little digital gallery for generative art.

## First animation

I liked my old random walk, but here, for the first animation, I wanted a more subtle, noise-based animation. But as I wanted to do it without any library, I had to create a simple WebGL shader runner. Here is where AI coding went in. That's the part I basically vibe coded – shader runner, with shader itself (well, [beside simplex noise](https://github.com/stegu/psrdnoise/)).

And I might not be proud about it, but after spending a bit too much on CSS, I figured that's not that bad. Besides, I at least understand what's going on (for the most part – shader math is often just too much xD), review and adjust the parts that weren't working well. But I must admit, for the most part, in this kind of simple and common code – LLMs work fairly well. Especially when you know what you want, what to expect, and how to steer it to do exactly as you want. And I already noticed it's much easier to do in code (especially for a developer who already knows how to code) than with generative art or music.

And yeah, I lost the opportunity to learn more GLSL. But there is only so much free time I have, and falling into another rabbit hole of studying wouldn't bring me closer to finishing this site.

## Main menu

I've used it also for refining the main menu. Not necessary for its generation, as often it produced overbloated code and too much local CSS (there is still a lot of this), but about naming. At first I had pretty normal names for my main subpages (and those are still in links): articles, projects, art, about. But when I prepared the front page, vertical menu, it felt off. It was just too uneven and somewhat uncompelling. So as often recently in such cases, I've opened AI chat and started discussing the issue at hand. It proposed a few things, then asked some additional questions, proposed something more, and so on. But somewhere in the process, it put some good "observations" about my indecisiveness, and designing for content that I don't have and still don't know what it will be. It kinda led to another big discussion, but that's for another post.

In the end, my process with "discussing with AI" often lands in the realm of "talking to a rubber duck" – a commonly known case in software development, where if you struggle with a solution, just talk to someone about it, even some rubber duck, and you will probably come up with a solution on your own. "Talking" with AI feels similar, but elevated, as often what it responds leads to some totally new ideas that I wouldn't have come up with on my own (or at least not as fast).

As for the main menu, I ended with 4x4 (4 words with 4 letters), that all looked a bit like part of some codebase:

- `text` - for articles - that was simple
- `code` - for projects - that was even simpler
- `self` - for about page - `this` was also considered, but I went with the python convention
- `misc` - for everything else - that was the hardest. At first I wanted gallery, or `art` to be there, but I couldn't find a nice 4-letter word for it that would fit in. So I went with the often-used in dev 'miscellaneous' shortcut, for, well, everything else. And on that page there is basically a bunch of different things.

And that was it. Until I started to write the first devlog and got [reality checked by ChatGPT](../devlog-4) – almost like talking with a Psychologist...