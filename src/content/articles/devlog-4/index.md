---
title: "Making room for content"
description: "Sorting out existing content and fitting it into content pages"
created: 2026-04-28T16:04
published: 2026-04-28
kind: devlog
tags:
  - site
  - markdown
  - shiki
---
# Making room for content

My initial idea for 3 main content types - articles, projects, and art - evolved in various ways throughout development.

The `art` page in particular was initially a mixed wall of all creative content - drawings, texts, etc. - similar to [DeviantArt](https://www.deviantart.com/). But with the introduction of the `misc` page, I felt that splitting it further would be easier and better categorized. Not that I strictly need it, but it fits the semi-archival role of this page better. Another bonus of adding such an ambiguous page was that it was a perfect place for some "articles" that are neither blog nor opinion pieces, like links to favorite sites or cheat sheets. That was where I started: the [markdown cheat sheet](/misc/md-test/) page.

## Handling markdown

I started this page based on a few other pages: the original [John Gruber docs](https://daringfireball.net/projects/markdown/), [GFM docs](https://github.github.com/gfm/), and even the [CommonMark spec](https://commonmark.org/).
I didn't intend to cover all possibilities, nor did I plan on supporting all features of any given flavor. Just enough to cover what I felt might be useful for me.

And in the process of creating this file, I added new styles or plugins to make it look nice.

The most notable decisions and changes were:
- Picking fonts
  - monospace: [Anonymous Pro](https://fonts.google.com/specimen/Anonymous+Pro) - my go-to coding font, so why not use it?
  - sans-serif: [Smooch Sans](https://fonts.google.com/specimen/Smooch+Sans) - for headings - it matched my intended style well
  - serif: [Baskervville](https://fonts.google.com/specimen/Baskervville) - for body text - I really liked its printed-media feel
- Picking [Shiki](https://shiki.style/) themes for code coloring
  - the dark one was easy: as soon as I noticed `Synthwave '84` on the list, I picked it. That's the one I started using a few years ago, after I got bored with `Monokai`
  - the light theme was a bit tricky, but I went with `Gruvbox Light Hard` because it matched my light theme nicely.
- Adding [rehype callouts](https://github.com/lin-stephanie/rehype-callouts) to handle GFM-like callouts and info boxes.
- [Adding a small custom Shiki plugin for wide code snippets](./shiki-plugin)

There were a few more things I wanted to add, like non-image media embeds, but I left them for _future me_, since they were a bit more complicated and I didn't have a use case for them _yet_. So I moved on to adding whatever content I already had.

## Projects

The `code` page was meant for my pet projects, basically some old or ongoing stuff that I could and wanted to share - not only the project, but also its code.

So for a start, I grabbed whatever I already had as public repos on GitHub, made some screenshots, and voila. Crude, but done.

I added a custom layout, but couldn't land on anything good, so I left it as is for now and moved on to art content.

## Gallery

After deciding that I would split art into separate categories, the gallery concept started to get simpler. I still liked the wall-of-images idea, so I went for an auto-flow grid design.

I picked a single base cell size and ensured that all image sizes were multiples of it. Well, in the process it turned out that it's not that simple for all images, so in the end I kept the option to have a custom aspect ratio for the original image, but forced a grid-based one for thumbnails.

That allowed me to accentuate images that I was especially proud of by making sure they occupied more grid cells. The downside of this approach is that I lost a clear time-based order, but that wasn't much of a loss, and the final ["wall of pics"](/misc/art/) is really satisfying to look at.

I also took this opportunity to scan whatever I had at higher resolution and [created a pipeline to turn those scans into proper assets for the page](./image-pipeline).

## Tags

Content started to fill up the page. Adding quite a lot of images and the first few articles made it feel less empty.

But there was still one issue with the gallery that I wanted to solve - searchability - or at least filtering content by tags. I felt like that might be especially useful in the context of showing only images with a common theme, like [Inktober](https://inktober.com/) entries.

This led to a [tags](/tags/) listing, with pages for each tag gathering all content types that share the same tag. Nothing fancy, just a nice little addition.

Notably, the gallery was also the trigger to [move hosting from GitHub Pages to Cloudflare](../devlog-5/).