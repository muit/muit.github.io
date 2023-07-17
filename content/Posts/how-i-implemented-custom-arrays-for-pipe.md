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
  And many others really, but most importantly:
* It's fun to do your own stuff, not gonna lie.

I wonder if by the end of the post you will agree with me on that the result was actually pretty good.
And the benefits, many (for my use-case at least).

For context, Pipe, the library that contains these shiny new arrays, is the base library I use on most of my cpp projects. It has many great experimental features that I have repeatedly not talked about like they deserve. But one not so shiny was a wrapper around std::vector with extra features and an API that fits the library.

I've used this library for more than 9 years and it was about time I did a proper rework of Array.

### The biggest differences

Even if this container works in a different way to std::vector internally, most of its functionality remains, so many of the functions can be found and work in a similar way.

No allocators, no specific inline containers, no policies.
TInlineArray\<T, N> is the array for any use, where T is the type, and N the inline buffer size.
There is an alias TArray<T>, which simply refers to a TInlineArray\<T, 0>, with no inline buffer.

They all inherit a base type IArray, which simply represents the data pointer and size. This is also used by TView (more on that later).
