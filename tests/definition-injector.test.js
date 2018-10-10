const DefinitionInjector = require("../lib");

var definitionInjector = DefinitionInjector.init();

beforeEach(() => {
  definitionInjector = DefinitionInjector.init();
  definitionInjector.define("Object.subset.x", "test");
  definitionInjector.define("Object.subset.y", "subset_y", {
    activate: false
  });
  definitionInjector.define("Array.component.a", "component_a");
  definitionInjector.define("Number.constant.e", "2.4", {
    activate: false
  });
});

describe(`DefinitionInjector`, () => {

  describe(`scan`, () => {

    test('returns empty array if text has no definitions', () => {
      expect(definitionInjector.scan('This text has no definitions')).toHaveLength(0)
      expect(definitionInjector.scan('This text has no definitions')).not.toContain('Object.subset.x')
    });

    test('returns found keywords of active definitions', () => {
      expect(definitionInjector.scan('Array.component.a, Object.subset.x')).toHaveLength(2)
      expect(definitionInjector.scan('Array.component.a, Object.subset.x')).toContain('Array.component.a')
      expect(definitionInjector.scan('Array.component.a, Object.subset.x')).toContain('Object.subset.x')
    });

    test('does not return keywords that are inactive', () => {
      expect(definitionInjector.scan('Number.constant.e, Object.subset.y')).toHaveLength(0)
      expect(definitionInjector.scan('Number.constant.e, Object.subset.y')).not.toContain('Number.constant.e')
      expect(definitionInjector.scan('Number.constant.e, Object.subset.y')).not.toContain('Object.subset.y')
    });

    test('returns only active keywords if text contains both active and inactive keywords', () => {
      expect(definitionInjector.scan('Number.constant.e, Array.component.a')).toHaveLength(1)
      expect(definitionInjector.scan('Number.constant.e, Array.component.a')).not.toContain('Number.constant.e')
      expect(definitionInjector.scan('Number.constant.e, Array.component.a')).toContain('Array.component.a')
    });

    test('deactivates previously active definitions if they are not in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Object.subset.x', {
        select: 'active'
      })).toBe(true);
      definitionInjector.scan('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Object.subset.x', {
        select: 'inactive'
      })).toBe(true);
    });

    test('keeps previously inactive definitions inactive, if they are not in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Number.constant.e', {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.scan('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Number.constant.e', {
        select: 'inactive'
      })).toBe(true);
    });

    test('activates previously inactive definitions if they are in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Object.subset.y', {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.scan('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Object.subset.y', {
        select: 'active'
      })).toBe(true);
    });

    test('keeps previously active definitions active, if they are in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Array.component.a', {
        select: 'active'
      })).toBe(true);
      definitionInjector.scan('Array.component.a', {
        overwrite: true
      });
      expect(definitionInjector.has('Array.component.a', {
        select: 'active'
      })).toBe(true);
    });

    test('returns array if `delimiter` === false', () => {
      expect(Array.isArray(definitionInjector.scan('This text has no definitions', {
        delimiter: false
      }))).toBe(true);
    });


    test('returns empty string if text has no definitions and `delimiter` !== false', () => {
      expect(definitionInjector.scan('This text has no definitions', {
        delimiter: 'test'
      })).toBe('');
    });

    test('returns keywords joined with delimiter if text has definitions and `delimiter` !== false', () => {
      expect(definitionInjector.scan('Object.subset.x Array.component.a', {
        delimiter: '-'
      })).toBe('Object.subset.x-Array.component.a');
    });

  });

  describe(`generate`, () => {

    test('returns empty array if text has no definitions', () => {
      expect(definitionInjector.generate('This text has no definitions')).toHaveLength(0)
      expect(definitionInjector.generate('This text has no definitions')).not.toContain('Object.subset.x')
    });

    test('returns values of found keywords of active definitions', () => {
      expect(definitionInjector.generate('Array.component.a, Object.subset.x')).toHaveLength(2)
      expect(definitionInjector.generate('Array.component.a, Object.subset.x')).toContain('test')
      expect(definitionInjector.generate('Array.component.a, Object.subset.x')).toContain('component_a')
    });

    test('does not return values of keywords that are inactive', () => {
      expect(definitionInjector.generate('Number.constant.e, Object.subset.y')).toHaveLength(0)
      expect(definitionInjector.generate('Number.constant.e, Object.subset.y')).not.toContain('2.4')
      expect(definitionInjector.generate('Number.constant.e, Object.subset.y')).not.toContain('subset_y')
    });

    test('returns only values of active definitions if text contains both active and inactive keywords', () => {
      expect(definitionInjector.generate('Number.constant.e, Array.component.a')).toHaveLength(1)
      expect(definitionInjector.generate('Number.constant.e, Array.component.a')).not.toContain('2.4')
      expect(definitionInjector.generate('Number.constant.e, Array.component.a')).toContain('component_a')
    });

    test('deactivates previously active definitions if they are not in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Object.subset.x', {
        select: 'active'
      })).toBe(true);
      definitionInjector.generate('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Object.subset.x', {
        select: 'inactive'
      })).toBe(true);
    });

    test('keeps previously inactive definitions inactive, if they are not in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Number.constant.e', {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.generate('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Number.constant.e', {
        select: 'inactive'
      })).toBe(true);
    });

    test('activates previously inactive definitions if they are in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Object.subset.y', {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.generate('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Object.subset.y', {
        select: 'active'
      })).toBe(true);
    });

    test('keeps previously active definitions active, if they are in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Array.component.a', {
        select: 'active'
      })).toBe(true);
      definitionInjector.generate('Array.component.a', {
        overwrite: true
      });
      expect(definitionInjector.has('Array.component.a', {
        select: 'active'
      })).toBe(true);
    });

    test('returns array if `delimiter` === false', () => {
      expect(Array.isArray(definitionInjector.generate('This text has no definitions', {
        delimiter: false
      }))).toBe(true);
    });


    test('returns empty string if text has no definitions and `delimiter` !== false', () => {
      expect(definitionInjector.generate('This text has no definitions', {
        delimiter: 'test'
      })).toBe('');
    });

    test('returns definition values joined with delimiter if text has definitions and `delimiter` !== false', () => {
      expect(definitionInjector.generate('Object.subset.x Array.component.a', {
        delimiter: '-'
      })).toBe('test-component_a');
    });

    test('ignores `minify` === true if `delimiter` === false', () => {
      definitionInjector.minifier = (str) => {
        expect(1).toBe(2);
        return str.replace(/\s/g, '')
      };
      expect(definitionInjector.generate('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: false
      })).toEqual(['test', 'component_a']);
    });

    test('minifies definition values joined with delimiter if text has definitions and `delimiter` !== false and `minify` === true', () => {
      definitionInjector.minifier = (str) => {
        return str.replace(/\s*/g, '')
      };
      expect(definitionInjector.generate('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: ' '
      })).toBe('testcomponent_a');
    });

    test('calls minifier function when `delimiter` !== false and `minify` === true', () => {
      definitionInjector.minifier = (str) => {
        expect(typeof str).toBe("string");
        return str.replace(/\s/g, '')
      };
      definitionInjector.generate('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: ' '
      });
    });

  });

  describe(`inject`, () => {

    test('returns identical text if text has no definitions', () => {
      expect(definitionInjector.inject('This text has no definitions')).toBe('This text has no definitions');
    });

    test('returns original text injected with definitions by default', () => {
      expect(definitionInjector.inject('Array.component.a, Object.subset.x')).toContain('Array.component.a, Object.subset.x')
      expect(definitionInjector.inject('Array.component.a, Object.subset.x')).toContain('test')
      expect(definitionInjector.inject('Array.component.a, Object.subset.x')).toContain('component_a')
    });

    test('does not inject values of keywords that are inactive', () => {
      expect(definitionInjector.inject('Number.constant.e, Object.subset.y')).toEqual('Number.constant.e, Object.subset.y')
      expect(definitionInjector.inject('Number.constant.e, Object.subset.y')).not.toContain('2.4')
      expect(definitionInjector.inject('Number.constant.e, Object.subset.y')).not.toContain('subset_y')
    });

    test('injects only values of active definitions if text contains both active and inactive keywords', () => {
      expect(definitionInjector.inject('Number.constant.e, Array.component.a', {
        separator: ' '
      })).toContain('component_a Number.constant.e, Array.component.a')
      expect(definitionInjector.inject('Number.constant.e, Array.component.a')).not.toContain('2.4')
      expect(definitionInjector.inject('Number.constant.e, Array.component.a')).toContain('component_a')
    });

    test('deactivates previously active definitions if they are not in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Object.subset.x', {
        select: 'active'
      })).toBe(true);
      definitionInjector.inject('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Object.subset.x', {
        select: 'inactive'
      })).toBe(true);
    });

    test('keeps previously inactive definitions inactive, if they are not in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Number.constant.e', {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.inject('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Number.constant.e', {
        select: 'inactive'
      })).toBe(true);
    });

    test('activates previously inactive definitions if they are in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Object.subset.y', {
        select: 'inactive'
      })).toBe(true);
      definitionInjector.inject('Object.subset.y', {
        overwrite: true
      });
      expect(definitionInjector.has('Object.subset.y', {
        select: 'active'
      })).toBe(true);
    });

    test('keeps previously active definitions active, if they are in text and `overwrite` === true', () => {
      expect(definitionInjector.has('Array.component.a', {
        select: 'active'
      })).toBe(true);
      definitionInjector.inject('Array.component.a', {
        overwrite: true
      });
      expect(definitionInjector.has('Array.component.a', {
        select: 'active'
      })).toBe(true);
    });

    test('still returns string even if `delimiter` === false', () => {
      expect(Array.isArray(definitionInjector.inject('This text has no definitions', {
        delimiter: false
      }))).toBe(false);
    });


    test('injects empty string if text has no definitions', () => {
      expect(definitionInjector.inject('This text has no definitions', {
        delimiter: '',
        separator: ''
      })).toBe('This text has no definitions');
    });

    test('returns definition values joined with delimiter if text has definitions', () => {
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        delimiter: '-',
        separator: '_'
      })).toBe('test-component_a_Object.subset.x Array.component.a');
    });

    test('minifies definition values joined with delimiter if text has definitions and `minify` === true', () => {
      definitionInjector.minifier = (str) => {
        return str.replace(/\s/g, '')
      };
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: ' ',
        separator: '-'
      })).toBe('testcomponent_a-Object.subset.x Array.component.a');
    });

    test('calls minifier function when `minify` === true', () => {
      definitionInjector.minifier = (str) => {
        expect(typeof str).toBe("string");
        return str.replace(/\s/g, '')
      };
      definitionInjector.inject('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: ' '
      });
    });

    test('does not minify definition values joined with delimiter if text has definitions and `minify` === true and `insertLocation` === `replace`', () => {
      definitionInjector.minifier = (str) => {
        return str.replace(/\s/g, '')
      };
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: ' ',
        insertLocation: 'replace'
      })).toBe('test component_a');
    });

    test('does not call minifier function when `minify` === true and `insertLocation` === `replace`', () => {
      definitionInjector.minifier = (str) => {
        expect(1).toBe(2);
        return str.replace(/\s/g, '')
      };
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        minify: true,
        delimiter: ' ',
        insertLocation: `replace`
      })).toBe(`test component_a`);
    });

    test(`inserts definitions at the beginning by default`, () => {
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        delimiter: ' ',
        separator: '_'
      })).toBe(`test component_a_Object.subset.x Array.component.a`);
    });

    test('inserts definitions at the beginning if `insertLocation` === `start`', () => {
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        separator: '_',
        delimiter: ' ',
        insertLocation: 'start'
      })).toBe(`test component_a_Object.subset.x Array.component.a`);
    });

    test('inserts definitions at the end if `insertLocation` === `end`', () => {
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        separator: '_',
        delimiter: ' ',
        insertLocation: 'end'
      })).toBe(`Object.subset.x Array.component.a_test component_a`);
    });

    test('replaces keywords with definitions if `insertLocation` === `replace`', () => {
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        separator: '_',
        delimiter: ' ',
        insertLocation: 'replace'
      })).toBe(`test component_a`);
    });

    test('inserts definitions object if `reference` === true', () => {
      definitionInjector.define('JsConstant', 'const num = 7;')
      expect(definitionInjector.inject('console.log(JsConstant + 3);', {
        separator: ' ',
        delimiter: ' ',
        reference: true
      })).toBe(`const _num0 = 7; var JsConstant = _num0; console.log(JsConstant + 3);`);
    });

    test('inserts definitions object that can be referenced within code', () => {
      definitionInjector.define('JsConstant', 'const num = 7;')
      expect(Function('"use strict"; ' + definitionInjector.inject('return JsConstant + 3;', {
        separator: ' ',
        delimiter: ' ',
        reference: true
      }))()).toBe(10);
    });

    test('uses the declaration formatter function if `reference` === true', () => {
      definitionInjector.declarationFormatter = function (branchKey, branch) {
        expect(typeof branchKey).toBe('string');
        return `var ${branchKey} = ${branch}`;
      };
      definitionInjector.define('JsConstant', 'const num = 7;')
      definitionInjector.inject('console.log(JsConstant + 3);', {
        separator: ' ',
        delimiter: ' ',
        reference: true
      });
    });

    test('uses the variableNameRetriever function if `reference` === true', () => {
      definitionInjector.variableNameRetriever = function (definition) {
        expect(typeof definition).toBe('string');
        const matched =
          definition.match(/(?:var|const|let|function)[\s\r\n]+\w+/g) || [];
        const lastWords = matched.map(m => (m.match(/\w+$/) || [])[0]);
        return lastWords[0];
      }
      definitionInjector.define('JsConstant', 'const num = 7;')
      definitionInjector.inject('console.log(JsConstant + 3);', {
        separator: ' ',
        delimiter: ' ',
        reference: true
      });
    });

    test('uses the variableNameReplacer function if `reference` === true', () => {
      definitionInjector.variableNameReplacer = function (definition, oldName, newName) {
        expect(typeof definition).toBe('string');
        var replaced = definition.replace(
          new RegExp("(var|const|let|function)[\\s\\r\\n]" + oldName),
          (match, capture) => capture + " " + newName
        );
        return replaced;
      }
      definitionInjector.define('JsConstant', 'const num = 7;')
      definitionInjector.inject('console.log(JsConstant + 3);', {
        separator: ' ',
        delimiter: ' ',
        reference: true
      });
    });

    test('joins definitions with text that contains definitions with specified separator', () => {
      expect(definitionInjector.inject('Object.subset.x Array.component.a', {
        separator: '_',
        delimiter: ' '
      })).toBe(`test component_a_Object.subset.x Array.component.a`);
    });

    test('does not insert anything to the text if text does not contain definitions', () => {
      expect(definitionInjector.inject('This text has no definitions', {
        separator: '_',
        delimiter: ' '
      })).toBe(`This text has no definitions`);
    });

  });
});
