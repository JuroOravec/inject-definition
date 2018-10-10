# inject-definition

[![Build Status](https://travis-ci.org/JuroOravec/inject-definition.svg?branch=master)](https://travis-ci.org/JuroOravec/inject-definition) [![Coverage Status](https://coveralls.io/repos/github/JuroOravec/inject-definition/badge.svg?branch=master)](https://coveralls.io/github/JuroOravec/inject-definition?branch=master)

Injection of user-defined code, definitions, macros, constants or other snippets to a text simply by defining the snippets and including the definiton keyword in the text. Insertion formatting is customizable for compatibility with other programming languages.

## Installing

Install via npm

```
npm install inject-definition
```

Install via yarn

```
yarn add inject-definition -S
```

Import and initialize with `.init()`

```javascript
const injectDefinition = require("inject-definition");
const mathDefinitions = injectDefinition.init();
```

### Initialisation options

`init()` accepts an object of options with the following properties:

```javascript
{
- **`definitions:`**`object`
// To customize the formatting of inserted definitions, override these:
- **`declarationFormatter:`**`function`
- **`minifier:`**`function`
- **`variableNameReplacer:`**`function`
- **`variableNameRetriever:`**`function`
}
```

See **API > Properties** for the descriptions of individual properties.

## Overview

To inject definitions into a text, you need to:

1. Create (define) new definitions with `define()`.
2. Activate or deactivate those definitions that should/should not be used with `activate()` and `deactivate()`. Deactivated definitions will be ignored when processing a text with definitions. (Note: new definitions are active by default)
3. Inject the definitions into the text with `inject()`.

To get a list of names of definition found in text, use `scan()`.

To get a list of values of definitions found in text, use `generate()`.

`inject-definition` can be also used for injecting snippets that are formatted for other languages than JS. Consider definiting your own `variableNameReplacer`, `variableNameRetriever`, `declarationFormatter` methods if this is the goal.

Additionally, `minifier` function can be provided, which allows to minify the injected definitions of `inject()` or the output of `generate()`.

## Examples

#### 1. Add new definitions

```javascript
// Define non-string types
mathDefinitions.define("multiply.double", function double(x) {
  return 2 * x;
});
mathDefinitions.define(
  "multiply.triple",
  function triple(x) {
    return 3 * x;
  },
  { activate: false }
);

// Define strings that can be later interpreted as a variable
mathDefinitions.define("constants.number.e", "const e = 2.71828;");
mathDefinitions.define("constants.number.pi", "const pi = 3.1415;");

// Definitions can depend on each other. The dependency definitions will be
// automatically added along with the injected definitions.
mathDefinitions.define(
  "constants.number.twoPi",
  "const twoPi = 2 * constants.number.pi;"
);

// Specify if the definition should be inactive on defining.
mathDefinitions.define(
  "constants.number.threePi",
  "const threePi = 3 * constants.number.pi;",
  {
    activate: false
  }
);
```

#### 2. Remove a single or a group of existing definitions

```javascript
// undefines `constants.number` and all its children definitions
mathDefinitions.undefine("constants.number");

mathDefinitions.has("constants.number.pi"); // false
mathDefinitions.has("constants.number.e"); // false

// alternatively use undefineAll to undefine all, all active or all inactive definitions.
mathDefinitions.undefineAll();
```

#### 3. Activate or deactivate a single definition or all definitions of certain activity type

```javascript
mathDefinitions.deactivate("constants.number");
mathDefinitions.activate("multiply.double");

// alternatively use activateAll or deactivateAll to (de)activate all, all active or all inactive definitions.
mathDefinitions.activateAll();
mathDefinitions.deactivateAll();
```

#### Inject definitions into a text that might include defined keywords.

```javascript
mathDefinitions.define("multiply.double", function double(x) {
  return 2 * x;
});
mathDefinitions.define("constants.number.pi", "const pi = 3.1415;");
mathDefinitions.has("constants.number.pi"); // true

const snippet = "const x = multiply.double(32 + constants.number.pi);";

// `inject` injects the definitions into a string
mathDefinitions.inject(snippet, { reference: true });

// function _double0(x) {    // injected function
// return 2 * x;
// }
// const _pi0 = 3.1415;     // injected variable
// var multiply = { double: _double0}    // injected definitions objects
// var constants = { number: { pi: _pi0 }}
// const x = multiply.double(32 + constants.number.pi);    // original snippet
```

#### Get names or values of the definitions found in the text

```javascript
const snippet = "const x = multiply.double(32 + constants.number.pi);";

// `scan` returns a list of names found definitions.
mathDefinitions.scan(snippet); // ['multiply.double', 'constants.number.pi']

// `generate` returns a list values of found definitions.
mathDefinitions.generate(snippet); // [function double(x), "const pi = 3.1415;"]
```

#### Check for existence or get a definition's value

```javascript
mathDefinitions.define("constants.number.e", "const e = 2.71828;");
mathDefinitions.define("constants.number.pi", "const pi = 3.1415;");

mathDefinitions.get("constants.number.e"); // 'const e = 2.71828;'
mathDefinitions.has("constants.number.pi"); // true
```

## API

## **Properties**

### definitions

An object of definitions stored as a tree of nested definition objects. Each definition object has following structure:

```javascript
{
  keyword: string; // Keyword thar recognises the definition.
  value: any; // Any value stored as the definition
  children: {
    foo: definitionObject;
    ...
  } // An object of children definition objects.
  active: boolean // Boolean of whether the definition is active.
}
```

### declarationFormatter

A function that defines how definitions objects should be formatted when `inject` has option `reference: true`.

E.g. if given a definition object `'foo'`, which has structure `{'bar': 42}`, the `declarationFormatter` may format this as `var foo = {'bar': 42}` (Default).

`declarationFormatter` accepts a function of type `(definitionsObjectName: string, definitionsObject: object) => string`

### minifier

A function that minifies a string of stringified definitions values of definitions found through `generate()` or `inject()`. There is no default minification.

`minifier` accepts a function of type `(stringifiedDefinitions: string) => string`

### variableNameRetriever

A function that returns the name of a variable (if there is one) that is being declared in a definition. Necessary for customizing the formatting of declared values. Default function handles simple JS declarations with `const`, `let`, `var` and `function` keywords (no unpacking).

`variableNameRetriever` accepts a function of type `(definition: string) => string`

### variableNameReplacer

A function that replaces a variable name (same as the one found with `variableNameRetriever`) with a new name. Necessary for customizing the formatting of declared values. Default function handles simple JS declarations with `const`, `let`, `var` and `function` keywords (no unpacking).

`variableNameReplacer` accepts a function of type `(definition: string, oldVariableName: string, newVariableName: string) => string`

---

## **Methods**

### define(_path, definition[, options]_)

Creates a new definition.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .
**`definition:`**`any` - Value of the definition. This can be anything.
**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`activate:`**`boolean` - Whether the definition should be automatically activated. Inactive definitions will be ignored when scanning / generating / injecting text. Default: `true`

### undefine(_path_)

Removes a definition.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

### undefineAll()

Removes all definitions of a certain type.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`select:`**`'all'`|`'active'`|`'inactive'` - Type of definitions that should be removed. Either all definitions, only active definitions or only inactive definitions. Default: `'all'`

### activate(_path_)

Activates a definition. Active definitions are included when scanning / generating / injecting text.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

### activateAll()

Activates all definitions. Active definitions are included when scanning / generating / injecting text.

### deactivate(_path_)

Deactivates a definition. Inactive definitions will be ignored when scanning / generating / injecting text.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

### deactivateAll()

Deactivates all definitions. Inactive definitions will be ignored when scanning / generating / injecting text.

### get(_path[, options]_)

Retrieves value of a definition specified by path. Returns undefined if no definition can be found.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`select:`**`'all'`|`'active'`|`'inactive'` - Type of definitions that will be searched through. Either all, all active or all inactive definitons. Default: `'all'`

### getAll()

Retrieves the definitions tree.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`select:`**`'all'`|`'active'`|`'inactive'` - Type of definitions that populate the tree. Either all, all active or all inactive definitons. Default: `'all'`

- **`type:`**`'full`|`'partial'`|`'condensed'` - Type of structure of each node in the tree. Default: `'full'`
- - With `'full'`, each node has all properties (`value`, `keyword` , `active`, `children`).
- - With `'partial'`, each node has only `value` and `children` properties.
- - With `'condensed'`, each node is either an object of children nodes, or a value. (Note: Definitions that are not on terminal nodes are omitted from the condensed structure).

### has(_path[, options]_)

Checks if a definition specified by a path exists, and returns `true` if so. Returns `false` otherwise.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`select:`**`'all'`|`'active'`|`'inactive'` - Type of definitions that will be searched through. Either all, all active or all inactive definitons. Default: `'all'`

---

### scan(_targetText[, options]_)

Returns the keywords (names) of definitions that were found in `targetText`. Only active definitions are included.

**`targetText:`**`string` - A string to be scanned for definitions.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`delimeter:`**`string | false` - A string that joins the found definition keywords into a string. If set to `false`, an array of definition keywords is returned instead. Default: `false`

- **`overwrite:`**`boolean` - Whether only the definitions found in `targetText` should be set as active. Deactivates all other definitions.

### generate(_targetText[, options]_)

Returns the values of definitions that were found in `targetText`. Only active definitions are included.

**`targetText:`**`string` - A string to be scanned for definitions.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`delimeter:`**`string | false` - A string that joins the found definition values into a string. If set to `false`, an array of definition values is returned instead. Default: `false`

- **`minify:`**`boolean` - Whether the resulting string should be minified according to the `minifier` function. Has effect only when `delimeter` is a string. Default: `false`

- **`overwrite:`**`boolean` - Whether only the definitions found in `targetText` should be set as active. Deactivates all other definitions.

### inject(_targetText[, options]_)

Returns `targetText` with definitions injected. Only active definitions are included.

**`targetText:`**`string` - A string to be scanned for definitions.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`delimeter:`**`string` - A string that joins the found definitions.
  Default: `'\n'`

- **`insertLocation:`**`string` - A string specifying the location where the definitions should be inserted. Available values: `'start'`, `'end'`, `'replace'`. Default: `'start'`

- **`minify:`**`boolean` - Whether the injected definitions should be minified according to the `minifier` function. Default: `false`

- **`overwrite:`**`boolean` - Whether only the definitions found in `targetText` should be set as active. Deactivates all other definitions.

- **`reference:`**`boolean` - Whether the definition keywords found in `targetText` can be used as references. E.g. if `targetText` contains definition `'foo.bar'`, which defines a function `bar`, then setting `reference` to `true` allows to use `foo.bar` in-text as a function, e.g. `foo.bar(x)` To enable this, a tree of definition objects for each of the top-level keywords is inserted after the definitions, e.g. `var foo = {bar: function(x){...}}`. Useful if the definitions are nested (E.g. `'a.b.c'`), and the definition values are programmatically referenced. (Note: Only terminal nodes can be referenced, e.g. `foo.bar`, but not `foo`). Default: `false`

- **`separator:`**`string` - A string that joins definitions with the original text. Default: `'\n'`

## Running the tests

Run tests with

```
npm test
```

or

```
yarn test
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/JuroOravec/inject-definition/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Change-log

- **2.0.0**
- - Reworked definition tree structure and removed `activeDefinitions` object.
- - Removed `activeDefinitions` option from `init()` options.
- - Added `undefineAll()`
- - Added `activateAll()`
- - Added `deactivateAll()`
- - Added `getAll()`
- - Minifier affects only the string of joined definitions, not the original text
- - Renamed options property `overwriteActiveDefinitions` to `overwrite`.
- - Renamed options property `includeDefinitionsObjects` to `reference`.
- - If definitions use other definitions these dependency definitions will be automatically included.

* **1.0.0** - Initial release.

## Authors

- [**Juro Oravec**](https://github.com/https://github.com/JuroOravec)

See also the list of [contributors](https://github.com/JuroOravec/inject-definition/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License.
