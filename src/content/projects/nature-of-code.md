---
title: The Nature of Code
description: Working through Daniel Shiffman's Nature of Code — simulations, physics, and creative coding with vanilla JS, Canvas, and a custom ECS library, all on Observable.
status: in progress
startDate: 2019-12-30
lastUpdated: 2026-01-23
image: nature-of-code.png
url: https://observablehq.com/@ajur/the-nature-of-code-0-introduction?collection=@ajur/the-nature-of-code
tags:
  - NatureOfCode
  - learning
---

A hands-on journey through [The Nature of Code](https://natureofcode.com/) by Daniel Shiffman — exploring algorithms and approaches behind computer simulations: vectors, forces, particle systems, autonomous agents (as in simulation entities, not LLMs AI), and more.

## Project Context

I started this project to deepen my understanding of simulation algorithms and creative coding techniques. Rather than following the book's Processing / p5.js path, I chose to use **vanilla JavaScript and Canvas**, stripping things down to the fundamentals.

Around the same time I discovered [Observable](https://observablehq.com/) — a notebook platform that lets you blend prose, code, and live visualizations into a single document. It reminded me of MATLAB, Mathematica, and Python Jupyter notebooks that I used years ago. It was a perfect fit for this kind of exploration, so the entire project lives there as a collection of interactive notebooks.


To make the simulations both more fun to build and cleaner to structure, I wrote a small custom **[ECS](https://en.wikipedia.org/wiki/Entity_component_system)** library. It provides a simulation runner that the chapter notebooks plug into, after defining own systems and components, and is imported from separate [tools notebook](https://observablehq.com/@ajur/the-nature-of-code-tools).

## Tech Stack

* **Language:** JavaScript
* **Rendering:** Canvas 2D
* **Platform:** Observable notebooks
* **Architecture:** Custom ECS library for simulation runner, or anything else that was need
