---
title: Spending billions on lazy code
description: AI has changed computer engineering but its using more and more resources whilst being trained on lazy & ineffecient code.
date: "2026-04-05"
tags:
  - AI
  - Programming languages
featuredImage: "/blog/breaking-bank.jpg"
---

# The Silent Tax: Why AI’s "Lazy Architecture" is Breaking the Bank

In 2026, we’ve hit a strange paradox. We are using massive, multi-billion dollar Artificial Intelligence models to help us write code faster than ever before. But there’s a catch: because these AIs are trained on the vast ocean of human-written code, they’ve inherited our worst habit—laziness.

Most AI-generated code defaults to high-level, "heavy" languages like JavaScript or Python. While these are great for developer velocity, they are the equivalent of building a house out of solid lead because it was easier to stack the bricks. In an era where global DRAM (memory) prices have surged by over 60%, this "Lazy Architect" approach is no longer just a technical quirk—it’s a financial crisis.

## The "Hello World" Reality Check

To understand the "Memory Tax," let’s look at a simple web server—the "Hello World" of the backend. If you ask an AI to spin one up, here is what the physical cost looks like on your hardware:

    C: < 1 MB — The "bicycle"—lean, direct, and requires zero bloat. No runtime, no garbage collector, just pure execution.

    Go: 10–15 MB — The "sedan"—efficient enough for most, with a small "trunk" (the Go runtime) for scheduling and memory management.

    Node.js: 35–85 MB — The "semi-truck"—carrying an entire engine (V8) just to deliver a single letter. Powerful, but comes with a massive footprint.

When you scale this to thousands of microservices, the difference between C/Go and JavaScript isn't just a few megabytes; it’s the difference between a $1,000 monthly cloud bill and a $10,000 one.
Why the AI is a Lazy Architect

AI doesn't choose JavaScript because it's better; it chooses it because it's popular. As developers, we’ve spent a decade prioritizing "velocity" (how fast we can ship) over "efficiency" (how well the code runs).

The result? The AI "Architect" suggests the path of least resistance. It gives you a Node.js script because that’s what most people wrote in 2023. But in 2026, the economics have shifted. Memory is the new oil. Using a garbage-collected, high-abstraction language for a simple task is like idling a private jet to charge your phone.

## The Developer's New Mandate: Reclaiming the Craft

As someone who works across C, Go, and JavaScript, I see the spectrum clearly. JavaScript is a fantastic tool for the UI, but using it for heavy-lifting AI orchestration is leaving money on the table.

We need to start "prompting" better. Instead of letting the AI default to the easiest path, we should be pushing for:

    C for the Core: For the high-performance logic where every byte counts.

    Go for the Glue: For the concurrent services that need to stay lean but manageable.

    JS for the Edge: Only where the flexibility of the web is truly required.

## Conclusion

Performance vs. Velocity is the most important trade-off in a developer's career. But when the AI is writing the code, the "velocity" part is already handled. If the AI can write C just as fast as it writes JavaScript, why would we ever choose the heavier option?

It’s time to stop building lead houses. It’s time to demand efficiency from our digital architects.
