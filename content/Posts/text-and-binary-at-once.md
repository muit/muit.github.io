---
title: Text and Binary serialization at once
date: 2022-04-30
draft: true
cover: Assets/Img/Covers/chips.png
series:
- serialization
---

For many years, I have often been "*the serialization guy*" in my roles around the games industry. And for all that time, I never really liked that much the different frameworks on the topic I used.

This being the case, and me having an awful number of irresponsibly complicated projects that needed serialization, forced me to play a little bit deeper and make my own.

And I did it (to the surprise of no one who has read any of my previous posts) as part of **[Pipe](https://github.com/PipeRift/pipe)**.

## What is serialization?

In short, **serialization** is simply transforming memory into a format like, for example, json. Formats can be textual or binary based, where json is textual, and bson is its binary counterpart.

Serialization is used extensively for game assets, file formats, web, networking, etc.

In the case of [**Rift**](https://github.com/PipeRift/rift) it is used for files, networking and capturing transactions (your everyday *ctrl+z*).

### Structured formats

Something that will be relevant later are structured formats. Structured means the read order does not matter, often meaning each value is identified in some way as unique.

Binary is usually non structured, while json is, because it uses labels to identify each field.

Non-structured formats instead must be read in the order they were written or they will fail or load corrupted data, but in exchange, they are usually faster and more memory efficient.

## Pipe's Serialization

Pipe has an unusual approach to serialization. It is at least partially inspired by immediate mode UI, in the sense that the serialization is done directly how it is spelled in the code.

Should be said that this system handles serialization exclusively. Saving the actual files or sending packets are completely different topics down to the implementation.

This system does support both structured and not-structured formats with the same syntax.
It aims to provide great performance while allowing users to only define serialization once and easily.

### Concepts

![serialization-elements](Assets/Img/serialization-elements.png)

* **Reader & Writer**: Defines the operation to be used (read or write) and stores state that gives serialization context on how and why serialization is happening.
* **ReadWriter**: Can both read and write depending on the parent context.
* **Format**: Contains the format to use and the source or destination of the data.

### Syntax

We first need to create a format of our choice. Then a ReadContext to read from it. A read context will read from a buffer containing the serialized data.

````cpp
p::JsonFormat format{};
p::Reader ct{format}; // Create the context

int health = 0;
ct.Next("health", health); // Read variable "health"
````

As you can see in "Next", every field that is serialized is identified with a name. In non-structured formats, like raw binary, this name is entirely ignored with zero cost to performance.

### Fields

Even if the format is not structured, pipe ensures the correct formation of data using fields. There are three main types of fields: Values, Arrays and Objects.

The fields of a format are iterated the way we choose, and in our syntax we tell the program where we want to be.

For example with the following json data

````json
{
    "state": "running",
    "player": {
        "health": 100
    }
}
````

we can iterate its fields by using Next(name).
If we call Next("state") we are in the field state. If we then call Next("player") we are in the field player.

Objects and Arrays are the equivalent of objects and arrays in json, or lists in yaml. To start iterating an array or object, we need to tell the system to enter them.

#### Values

Values are fields that contain a single value like an string, integers or floats.
To read a value we call `Serialize(value)`, which will read or write a value from the current field we are in.

#### Objects

Objects are lists of inner fields identified by name.

````cpp
// Open an object for editing
if (ct.Object("player"))
{
    //Read a property inside the object "player"
    int player= 0;
    ct.Next("health", health);
    // Leave the object's scope
    ct.Leave();
}
````

If an object is not found in the data, EnterObject returns false, preventing us from reading data that does not exist.

#### Arrays

Arrays are lists of fields identified by index.

````cpp
// Open an object for editing
int count = 0;
if (ct.EnterArray("cities", count))
{
    p::String city;
    // we can iterate the array
    while(ct.Next(city)) {}

    // or use indices
    for(int i = 0; i < count)
    {
        ct.Next(i, city);
    }
    // Leave the array's scope
    ct.Leave();
}
````

If an array is not found in the data, EnterArray returns false and count 0, preventing us from reading data that does not exist.

## Serializers

Types can define their own serialization functions for reading, writing, or both, meaning we can call Next on any type as long as they implement a Read and Write functions.

They would look something like:

````cpp
struct Player
{
    int health = 0;

    // As friend inside the type:
    friend void Read(const p::Reader& reader, Player& player)
    {
        if(ct.EnterObject())
        {
            ct.Next("health", player.health);
        }
    }
};
````

## Tags

Tags are provided and set by scope. They can be pushed and popped making their use in fragments of the serialization very intuitive while remaining as performant as they could be.

````cpp
ct.PushTag(CacheStrings);
ct.Next(stringData);
ct.PopTag();
````

<br>

Consider having a look at [**Rift**](https://github.com/PipeRift/rift), which is a visual compiled programming language.
It would be incredibly helpful to get your ideas, feedback and/or code contributions!
