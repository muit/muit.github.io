---
title: How I implemented custom arrays for Pipe
date: 2023-07-12
draft: true
cover: Assets/Img/Covers/line-of-ducks.png
series:
- pipe
---

Just use **std::vector**.

Which is what I did until a couple weeks ago, when I decided enough was enough! It was about time to make an array type specifically for the needs of my library, Pipe.

As to why I needed my own array types. std::vector is great (no, really), BUT:

* It has an API based on iterators and allocators, which makes it more complex and its own internal code unintelligible. I am sure someone looking to have a career on the std standard will like it, but us humans need to understand how the tools that we use work.
* It has a templated allocator, which on its own makes the complexity and use of the type 
  But also because it's fun to do these crazy things, not gonna lie.

For context
