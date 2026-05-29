---
title: "Supporting wide code snippets"
description: "Using a ShikiTransformer and CSS to let code blocks bleed beyond the main content column"
created: 2026-04-29T21:21
published: 2026-04-29
kind: how-to
tags:
  - site
  - astro
  - markdown
  - shiki
  - css
---

# Supporting wide code snippets

While working on [styling my markdown output](../devlog-4#handling-markdown) - code snippets in particular - I thought it would be great to have an option to _bleed_ code snippets outside the central content column, so I can show a full, non-scrollable snippet when possible.

As this page is built on Astro and I'm using Shiki for code blocks, the easiest, or at least the leanest, way turned out to be adding a small `ShikiTransformer` that adds CSS classes to the output HTML:

```typescript .soft-bleed
import type { ShikiTransformer } from 'shiki';
export const shikiClassMeta: ShikiTransformer = {
  name: 'shikiClassMeta',
  pre(node) {
    const meta = this.options.meta?.__raw?.split(' ').filter(Boolean) || [];
    const classes = meta
      .filter((part) => part.startsWith('.'))
      .map((part) => part.slice(1));
    node.properties.class = `${node.properties.class || ''} ${classes.join(' ')}`.trim();
  }
};
```

Then I created two CSS utility classes: `soft-bleed` to allow full-content width and `full-bleed` to force full-screen width, and started figuring out how to apply them to my code blocks. Now all I need to do is add the class name after the language:

````markdown
```typescript .soft-bleed
//...
```
````

As for the CSS classes, `full-bleed` was pretty simple - set the inline size to the full viewport width and apply a negative margin equal to half the content width minus half the viewport width.

```css
.full-bleed {
  max-inline-size: none;
  inline-size: 100vw;
  margin-inline: calc(50% - 50vw);
}
```

`soft-bleed` was trickier, but the trick is to ensure the proper size - fitting the content, but staying at least as wide as the main column and at most as wide as the viewport - and center the block by moving it to the center of the parent and translating it left by half its width.

```css
.soft-bleed {
  min-inline-size: 100%;
  max-inline-size: 100vw;
  inline-size: fit-content;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
```

Yeah, CSS is crazy when you consider that there are basically two `50%` values in a single block, and each is based on a different value...

> [!warning] Potential issue
> When adding those wide snippets into callouts (like this one), I've noticed that they can end up misaligned.
> It turned out that this was due to the asymmetric border and padding in my callout styles.
>
> To fix this, I just added padding to the right side of the callouts to keep the content symmetrical.
>
> ```css
> padding-inline-end: calc(
>  var(--callout-padding) + var(--callout-border-width)
> );
> ```

I'm still considering adding more full-featured attribute support, like in this [CommonMark suggestion](https://talk.commonmark.org/t/consistent-attribute-syntax/272), to handle more than just code - but for now, this is good enough.