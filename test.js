const DefinitionInjector = require("./lib");

var definitionInjector = DefinitionInjector.init();

beforeEach(() => {
  definitionInjector = DefinitionInjector.init();
})

// 1. If I define and then get, I get the same value
test('get returns same value as defined', () => {
  definitionInjector.define("Object.subset.x", "test");
  expect(definitionInjector.get("Object.subset.x")).toBe('test');
})

// 2. If I define, then I define the same thing, and then get the value, I get the new value
test('get returns the latest value defined', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.define("Object.subset.x", "dog");
  expect(definitionInjector.get("Object.subset.x")).toBe('dog');
})

// 3. If I define and check has, it is true.
test('has returns true if definition defined', () => {
  definitionInjector.define("Object.subset.x", "test");
  expect(definitionInjector.has("Object.subset.x")).toBe(true);
})

// 4. If I define and then remove, get returns.
test('get on undefined definition returns undefined', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.undefine("Object.subset.x");
  expect(definitionInjector.get("Object.subset.x")).toBe(undefined);
})

// 5. If I define and then remove, has returns false.
test('has on undefined definition returns false', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.undefine("Object.subset.x");
  expect(definitionInjector.has("Object.subset.x")).toBe(false);
})

// 6. If I define, and then activate, I get the same thing from activeDefinitions
test('get on active definition returns definition value from activeDefinitions', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.activate("Object.subset.x");
  expect(definitionInjector.get("Object.subset.x", {
    definitionObject: definitionInjector.activeDefinitions
  })).toBe('test');
})

// 7. If I define, and then activate and then deactivate, i get undefined
test('get on inactive definition returns undefined from activeDefinitions', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.activate("Object.subset.x");
  definitionInjector.deactivate("Object.subset.x");
  expect(definitionInjector.get("Object.subset.x", {
    definitionsObject: definitionInjector.activeDefinitions
  })).toBe(undefined);
})

// 8. If I scan nonsense, I get empty list
test('scan on text with no definitions returns empty list', () => {
  definitionInjector.define("Object.subset.x", "test");
  expect(definitionInjector.scan('This text has no definitions')).toHaveLength(0)
  expect(definitionInjector.scan('This text has no definitions')).not.toContain('Object.subset.x')
})

// 9. If I add definition and then scan text with that definition, I get a list of that definition.
test('scan on text with definitions returns list of definition names', () => {
  definitionInjector.define("Object.subset.x", "test");
  expect(definitionInjector.scan('This text contains definition Object.subset.x')).toHaveLength(1)
  expect(definitionInjector.scan('This text contains definition Object.subset.x')).toContain('Object.subset.x')
})

// 10. If I add definition and then deactivate that definition and then scan text with that definition, I get empty list.
test('scan on text with definitions that are inactive returns empty list', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.deactivate("Object.subset.x");
  expect(definitionInjector.scan('This text contains definition Object.subset.x')).toHaveLength(0);
  expect(definitionInjector.scan('This text contains definition Object.subset.x')).not.toContain('Object.subset.x')
})

// 11. If I add definition and then generate definitions from a text with that definition, I get a list of that definition's value.
test('generate on defined definition returns value of that definition', () => {
  definitionInjector.define("Object.subset.x", "test");
  expect(definitionInjector.generate('This text contains definition Object.subset.x', {
    separator: false,
  })).toHaveLength(1);
  expect(definitionInjector.generate('This text contains definition Object.subset.x', {
    separator: false,
  })).toContain('test')
})

// 12. If I add definition and then deactivate that definition and then generate definitions from a text with that definition, I get empty list.
test('generate on deactivated definition does not return the defined definition', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.deactivate("Object.subset.x");
  expect(definitionInjector.generate('This text contains definition Object.subset.x', {
    separator: false
  })).toHaveLength(0);
  expect(definitionInjector.generate('This text contains definition Object.subset.x', {
    separator: false
  })).not.toContain('test')
})


// 13. If I add definition and then inject definitions from a text with that definition, I get a string containing both the original text and the definitions.
test('inject on defined definition returns string containing the text and the definition value', () => {
  definitionInjector.define("Object.subset.x", "test");
  expect(definitionInjector.inject('This text contains definition Object.subset.x')).toContain('This text contains definition Object.subset.x')
  expect(definitionInjector.inject('This text contains definition Object.subset.x')).toContain('test')
})

// 14. If I add definition and then deactivate that definition and then generate definitions from a text with that definition, I get a string containing only the original text.
test('inject on deactivated definition does not return the defined definition, only the text', () => {
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.deactivate("Object.subset.x");
  expect(definitionInjector.inject('This text contains definition Object.subset.x')).toContain('This text contains definition Object.subset.x')
  expect(definitionInjector.inject('This text contains definition Object.subset.x')).not.toContain('test')
})
