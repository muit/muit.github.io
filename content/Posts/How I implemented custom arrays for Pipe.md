---
title: How I implemented custom arrays for Pipe
date: 2023-07-12
draft: true
cover: Assets/Img/Covers/line-of-ducks.png
series:
- pipe
---

Just use **std::vector**.

Which is what I did until a some weeks ago, when I decided enough was enough! It was about time to make an array type specifically for the needs of my library, Pipe.

As to why I needed my own array types. std::vector is great (no, really), BUT:

* It has an API based on iterators and allocators, which makes it more complex and its own internal code unintelligible. I am sure someone looking to have a career on the std standard will like it, but us humans need to understand how the tools we use work. I usually dont like black boxes.
* It has a templated allocator type. This on its own makes the complexity and use of the type exponential.
* No obvious way to implement inline vectors (try with allocators if you want to sacrifice 500 lines to the gods and obtain shitty syntax).
* Fuck std::vector<bool>.
  And finally, but most importantly:
* It's fun to do your own stuff, not gonna lie.

I wonder if by the end of the post you will agree with me on that the result was actually pretty good.
And the benefits, many (for my use-case at least).

Pipe, the library I build the array for, is the base library I use on most of my cpp projects since ... 2013?? Time is scary. It has many great experimental features that I have failed to share as they deserve, because I am really lazy socially okay. Yo, its been like 2 years since the last post!
