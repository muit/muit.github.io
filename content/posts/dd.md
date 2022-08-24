---
title: dd
date: 2022-08-24T19:19:26.994Z
---
So, a while back I talked about arenas, allocators, and some possible implementations for them.

However, this would not enough on its own for a project of a reasonable size. In order for people to use arenas and get their benefits, they have to be convenient to use. We should be able to achieve efficient allocations with minimal effort (and code).

So, over this and possibly more posts, I will cover how [Pipe](https://github.com/PipeRift/pipe) does this.

## What is Pipe?

If we are going to talk about it, we should first know what it is.

[Pipe](https://github.com/PipeRift/pipe) is a cross-platform utility library used as the foundation for [Rift](https://github.com/piperift/rift).

It provides multiple cross-platform features that simplify coding with C++,  including what is relevant to this post: Memory allocation.

## Three main elements

### Native Allocations

### Allocators

### Arenas