---
title: How I implemented custom arrays for Pipe
date: 2023-07-12
draft: true
cover: Assets/Img/Covers/line-of-ducks.png
series:
- pipe
---

Just use **std::vector**.

Which is what I did until a some weeks ago, when I decided enough was enough! It was about time I made an array type for the needs of my library (*Pipe*).

## Why

Until now, I used a wrapper around std::vector, which was okay (no, really) but...

* It makes solutions to simple problems unnecessarily complex.
* Its API almost completely built using iterators.
* It has a templated allocator types.
* There is no built-in (or easy) way to use inline memory (try with allocators if you want to sacrifice 500 lines of code to the gods and obtain shitty syntax in return).
* It has an extensive & rigid API with years of features that I dont want or need to maintain.
* Fuck `std::vector<bool>`. Burn. It.
  And many others really, but most importantly:
* **It's fun to do your own stuff** some times, not gonna lie.

These points are not necessarily the wrong choice for the standard library considering its scope, but for me they **very much are**.

We, humans, should understand how the tools we use work. Otherwise we could be using them the wrong way, or the wrong tool. Containers are a tool like any other.
If you ever read the code inside std::vector, no matter which std implementation it was, I wouldn't be surprised if you were not too keen to stick around.

That is, in good part, because the design it is built on top of carry an exponential amount of complexity.
Some honorable mentions from above:

* The iterators based API force functions to be their own templates, where parameters could be iterators of any type, many checks need to be run. The abstraction layer iterators provide over using indexes is not free either.
* Allocators make compatibility across otherwise equivalent vector types a nightmare, tries to solve memory allocation yet fails to be of real use, and multiplies the number of compiled class variations (which makes builds slower). Not forgetting it also guarantees a horrible implementation.

For context, Pipe, the library that contains these shiny new arrays, is the base library I use on most of my cpp projects. It has many great experimental features that I have repeatedly not talked about like they deserve. But one not so shiny was a wrapper around std::vector with extra features and an API that fits the library.

I've used this library for more than 9 years and it was about time I did a proper rework of Array.

### The biggest differences

Even if this container works in a different way to std::vector internally, most of its functionality remains, so many of the functions can be found and work in a similar way.

No allocators, no specific inline containers, no policies.
`TInlineArray<T, N>` is the array for any use, where T is the type, and N the inline buffer size.
There is an alias `TArray<T>`, which simply refers to a `TInlineArray<T, 0>`, with no inline buffer.

They all inherit a base type IArray, which simply represents the data pointer and size. This is also used by TView (more on that later).

## Design Choices

Lets see how we can achieve reasonable simplicity for arrays.

In Pipe any container with a contiguous list of elements, wether it owns it or not, inherits from IArray (new name suggestions are welcome). This class is not intended for the user to use directly, but it provides shared functionality for finding, checking, sorting, swapping and iterating the elements in the list.

Two classes use IArray (and some aliases):

* **View**: Points to one or more contiguous elements that it does not own. These elements can be literals, arrays, or custom feed. Equivalent to std::span, or what is sometimes called an “ArrayView.
* **InlineArray**: It owns a contiguous, variable list of elements. It can use an inline buffer for improved performance. Because of this it does not need specific allocators. Equivalent (to an extent) to std::vector or other array implementations.
* **Array**: An alias for InlineArray with a buffer size of 0, meaning it uses exclusively allocated memory.

There are other aliases like “SmallArray” that use different combinations of the inline buffer, but the point is that there is a single implementation class for arrays, no matter if it uses inline buffers or not.

Lets touch the topic of “no allocators”.

Over the years, I have seen and used many implementations of arrays. Like everything, they have different advantages and disadvantages, it is a balance. However, those that used templated allocators were specifically rigid, verbose or complex (or all those three).

Usually you want to solve two problems with allocators:

* You want to control how and where the container’s memory is allocated.
* You want to inject and use inline elements in the container.
* Optionally, you also want to share this allocator with different containers.

The third one is cute, but very problematic when you want to also achieve the other points. Different containers allocate differently. If an allocator is used on an array you know you only need to maintain a single block of memory, however maps, sets or page buffers don't work this way, and can allocate many.

You can’t use an inline allocator for different types if you dont know how you will use the memory. The best you can do is give it an specific size of memory, which is not very convenient.

Not to mention, allocators like these need to be templated. They need to know the type they work with (in most cases) to understand, again, how that memory is used.

Okay, but they surely must have many uses. Their complexity is justified… right?

I think it is pretty rare, would dare to say extremely rare, to see an allocator that is **not** for inline memory handling in your everyday life.

The approach I took, was a bit different. Following the memory architecture of Pipe, I used arenas to control where allocated memory is stored and how. They are provided on construction.
