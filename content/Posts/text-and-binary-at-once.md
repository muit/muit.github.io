---
title: Text and Binary serialization at once
date: 2022-04-30
draft: true
series:
- serialization
---

<img style="width: 100%" src="/Assets/Img/Covers/chips.png" />
<br>You see, I like to spend my free time building a programming language called [**Rift**](https://github.com/PipeRift/rift).

This surely wasn't ambitious enough, so early on I designed it to be based on data files.

This basically means code files are not saved as text, but stored as data in some format like json or binary, and interpreted by an editor/compiler later.
Of course, there are many advantages and some disadvantages to this approach, but I will only focus on the serialization aspect of it today.

I am going to describe what the serialization architecture looks like in Rift, and why I got there.
I believe it is interesting to play with, and maybe it can bring some new ideas to the topic.

# What is serialization?

In short, Serialization is simply transforming memory into text or binary formats.

Even for those that are familiar with serialization it is important to remember this.
Many serialization libraries try to do too much but fail to do the basics well and that difuses the term.

## What is it for?

Serialization can have many uses.
I suppose the most frequent ones are to store into files, or send over the network.

[**Rift**](https://github.com/PipeRift/rift), for example, uses serialization for files primarily but also for transactions (like Undo/Redo in editor).

-----------------------------------------------------sketch

What are the pieces?
![serialization-elements](/Img/serialization-elements.png)

There are two main elements:

* **Contexts**: Facilitates serialization of supported types, and represents a single instance of serialization
* **Format**: Receives basic data structures to be stored into the final data according to the format it implements

It is scoped.

Can have arrays, objects or native values.

<br>

Consider having a look at [**Rift**](https://github.com/PipeRift/rift), which is a visual compiled programming language.
It would be incredibly helpful to get your ideas, feedback and/or code contributions!
