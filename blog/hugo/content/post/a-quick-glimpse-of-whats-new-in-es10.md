---
title: "A quick glimpse of what's new in ES10"
date: 2019-03-27T05:30:31+05:30
draft: false
---

Here's a quick glimpse of all the TS10 features, that are part of the spec and have already been shipped with the latest version of Chrome:

1. Trim whitespaces only from start of a string

    ```
    " My String ".trimStart()

    // Produces:
    "My String "
    ```

2. Trim whitespaces only from end of a string:
    ```
    " My String ".trimEnd()

    // Produces:
    " My String"
    ```

3. Flatten an array:

      ```js
      [1, 2, 3, [4, [5, 6]]].flat()

      // Produces:
      [1, 2, 3, 4, [5, 6]]
      ```

4. Flatten an array to depth of 2:

      ```js
      [1, [2, 3], 4, 5, [6, [7 , 8]]].flat(2)

      // Produces:
      [1, 2, 3, 4, 5, 6, 7, 8]
      ```

5. Flatten the whole array:

      ```js
      [1, 2, [3], [
        [[4, 5, 6]],
        [[[[7, 8]], 9]]
      ]].flat(Infinity)

      // Produces:
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
      ```

6. Create objects from array like representation of the object:

      ```js
      Object.fromEntries(
        [
          ["key1", "value"], 
          ["key2", 37]
        ]
      )

      // Produces:
      Object { key1: "value", key2: 37 }
      ```

7. Create objects from a map:

      ```js
      Object.fromEntries(
        new Map([
          ["key1", "value"], 
          ["key2", 37]
        ])
      )

      // Produces:
      Object { key1: "value", key2: 37 }
      ```

8. Get symbol description from read-only property `.description`:

      ```js
      const sym = Symbol('foo');
      console.log(sym.description);

      // Outputs:
      foo
      ```

9. Catch without the once-mandatory parameter in catch block:

      ```js
      try {
        throw new Error("Some error");
      } catch {
        console.log('An error occured');
      }

      // Outputs:
      An error occured
      ```

10. Return source code of a function, verbatim, using `toString()` method:

      ```js
      const fn = (param1, param2) => {
        console.log(param1, param2);
      }

      console.log(fn.toString())

      // Outputs:
      (param1, param2) => {
        console.log(param1, param2);
      }
      ```
11. Return all matches (and capturing group) of a string against given regular expression:

      ```js
      const regexp = RegExp('l','g'); 
      const str = 'Hello world';
      let matches = str.matchAll(regexp);

      for (const match of matches) {
        console.log(match); 
      }

      // Outputs:
      Array ["l"]
      Array ["l"]
      Array ["l"]
      ```

12. Map then flatten the array using `flatMap`

      ```js
      [1, 2, 3, 4].flatMap(elem => [elem * 2])

      // Produces:
      [2, 4, 6, 8]
      ```

#### Are these features ready to be used?

Well, some are and some are not. You can check for browser or nodejs compatibility by looking up features on MDN.

For example:

- Array.prototype.flat()<sup>[1]</sup> is available in NodeJS 11, Chrome 69 and Firefox 62 and above.

Nevertheless these are some really interesting additions to JavaScript and more is on the way.

Links and more:

[1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#Browser_compatibility

[2] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt

[3] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap