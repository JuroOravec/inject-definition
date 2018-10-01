# inject-definition

[![Build Status](https://travis-ci.org/JuroOravec/inject-definition.svg?branch=master)](https://travis-ci.org/JuroOravec/inject-definition) [![Coverage Status](https://coveralls.io/repos/github/JuroOravec/inject-definition/badge.svg?branch=master)](https://coveralls.io/github/JuroOravec/inject-definition?branch=master)

NPM package for injecting user-defined definitions, macros, constants or other snippets to a text simply if corresponding keywords are present.

## Installing

Install via npm

```
npm install inject-definition -S
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

`init([options])` accepts an object of options with the following properties:

- **`activeDefinitions:`**`object`
- **`definitions:`**`object`
- **`declarationFormatter:`**`function`
- **`minifier:`**`function`
- **`variableNameReplacer:`**`function`
- **`variableNameRetriever:`**`function`

See **API > Properties** for the descriptions of individual properties.

## Examples

#### Add new definitions.

```javascript
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
mathDefinitions.define("constants.number.e", "const e = 2.71828;");
mathDefinitions.define("constants.number.pi", "const pi = 3.1415;");
```

#### Remove a single or a group of existing definitions.

```javascript
mathDefinitions.undefine("constants.number");
mathDefinitions.has("constants.number.pi"); // false
mathDefinitions.has("constants.number.e"); // false
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
mathDefinitions.inject(snippet, { includeDefinitionsObjects: true });

// function _double0(x) {    // injected function
// return 2 * x;
// }
// const _pi0 = 3.1415;     // injected variable
// var multiply = { double: _double0}    // injected definitions objects
// var constants = { number: { pi: _pi0 }}
// const x = multiply.double(32 + constants.number.pi);    // original snippet
```

#### Definitions or group of definitions can be selectively deactivated and reactivated.

Deactivated definitions will be ignored when processing a text with definitions.

```javascript
mathDefinitions.define(
  "multiply.double",
  function double(x) {
    return 2 * x;
  },
  { activate: false }
);
mathDefinitions.define("constants.number.pi", "const pi = 3.1415;");

mathDefinitions.deactivate("constants.number");
mathDefinitions.activate("multiply.double");

const snippet = "const x = multiply.double(32 + constants.number.pi);";

// `scan` returns a list of found definitions.
mathDefinitions.scan(snippet); // ['multiply.double']
```

#### Check for existence or get a definition's value

```javascript
mathDefinitions.define("constants.number.e", "const e = 2.71828;");
mathDefinitions.define("constants.number.pi", "const pi = 3.1415;");

mathDefinitions.get("constants.number.e"); // 'const e = 2.71828;'
mathDefinitions.has("constants.number.pi"); // true
```

## API

### **Properties**

### definitions

An object of definitions stored as a tree of nested definition objects, where leafs are definition values.

### activeDefinitions

An object of definitions stored as a tree of nested definition objects. A subset of `definitions`. Only definitions that have existing path in `activeDefinitions` will be recognised when scanning / generating / injecting text.

### declarationFormatter

A function that defines how definitions objects should be formatted when `inject` has option `includeDefinitionsObjects: true`.

E.g. if given a definition object `'foo'`, which has structure `{'bar': 42}`, the `declarationFormatter` may format this as `var foo = {'bar': 42}` (Default).

`declarationFormatter` accepts a function of type `(definitionsObjectName: string, definitionsObject: object) => string`

### minifier

A function that minifies a string that had definitions injected. There is no default minification.

`minifier` accepts a function of type `(textWithInjectedDefinitions: string) => string`

### variableNameRetriever

A function that returns the name of a variable (if there is one) that is being defined in a definition.

Used for avoiding clashes when multiple definitions declare functions or variables with the same name. Default handles simple `const`, `let`, `var` and `function` declarations (no unpacking).

`variableNameRetriever` accepts a function of type `(definition: string) => string`

### variableNameReplacer

A function that replaces a variable name (same as the one found with `variableNameRetriever`) with a new name.

Used for avoiding clashes when multiple definitions declare functions or variables with the same name. Default handles simple `const`, `let`, `var` and `function` declarations (no unpacking).

`variableNameReplacer` accepts a function of type `(definition: string, oldVariableName: string, newVariableName: string) => string`

### **Methods**

### define(_path, definition[, options]_)

Creates a definition by adding it to the `definitions` object and optionally also to `activeDefinitions`.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .
**`definition:`**`any` - Value of the definition. This can be anything.
**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`activate:`**`boolean` - Whether the definition should be automatically activated. Non-active definitions will be ignored when scanning / generating / injecting text.
  Default: `true`

### undefine(_path_)

Removes a definition by removing it from both the `definitions` and `activeDefinitions` objects.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

### activate(_path_)

Activates a definition by adding it to the `activeDefinitions` object. Does nothing if the definition does not exist in the `definitions` object.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

### deactivate(_path_)

Deactivates a definition by removing it from the `activeDefinitions` object. Does nothing if the definition does not exist in the `definitions` object.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

### get(_path[, options]_)

Retrieves value of a definition specified by path. Returns undefined if no definition can be found.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`definitionsObject:`**`string` - Type of definitions object that will be searched through. Available values are `'all'`, `'active'`.
  Default: `'all'`

### has(_path[, options]_)

Checks if a definition specified by a path exists, and returns `true` if so. Returns `false` otherwise.

**`path:`**`string | string[]` - A string or array of strings specifying the path to a definition. If as string, path components are separated by dot `'.'` .

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`definitionsObject:`**`string` - Type of definitions object that will be searched through. Available values are `'all'`, `'active'`.
  Default: `'all'`

### scan(_targetText[, options]_)

Returns the keywords (names) of definitions that were found in `targetText`. Only active definitions are included.

Optionally sets the active definitions to all the definitions that were found in `targetText`.

**`targetText:`**`string` - A string to be scanned for definitions.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`delimeter:`**`string | false` - A string that joins the found definition keywords into a string. If set to `false`, an array of definition values is returned instead.
  Default: `false`

- **`overwriteActiveDefinitions:`**`boolean` - Whether the active definitions should be overwritten with the definitions found in `targetText`.
  Default: `false`

### generate(_targetText[, options]_)

Returns the values of definitions that were found in `targetText`. Only active definitions are included.

Optionally sets the active definitions to all the definitions that were found in `targetText`.

**`targetText:`**`string` - A string to be scanned for definitions.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`delimeter:`**`string | false` - A string that joins the found definition definition values into a string. If set to `false`, an array of definition values is returned instead.
  Default: `false`

- **`minify:`**`boolean` - Whether the resulting string should be minified according to the `minifier` function. Has effect only when `delimeter` is a string.
  Default: `false`

- **`overwriteActiveDefinitions:`**`boolean` - Whether the active definitions should be overwritten with the definitions found in `targetText`.
  Default: `false`

### inject(_targetText[, options]_)

Returns `targetText` with definitions injected. Only active definitions are included.

Optionally sets the active definitions to all the definitions that were found in `targetText`.

**`targetText:`**`string` - A string to be scanned for definitions.

**`options:`**`object` - An object of options that can modify the behaviour of the process. Options are:

- **`delimeter:`**`string` - A string that joins the found definitions.
  Default: `'\n'`

- **`includeDefinitionsObjects:`**`boolean` - Whether the resulting string should also include definitions objects for each of the top-level keywords. Useful if the definition keywords are nested (E.g. `'a.b.c'`), and the definition values are programmatically referenced.
  E.g. if definition `'foo.bar'` is a definition of function `bar` (E.g. `function bar(){...}`), then including the definitions objects will allow the function `bar` to be referenced via `foo.bar` (E.g. `foo.bar(x)`). Has no effect if `insertLocation` is `'replace'`.
  Default: `false`

- **`insertLocation:`**`string` - A string specifying the location where the definitions should be inserted. Available values: `'start'`, `'end'`, `'replace'`.
  Default: `'start'`

- **`minify:`**`boolean` - Whether the resulting string should be minified according to the `minifier` function.
  Default: `false`

- **`overwriteActiveDefinitions:`**`boolean` - Whether the active definitions should be overwritten with the definitions found in `targetText`.
  Default: `false`

- **`separator:`**`string` - A string that joins definitions, definitions objects and original text into a string.
  Default: `'\n'`

## Running the tests

Run tests with

```
npm run test
```

or

```
yarn run test
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/JuroOravec/inject-definition/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Change-log

- **1.0.0** - Initial release.

## Authors

- [**Juro Oravec**](https://github.com/https://github.com/JuroOravec)

See also the list of [contributors](https://github.com/JuroOravec/inject-definition/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License.
