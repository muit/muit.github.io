---
title: "Implementing a General Arena"
date: 2021-04-03
draft: true
series:
- memory
---

Now that we have learned about **[arenas and allocators]({{< relref "introduction-to-allocators-and-arenas" >}})**, we can get our hands dirty with an implementation of an arena.

## Best Fit Arena

You see, for the last couple of months, I've been updating [**RiftCore**](https://github.com/PipeRift/rift-core) with new features.
**RiftCore** is a cross-platform framework I use for C++ projects, and it lacked some memory management.

So the time came to design a general-purpose arena!

This article will describe the design and implementation of a **Best Fit Arena**.
Feel free to come up with a better name though (and put it in the comments below!)


## General-purpose?

A general-purpose allocator (or arena) must be able to work on all scenarios with out any big limitation.
As such, it has to be able to:
- **Allocate** in any order and any size
- **Deallocate** in any order
- Use (and reuse) all space available
- Minimize fragmentation

In RiftCore, Arenas always carry the `size` of the pointer in their `Free()` function.
This opens the door to some optimizations, but, don't worry, the BestFitArena can be adapted to avoid this pattern.


## Implementation

A **BestFitArena** works by **tracking all unused spaces**, called free slots.
![BestFitArena](/img/best-fit-arena-slot-ids.png)

Let's go through what we see in this picture:

- Like most allocators, we have one or multiple memory blocks of pre-allocated memory.
- We also keep a list of `FreeSlots`, sorted by size. Bigger first.
- We don't track allocations in any way. No headers, no offsets and no sizes.

![BestFitArena Slot Pointers](/img/best-fit-arena-slot-ptrs.png)
Seen in more detail, each slot points to the start of an slot, and its size.


This algorithm has **zero overhead** when fragmentation is low. The less fragmentation, the more performant it is.
However, it is also designed to minimize it, and, as you will see later, even in an scenario with a lot of fragmentation, performance is still excellent.

### Allocation
![BestFitArena Slot Pointers](/img/best-fit-arena-allocation.png)

**Allocation** will always pick the smallest free slot possible and extract the pointer from it.
Then, this slot is reduced removing the used space from it.
```cpp
// note: Alignment has been omitted for simplicity
void* BestFitArena::Allocate(const sizet size)
{
    const u32 slotIndex = FindSmallestSlot(size);
    if (slotIndex >= freeSlots.Size())
    {
        // error: "Couldn't fit {} bytes", size
        return nullptr;
    }

    Slot& slot      = freeSlots[slotIndex];
    u8* const start = slot.start;
    u8* const end   = start + size;

    ReduceSlot(slotIndex, slot, start, end);
    return start;
}
```

#### Find Smallest Slot

Before anything else, we check if the arena is marked as pending sort.
This is an optimization that prevents unneccesary sorts on consequent Free calls.
But we also perform shrink on the slots if neccessary.

Once we know all slots are sorted, we perform a [binary search](https://www.geeksforgeeks.org/binary-search/) by size.
The binary search will provide a complexity of O(logN).

```cpp
i32 BestFitArena::FindSmallestSlot(sizet neededSize)
{
    if (pendingSort) [[unlikely]]
    {
        pendingSort = false;
        if (float(freeSlots.Size()) / freeSlots.MaxSize() < 0.25f)
        {
            // Dont shrink until there is 75% of unused slots
            freeSlots.Shrink();
        }
        // Sort slots by size. Small first
        freeSlots.Sort([](const auto& a, const auto& b) {
            return a.size > b.size;
        });
    }

    // Find smallest slot fitting our required size
    return Algorithms::LowerBoundSearch(
        freeSlots.Data(), freeSlots.Size(), [neededSize](const auto& slot) {
            return neededSize <= slot.size;
        });
}
```

#### Reduce Slot
```cpp
void BestFitArena::ReduceSlot(
    i32 slotIndex, Slot& slot, u8* const allocationStart, u8* const allocationEnd)
{
    if (allocationEnd == slot.GetEnd())    // Slot would become empty
    {
        if (allocationStart > slot.start)    // Slot can still fill alignment gap
        {
            slot.size = allocationEnd - allocationStart;
            pendingSort = true;
        }
        else
        {
            freeSlots.RemoveAtChecked(slotIndex, false);
        }
        return;
    }

    u8* const oldSlotStart = slot.start;
    slot.size += slot.start - allocationEnd;
    slot.start = allocationEnd;

    // If alignment leaves a gap in the slot, save this space as a new slot
    if (allocationStart > oldSlotStart)
    {
        freeSlots.Add({oldSlotStart, sizet(allocationStart - oldSlotStart)});
    }
    pendingSort = true;
}
```


### Free



