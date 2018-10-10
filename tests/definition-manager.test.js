const DefinitionInjector = require("../lib");

var definitionInjector = DefinitionInjector.init();

beforeEach(() => {
  definitionInjector = DefinitionInjector.init();
})

describe('DefinitionManager', () => {
  describe('constructor', () => {
    test('copies definitions if another DefinitionManager instance is passed', () => {
      definitionInjector.define("Object.subset.x", "test");
      const anotherInjector = DefinitionInjector.init(definitionInjector);
      expect(anotherInjector.has('Object.subset.x')).toBe(true);
      expect(definitionInjector.has('Object.subset.x')).toBe(true);
    });

    test('makes an independent copy of definitions form another DefinitionManager instance', () => {
      definitionInjector.define("Object.subset.x", "test");
      const anotherInjector = DefinitionInjector.init(definitionInjector);
      expect(anotherInjector.has('Object.subset.x')).toBe(true);
      expect(definitionInjector.has('Object.subset.x')).toBe(true);

      definitionInjector.undefine('Object.subset');
      expect(anotherInjector.has('Object.subset.x')).toBe(true);
      expect(definitionInjector.has('Object.subset.x')).toBe(false);
    });

    test('copies definitions if object with `definitions` property is passed', () => {
      definitionInjector.define("Object.subset.x", "test");
      const options = {
        definitions: definitionInjector.getAll()
      }
      const anotherInjector = DefinitionInjector.init(options);
      expect(anotherInjector.has('Object.subset.x')).toBe(true);
    });

    test('makes an independent copy of definitions from object with `definitions` property', () => {
      definitionInjector.define("Object.subset.x", "test");
      const options = {
        definitions: definitionInjector.getAll()
      }
      const anotherInjector = DefinitionInjector.init(options);
      expect(anotherInjector.has('Object.subset.x')).toBe(true);
    });
  });

  describe('define', () => {
    test('activates new definitions by default (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe('test');
    });

    test('activates new definitions by default (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe(undefined);
    });

    test('does not activate new definitions if `activate` == false (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe(undefined);
    });

    test('does not activate new definitions if `activate` == false (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe('test');
    });

    test('updates value of existing definitions if definition already exists', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.x", "dog", {
        activate: false
      });
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe('dog');
    })

    test('accepts array of path components', () => {
      definitionInjector.define(["Object", "subset", "x"], "test");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe('test');
    });
  });

  describe('undefine', () => {
    test('removes definitions (tests all definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x")).toBe(undefined);
    });

    test('removes definitions (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe(undefined);
    });

    test('removes definitions (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe(undefined);
    });

    test('accepts array of path components', () => {
      definitionInjector.define(["Object", "subset", "x"], "test");
      definitionInjector.undefine(["Object", "subset", "x"]);
      expect(definitionInjector.get("Object.subset.x")).toBe(undefined);
    });
  });

  describe('undefineAll', () => {
    beforeEach(() => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.y", "subset_y", {
        activate: false
      });
      definitionInjector.define("Array.component.a", "component_a");
    });

    test('removes all definitions by default', () => {
      definitionInjector.undefineAll();
      expect(definitionInjector.has("Object")).toBe(false);
      expect(definitionInjector.has("Array")).toBe(false);
    });

    test('removes all active definitions if `select` === `active`', () => {
      definitionInjector.undefineAll({
        select: 'active'
      });
      expect(definitionInjector.has("Object.subset.x")).toBe(false);
      expect(definitionInjector.has("Object.subset.y")).toBe(true);
      expect(definitionInjector.has("Array")).toBe(false);
    });

    test('removes all inactive definitions if `select` === `inactive`', () => {
      definitionInjector.undefineAll({
        select: 'inactive'
      });
      expect(definitionInjector.has("Object.subset.x")).toBe(true);
      expect(definitionInjector.has("Object.subset.y")).toBe(false);
      expect(definitionInjector.has("Array")).toBe(true);
    });
  });


  describe('activate', () => {
    test('has no effect on already active definitions', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'active'
      })).toBe(true);
      definitionInjector.activate("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'active'
      })).toBe(true);
    });

    test('has no effect on non-existant definitions', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.has("Object.subset.x")).toBe(true);
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x")).toBe(false);
      definitionInjector.activate("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'active'
      })).toBe(false);
    });

    test('activates definitions (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      definitionInjector.activate("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe('test');
    });

    test('activates definitions (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      definitionInjector.activate("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe(undefined);
    });

    test('accepts array of path components', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      definitionInjector.activate(["Object", "subset", "x"]);
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe('test');
    });
  });

  describe('activateAll', () => {
    beforeEach(() => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.y", "subset_y", {
        activate: false
      });
      definitionInjector.define("Array.component.a", "component_a", {
        activate: false
      });
    });

    test('activates all definitions (tests active definitions)', () => {
      definitionInjector.activateAll();
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe('test');
      expect(definitionInjector.get("Object.subset.y", {
        select: 'active'
      })).toBe('subset_y');
      expect(definitionInjector.get("Array.component.a", {
        select: 'active'
      })).toBe('component_a');
    });

    test('activates all definitions (tests inactive definitions)', () => {
      definitionInjector.activateAll();
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe(undefined);
      expect(definitionInjector.get("Object.subset.y", {
        select: 'inactive'
      })).toBe(undefined);
      expect(definitionInjector.get("Array.component.a", {
        select: 'inactive'
      })).toBe(undefined);
    });
  });


  describe('deactivate', () => {
    test('has no effect on already inactive definitions', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.deactivate("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(true);
    });

    test('has no effect on non-existant definitions', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(false);
      definitionInjector.deactivate("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(false);
    });

    test('deactivates definitions (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.deactivate("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe(undefined);
    });

    test('deactivates definitions (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.deactivate("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe('test');
    });

    test('accepts array of path components', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.deactivate(["Object", "subset", "x"]);
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe('test');
    });
  });


  describe('deactivateAll', () => {
    beforeEach(() => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.y", "subset_y", {
        activate: false
      });
      definitionInjector.define("Array.component.a", "component_a");
    });

    test('deactivates all definitions (tests active definitions)', () => {
      definitionInjector.deactivateAll();
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe(undefined);
      expect(definitionInjector.get("Object.subset.y", {
        select: 'active'
      })).toBe(undefined);
      expect(definitionInjector.get("Array.component.a", {
        select: 'active'
      })).toBe(undefined);
    });

    test('deactivates all definitions (tests inactive definitions)', () => {
      definitionInjector.deactivateAll();
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe('test');
      expect(definitionInjector.get("Object.subset.y", {
        select: 'inactive'
      })).toBe('subset_y');
      expect(definitionInjector.get("Array.component.a", {
        select: 'inactive'
      })).toBe('component_a');
    });
  });

  describe('get', () => {
    test('returns undefined on non-existant definitions', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.has("Object.subset.x")).toBe(true);
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.get("Object.subset.x")).toBe(undefined);
    });

    test('returns definition value from both active and inactive definitions by default', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.y", "subset_y", {
        activate: false
      });
      expect(definitionInjector.get("Object.subset.x")).toBe('test');
      expect(definitionInjector.get("Object.subset.y")).toBe('subset_y');
    });

    test('returns same value as defined', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.get("Object.subset.x")).toBe('test');
    })

    test('returns definition value (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe('test');
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe(undefined);
    });

    test('returns definition value (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      expect(definitionInjector.get("Object.subset.x", {
        select: 'inactive'
      })).toBe('test');
      expect(definitionInjector.get("Object.subset.x", {
        select: 'active'
      })).toBe(undefined);
    });

    test('accepts array of path components', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.get(["Object", "subset", "x"])).toBe('test');
    });
  });


  describe('getAll', () => {
    beforeEach(() => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.y", "subset_y", {
        activate: false
      });
      definitionInjector.define("Array.component.a", "component_a");
      definitionInjector.define("Number.constant.e", "2.4", {
        activate: false
      });
    });

    test('returns all definitions by default', () => {
      const definitions = definitionInjector.getAll();
      expect(definitions.children.Object.children.subset.children.x.value).toBe('test');
      expect(definitions.children.Object.children.subset.children.y.value).toBe('subset_y');
      expect(definitions.children.Array.children.component.children.a.value).toBe('component_a');
      expect(definitions.children.Number.children.constant.children.e.value).toBe('2.4');
    });

    test('returns all active definitions if `select` == `active`', () => {
      const definitions = definitionInjector.getAll({
        select: 'active'
      });
      expect(definitions.children.Object.children.subset.children.x.value).toBe('test');
      expect(definitions.children.Object.children.subset.children.y).toBe(undefined);
      expect(definitions.children.Array.children.component.children.a.value).toBe('component_a');
      expect(definitions.children.Number).toBe(undefined);
    });

    test('returns all inactive definitions if `select` == `inactive`', () => {
      const definitions = definitionInjector.getAll({
        select: 'inactive'
      });
      expect(definitions.children.Object.children.subset.children.x).toBe(undefined);
      expect(definitions.children.Object.children.subset.children.y.value).toBe('subset_y');
      expect(definitions.children.Array).toBe(undefined);
      expect(definitions.children.Number.children.constant.children.e.value).toBe('2.4');
    });

    test('returns full object structure by default', () => {
      const definitions = definitionInjector.getAll();
      expect(definitions.children.Object.children.subset.children.x.value).toBe('test');
      expect(definitions.children.Object.children.subset.children.x.active).toBe(true);
      expect(definitions.children.Object.children.subset.children.x.keyword).toBe('Object.subset.x');
      expect(definitions.children.Object.children.subset.children.x.children).toEqual({});
    });

    test('returns full object structure if `type` == `full`', () => {
      const definitions = definitionInjector.getAll({
        type: 'full'
      });
      expect(definitions.children.Object.children.subset.children.x.value).toBe('test');
      expect(definitions.children.Object.children.subset.children.x.active).toBe(true);
      expect(definitions.children.Object.children.subset.children.x.keyword).toBe('Object.subset.x');
      expect(definitions.children.Object.children.subset.children.x.children).toEqual({});
    });

    test('returns partial object structure if `type` == `partial`', () => {
      const definitions = definitionInjector.getAll({
        type: 'partial'
      });
      expect(definitions.children.Object.children.subset.children.x.value).toBe('test');
      expect(definitions.children.Object.children.subset.children.x.active).toBe(undefined);
      expect(definitions.children.Object.children.subset.children.x.keyword).toBe(undefined);
      expect(definitions.children.Object.children.subset.children.x.children).toEqual({});
    });

    test('returns condensed object structure if `type` == `condensed`', () => {
      const definitions = definitionInjector.getAll({
        type: 'condensed'
      });
      expect(definitions.Object.subset.x).toBe('test');
      expect(definitions.Object.subset.y).toBe('subset_y');
      expect(definitions.Array.component.a).toBe('component_a');
      expect(definitions.Number.constant.e).toBe('2.4');
    });

  });


  describe('has', () => {
    test('returns false on non-existant definitions', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.has("Object.subset.x")).toBe(true);
      definitionInjector.undefine("Object.subset.x");
      expect(definitionInjector.has("Object.subset.x")).toBe(false);
    });

    test('checks both active and inactive definitions by default', () => {
      definitionInjector.define("Object.subset.x", "test");
      definitionInjector.define("Object.subset.y", "subset_y", {
        activate: false
      });
      expect(definitionInjector.has("Object.subset.x")).toBe(true);
      expect(definitionInjector.has("Object.subset.y")).toBe(true);
    });

    test('returns true even if values is falsy', () => {
      definitionInjector.define("Object.subset.x", "");
      definitionInjector.define("Object.subset.y", null);
      expect(definitionInjector.has("Object.subset.x")).toBe(true);
      expect(definitionInjector.has("Object.subset.y")).toBe(true);
    })

    test('checks definition existence (tests active definitions)', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.has("Object.subset.x", {
        select: 'active'
      })).toBe(true);
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(false);
    });

    test('checks definition existence (tests inactive definitions)', () => {
      definitionInjector.define("Object.subset.x", "test", {
        activate: false
      });
      expect(definitionInjector.has("Object.subset.x", {
        select: 'inactive'
      })).toBe(true);
      expect(definitionInjector.has("Object.subset.x", {
        select: 'active'
      })).toBe(false);
    });

    test('accepts array of path components', () => {
      definitionInjector.define("Object.subset.x", "test");
      expect(definitionInjector.has(["Object", "subset", "x"])).toBe(true);
    });
  });

});
