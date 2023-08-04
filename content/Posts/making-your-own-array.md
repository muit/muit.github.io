---
title: Making your own array
date: 2023-08-01
draft: false
cover: Assets/Img/Covers/line-of-ducks.jpg
series:
- arrays
- memory
- pipe
---

Just use **std::vector**.

Which is what I did until a some weeks ago, when I decided enough was enough!

It was about time I made an array type for the needs of my library. So in this post I am going to go through the design decisions taken while doing so. Creating a custom array container.

## Why a custom array?

Until now, I used a wrapper around `std::vector`, which was okay...  no, really. But:

* It makes solutions to simple problems unnecessarily complex.
* Its API almost completely built using iterators.
* It has a allocator types on the template
* There is no built-in (or easy) way to have inline memory (try with allocators if you want to sacrifice 500 lines of code to the gods and obtain shitty syntax in return).
* It has an extensive & rigid API with years of features that I don't want or need to maintain.
* Fuck `std::vector<bool>`. Burn it.
  And many others really, but most importantly:
* **It's fun to do your own stuff some times**, not gonna lie.

These points are not necessarily the wrong choice for the standard library considering its scope, but for me, they **very much are**.

We, humans, should understand how the tools we use work. Otherwise we could be using them the wrong way or the wrong tool. Containers are a tool like any other.
If you ever read code inside std::vector, no matter which std implementation it was, I wouldn't be surprised if you chose to not stick around.

Std implementations are often unintelligible, in good part because the design they are built on top of has a long list of requirements that adds up.

Some honorable mentions from the previous points:

* The iterator based API forces functions to be their own templates, where parameters could be iterators of any type, and many extra checks need to be run. The abstraction layer it adds over simply using indexes is not for free either.
* Allocators make compatibility across otherwise equivalent vectors a nightmare, tries to solve memory allocation yet fails to be of real use in real scenarios, and multiplies the number of compiled class variations (which makes builds slower). Not forgetting it also guarantees a complex implementation.

## About Pipe's Requirements

**[Pipe](https://github.com/PipeRift/pipe)**, the library that will contain these shiny new arrays, is the foundational library I use on most of my Cpp projects. It has many great experimental features that I have repeatedly failed to share with others like they deserve.

I have used this library for more than 9 years, and overcoming the limitations of std::vector was increasingly frustrating. Specially when I needed to scratch extra performance with features like inline memory.

 > 
 > *By "**inline memory**" I mean having N items contained directly inside the array's instance)*

I needed an Array type that:

* Natively supports inline memory, without sacrificing the syntax or user experience.
* Integrates with *arenas* to control the memory it allocates.
* Has a combined index and iterator based API with an extensive list of helpers.
* Its implementation MUST be simple.

## The Implementation

Lets see how we can achieve reasonable simplicity for arrays.

In **Pipe** any container with a contiguous list of elements, whether it owns it or not, inherits from **IArray** (new name suggestions are welcome). This class is not intended for the user to use directly, but it provides shared functionality for **finding, checking, sorting, swapping** and **iterating** the elements in the list.

Two classes use IArray (and some aliases too):

* **View**: Points to **one or more contiguous elements** that **it does not own**. These elements can be literals, arrays, or any other pointer with a size. Equivalent to std::span, or what is sometimes called an "ArrayView".
* **InlineArray**: **Owns a contiguous, variable list of elements**. It can use an optional inline buffer for performance. Because of this, it **does not use allocators**. Equivalent (to an extent) to std::vector or other array implementations.
* **Array**: An alias for **InlineArray** with an inline buffer size of 0, meaning it uses exclusively allocated memory.

There can be other aliases like “**SmallArray**” that use different combinations of the inline buffer, but the point is that there is a single implementation class for arrays.

### Allocation

Lets go back to “*does not use allocators*”:

Over the years, I have seen and used many implementations of arrays. Like everything, they have advantages and disadvantages. It is a balance. However, those that used templated allocators were specifically rigid, verbose or complex (or all those three).

Usually you want to solve two problems with allocators:

* Control how and where the container’s memory is allocated.
* Inject and use inline elements in the container.
  Optionally, you may want to share this allocators with different containers.

Sharing allocators sounds ideal, but is very problematic when you also want to achieve the other points. Different containers allocate differently. If an allocator is used in an array you know it only needs to maintain a single block of memory. However *maps*, *sets* or *page buffers* don't work this way, and can allocate many blocks. They have requirements that can be incompatible with each other.

Most allocators also need to know the type the container holds, so they need to be templates. They have a dependency between the memory and the type since many times they are the ones doing the copying of elements, among other operations.

 > 
 > Okay, but they surely must have many uses… right?

I think it is pretty rare, would even dare to say extremely rare, to see in your everyday life a container allocator that is **not** for inline memory or for a very specific use.

If we imagine we had an "inline allocator" in different APIs it could look like:

````cpp
std::vector<String, InlineAllocator<String, 5>> values; // standard library
TArray<String, InlineAllocator<5>> values; // unreal engine
````

In Pipe, this would look a bit different:

````cpp
TInlineArray<String, 5> values;
````

I choose to split the problem of allocation:

* **Inline memory** is handled by the array itself.
* **Allocated memory** is handled by arenas.

#### Inline memory

**Inline buffers** are handled by the array itself.
When we use for example `TInlineArray<T, 5>` the array will be able to hold up to **5** inline elements. If we exceed this capacity it will use allocation. Similarly, if it fits, it will move to inline from allocation.
Of course, you can assign an inline buffer of size 0, this is actually very common.

The user does not need to remember how to use inline memory since it is always available on the container.

#### Allocated memory

**Memory allocation** is handled exclusively by **arenas**.
Arenas handle allocation following a particular algorithm. They are non-templated, and completely independent from the container itself.

 > 
 > **To give you an example**: I use them for reflection, where a single linear arena is assigned to all containers allocating reflection data. This means reflection has great data locality and reduces cache misses. It makes operations like checking inheritance much faster since we access memory that is very close.

An array can be assigned an arena during its construction.

````cpp
MultiLinearArena arena;
TArray<String> names{arena};
````

When no arena is provided, a global or scope arena is used. *I should write another post about arenas...*

With this design, an array can copy or move to another array with a different arena seamlessly, just like it does with the inline buffer. No extra code is needed to achieve arenas or inline, and if we need to control allocation, we can use an arena of our choice.

### Indexes

On the topic of indexes, there is not that much to mention.

Simply put, most of the functions in TArray prefer indexes or counts over iterators.
This makes their use and implementation easier.

````cpp
void Insert(i32 atIndex, const Type& value);
bool RemoveAt(i32 index, const bool shouldShrink = true);
Type* At(i32 index) const;
````

Of course, iterators are still supported to allow range-for or iterator algorithms, but the API prefers the use of indexes for simplicity.

### Unsafe

Sometimes when we work with arrays we might know the inputs we provide are safe. For that reason many functions in Pipe have an **unsafe** version which skips some safety checks. Use them at your own risk.

This can help gain back some performance in the large scale of things.

Very often the safe versions simply call the unsafe version after running those checks:

````cpp
bool RemoveAt(i32 index, const bool shouldShrink)
{
	if (IsValidIndex(index))
	{
		RemoveAtUnsafe(index, shouldShrink);
		return true;
	}
	return false;
}

void Swap(i32 firstIdx, i32 secondIdx)
{
	if (IsValidIndex(firstIdx) && IsValidIndex(secondIdx) && firstIdx != secondIdx)
	{
		SwapUnsafe(firstIdx, secondIdx);
	}
}
````

Their API will always contain 'Unsafe' at the end. This makes it likely that safe versions show up first while coding, and continuously gives a hint of their risk to the user.

## Final Notes

For anyone interested in having a look at the full implementation you can find it **[here (PipeArrays.h)](https://github.com/PipeRift/pipe/blob/feature/custom-arrays/Include/Pipe/PipeArrays.h)** along with the library (**[Pipe](https://github.com/PipeRift/pipe)**).

I am sure I also forgot important details or didn't explain something correctly, so feel free to leave a comment and feedback, and if you happened to like it, let me know! I don't write often but your encouragement will help :)

Finally, I am aware that topics like this have such a wide amount of uses that my described solution (that works for *my needs*) will be as good for some as it will be bad for others. Lets keep it a constructive conversation anyway.

Until next time, Muit.
