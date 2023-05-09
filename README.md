# typescript-type-forcer

A simple utility lib designed to enforce typescript's types on parses :)

----------------------------------------------------

### Installing:
`npm install type-forcer`

----------------------------------------------------

### Using:
There are 3 main functions:

* `forceObjectType`:
    * Ensures the object has all of the desired class' required properties **recursively**, throws `MissingFieldException` if any required property is null or undefined;
    * Recreates the object with all previous values and all the desired class' functions working as they should be.
    * Ex.: `const myObject = forceObjectType(request.body, MyRequestClass, modelIndex)`

* `forceArrayType`:
    * Uses `forceObjectType` to fix all objects within the array.
    * Ex.: `const myObjectList = forceArrayType(request.body, MyRequestClass, modelIndex)`

* `is`:
    * Utility function to compare an object with the desired class name.
    * Ex.: `const isMyException = is("MyCustomExceptionClass", error)`


What is `modelIndex`?
> When we are converting an object into a class recursively, we must check every level of the object to see if there is another object also needed to be transformed. That problem is easily solved by getting the new class' name and making a new instance of it. modelIndex is literally the file where you must index all of the classes you wish to use in the transformations. Following is an example:

Inside your modelIndex.ts
```
export * from "./models/myRequest.ts"
export * from "./models/myResponse.ts"
```

Using it
```
import * as modelIndex from "./models/modelIndex.ts"
```

----------------------------------------------------

### Why should I use your library?
Imagine we have the following classes:

```
class CustomClass {
    constructor(
        public firstParam: string,
        public secondParam: number,
        public thirdParam: AnotherClass
    ) {}

    doSomething() {
        // Do something
    }
}

class AnotherClass {
    constructor(
        public firstParam: string,
        public secondParam: string
    ) {}

    doSomethingElse() {
        // Do something
    }
}
```

If we receive an object like so:
```
{
    "firstParam": "1",
    "thirdParam": {
        "firstParam": "1",
        "secondParam": "2"
    }
}
```
And we straight up cast it to our type like so:
`const myObject = jsonObj as CustomClass`
Typescript will just let it slide but it won't make sure that any of the required properties are actually there and none of our functions will work so we won't really have the class we desired, it's only a fake.

By using type-forcer, we make sure our parse is not a fake, but it also **transforms** the object into the actual class.
