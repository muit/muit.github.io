---
title: 'Making your own array: Optimizations'
date: 2023-10-23
draft: true
cover: Assets/Img/Covers/line-of-ducks.jpg
series:
- arrays
- memory
- pipe
---

Now that the previous post covered the general aspects of a possible array implementation, I can jump into more specific areas of this topic.

Lets talk about the different optimizations we can do on our array containers.

Keep in mind that, no matter how simple this optimizations may sound, they are easier to apply when the allocation of the container is simple. However with complicated types, inheritance or allocators, that obfuscate the memory operations of the container, they can become quite hard to achieve or even impossible unless the design changes substantially.

#### Prevent copy of trailing elements when reallocating

When the capacity of the array is exceeded (for example when adding enough items) the array will reallocate into a new buffer and then add those items.

This is done in multiple steps:

* copy elements to new buffer
* move elements after the insertion index N positions back
* initialize or copy new elements into their indices.
  An example where we want to add **D** at index 1 into \[A B C\]:
  \[- - - -\] -> \[A B C -\] -> \[A - B C\] -> \[A D B C\]

It is frequent to see this first two steps as separate, because the first one is usually part of reallocation, and the second one part of insertion.

However, we can optimize it by combining it into a single operation. I remember seeing the MSVC standard library doing this, but other big libraries don't.

So instead we copy the elements before the insertion point into the new buffer, and the trailing elements to where they would be in the new buffer:
\[- - - -\] -> \[A - B C\] -> \[A D B C\]

This means we don't move all the trailing elements twice when reallocating.

#### Reallocate data pointer as a bigger block

An arena can be asked to (when possible) resize a memory buffer. For arrays, this means we can prevent reallocations when our memory buffer is in reality bigger than the capacity of the array.

An arena may be keeping memory after our block available for different reasons and by asking it to extend it we are growing our array for free.

#### Remove Swap

This in practice is more of an optimization for the user to do.

For context to swap in an array means to switch the indices of two elements.
When we remove-swap we swap the one or more elements to be removed with the last elements, and then remove the last elements. This does NOT preserve order, but if we are okay with that, we wont have any trailing elements to displace.

An example where we want to remove **B** from \[A B C D\]:
\[A B C D\] -> \[A D C D\] B -> \[A D C B\] -> \[A D C -\]

We can also remove the elements before swapping them, then move the last elements rather than swapping them.
This can be more efficient because swapping requires a temporal value:
Temp = A
A = B
B = Temp

Therefore the example would become:
\[A B C D\] -> \[A - C D\] -> \[A D C -\]

This scales as well when we want to remove more than one elements.
E.g: 
Removing A B. \[A B C D E\] -> \[- - C D E\] -> \[D E C - -\]
Removing B C. \[A B C D E\] -> \[A - - D E\] -> \[A D E - -\]

#### Sorting operations

The quick answer to search elements fast in a container is usually a hash set or hash map, however in some very specific scenarios... an array can be faster. Around 2x faster to be specific.

Before you throw your keyboard at me, let me explain.

Using binary search on a sorted array of small elements (around 16 bytes or less), where this array is already sorted, is extremely fast.

In case you didnt know, binary search is an algorithm to search a sorted list by checking the middle of a section of the list repeatedly until the result is found.

If we had the array \[1, 3, 5, 8, 18\], we would search for 3 by checking the middle (5). If what we seek is smaller we search the middle to the left, so next we check 3.

This method produces a complexity of O(LogN) for search, which is less than that of iterating the array that is O(N).
In short, it is obviously faster than iterating the array in most scenarios, but it is a surprise to many, that it is also faster in certain scenarios than hashmaps and sets.

This is because hash containers usually have a more fractured memory design made out of blocks which reduces  the probability of cache hits. They also require hashing the element, which 

It is quite specific to meet all those conditions, but, at least in my case, it is useful way more often than what I originally expected.

It is often that we might have a preordered list of elements that we can use to access data quickly, and spoiler, some hash set implementations use this mechanism internally to relate hashes to their indices.

Until next time, Muit.
