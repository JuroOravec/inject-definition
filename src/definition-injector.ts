/// <reference path="./interface/definition-injector.ts" />

import { DefinitionManager } from "./definition-manager";

import { preventVariableClashes } from "./lib/prevent-variable-clashes";
import { mapDefinitionBranchesToObject } from "./lib/map-definition-branches-to-object";
import { setMethod } from "./lib/set-method";
import { defaultVariableNameRetriever } from "./lib/default-variable-name-retriever";
import { defaultVariableNameReplacer } from "./lib/default-variable-name-replacer";
import { defaultDeclarationFormatter } from "./lib/default-declaration-formatter";
import { defaultMinifier } from "./lib/default-minifier";
import { stringify } from "./lib/stringify";

import IDefinitionInjector = DefinitionInjector.IDefinitionInjector;
import IVariableNameRetriever = DefinitionInjector.IVariableNameRetriever;
import IVariableNameReplacer = DefinitionInjector.IVariableNameReplacer;
import IDeclarationFormatter = DefinitionInjector.IDeclarationFormatter;
import IMinifier = DefinitionInjector.IMinifier;

type ScanOptions = {
  overwriteActiveDefinitions?: boolean;
  delimiter?: string | false;
};

type ScanOptionsNoDelimeter = {
  overwriteActiveDefinitions?: boolean;
  delimiter?: false;
};

type ScanOptionsWithDelimeter = {
  overwriteActiveDefinitions?: boolean;
  delimiter?: string;
};

type GenerateOptions = {
  minify?: boolean;
} & ScanOptions;

type InjectOptions = {
  includeDefinitionsObjects?: boolean;
  insertLocation?: "start" | "replace" | "end";
  separator?: string;
  delimeter?: string;
} & GenerateOptions;

// Tags used to insert definition values into string
const openTag = "<DefInj>";
const closeTag = "</DefInj>";

// Hide the user-defined methods with symbols
const minifierSym = Symbol("minifier");
const variableNameRetrieverSym = Symbol("variableNameRetriever");
const variableNameReplacerSym = Symbol("variableNameReplacer");
const declarationFormatterSym = Symbol("declarationFormatter");

/**
 * Layer over DefinitionManager that handles interaction with target text.
 * DefinitionInjector prefixes/suffixes/replaces user-defined definitions,
 * macros, constants or other snippets to a text, if the orresponding keywords
 * are present.
 *
 * @property `definitions` An object of definitions stored as a tree of nested
 * definition objects, where leafs are definition values.
 *
 * @property `activeDefinitions` An object of definitions stored as a tree of
 * nested definition objects. A subset of `definitions`. Only definitions that
 * have existing path in `activeDefinitions` will be recognized when scanning/
 * generating/injecting text.
 *
 * @property `declarationFormatter` A function that defines how a definitions
 * object should be formatted when being declared. E.g. if given definition
 * object `'foo'`, which has structure `{'bar': 42}`, the `declarationFormatter`
 * may format this as `var foo = {'bar': 42}`. `declarationFormatter` takes the
 * name of the definitions object as the 1st argument, the definitions object
 * as the 2nd argument, and returns a string.
 *
 * @property `minifier` A function that minifies a string that had definitions
 * injected. `minifier` takes a string as the 1st argument, and returns a string.
 *
 * @property `variableNameRetriever` A function that returns the name of a
 * variable (if there is one) that is being defined in a definition.
 * `variableNameRetriever` takes a string (definition) as the 1st argument, and
 * returns a string.
 *
 * @property `variableNameReplacer` A function that replaces a variable name
 * (same as the one found with `variableNameRetriever`) and assigns it a new
 * name, in order to avoid name clashing. `variableNameReplacer` takes a string
 * (definition) as the 1st argument, name to be replaced as the 2nd argument,
 * a new name as the 3rd argument, and returns a string (the updated
 * definition)
 *
 * @method `define` Defines a definition, adding it to the `definitions` (and
 * optionally `activeDefinitions`) object.
 *
 * @method `undefine` Undefines/removes a definiting, removing it from both
 * `definitions` and `activeDefinitions` objects.
 *
 * @method `activate` Activates an existing definition, adding it to the
 * `activeDefinitions` objects.
 *
 * @method `deactivate` Deactivates an existing definition, removing it from
 * the `activeDefinitions` objects.
 *
 * @method `get` Returns a definition specified with a path.
 *
 * @method `has` Returns a boolean of whether a definition exists at a
 * specified path.
 *
 * @method `scan` Scans a text and returns an array of keywords (names) of
 * active definitions that were found.
 *
 * @method `generate` Scans a text and returns an array of definition values
 * of active definitions that were found.
 *
 * @method `inject` Scans a text and returns the text with definitions
 * injected.
 *
 */
export class DefinitionInjector extends DefinitionManager
  implements IDefinitionInjector {
  private [minifierSym]: IMinifier;
  private [variableNameReplacerSym]: IVariableNameReplacer;
  private [variableNameRetrieverSym]: IVariableNameRetriever;
  private [declarationFormatterSym]: IDeclarationFormatter;

  constructor(
    options: {
      activeDefinitions?: IDefinitionInjector["activeDefinitions"];
      definitions?: IDefinitionInjector["definitions"];
      declarationFormatter?: IDeclarationFormatter;
      minifier?: IMinifier;
      variableNameReplacer?: IVariableNameReplacer;
      variableNameRetriever?: IVariableNameRetriever;
    } = {}
  ) {
    const defaults = {
      target: "",
      declarationFormatter: defaultDeclarationFormatter,
      minifier: defaultMinifier,
      variableNameRetriever: defaultVariableNameRetriever,
      variableNameReplacer: defaultVariableNameReplacer
    };

    const {
      activeDefinitions,
      definitions,
      declarationFormatter,
      minifier,
      variableNameReplacer,
      variableNameRetriever
    } = Object.assign(defaults, options);

    super({ activeDefinitions, definitions });

    const methods = [
      // A method that formats the stringified definition branches.
      {
        name: "declarationFormatter",
        prop: declarationFormatterSym,
        value: declarationFormatter
      },
      // A method that produces minified version of the concatenated definitions
      // If "minified" option is true
      {
        name: "minifier",
        prop: minifierSym,
        value: minifier
      },

      // Define the method that retrieves a variable name of the first defined variable
      // in a definition.

      {
        name: "variableNameRetriever",
        prop: variableNameRetrieverSym,
        value: variableNameReplacer
      },
      // Define the method that replaces a variable name of the first defined variable
      // in a definition from an old value to a new value.
      {
        name: "variableNameReplacer",
        prop: variableNameReplacerSym,
        value: variableNameRetriever
      }
    ];

    // For each method, store the function as a non-enumerable symbol and set
    // up getter and setter.
    methods.forEach(method => {
      Object.defineProperties(this, {
        [method.prop]: {
          enumerable: false,
          writable: true,
          value: method.value
        },
        [method.name]: {
          get: () => {
            return this[method.prop];
          },
          set: fn => {
            setMethod(this, method.prop, fn, method.name as any);
          }
        }
      });

      this[method.name] = method.value;
    });
  }

  /**
   * Returns a string that is the textTarget string with definitions injected.
   * Definitions must be active to be included in the result. See `options` for
   * available options in injecting and formatting.
   *
   * Optionally sets the active definitions to all the definitions that were
   * found in the string.
   *
   * @param targetText A string representing the text to be scanned.
   *
   * @param options An object of options that can modify the behaviour of the
   * scanning process. Options are:
   *   - `delimiter` - A string that joins the definition values into a string.
   * If set to `false`, an array of definition values is returned instead of a
   * string. Default: `'\n'`
   *   - `includeDefinitionsObjects` - Whether the resulting string should also
   * include definitions objects for each of the top-level keywords. Useful if
   * the definition keywords are nested (E.g. `'a.b.c'`), and the definition
   * values are programmatically referenced. E.g. if definition `'foo.bar'` is
   * a definition of function `bar` (E.g. `function bar(){...}`), then
   * including the definitions object will allow the function `bar` to be
   * referenced via `foo.bar`. Has no effect if insertLocation is `'replace'`.
   * Default: `false`
   *   - `insertLocation` - A string specifying the location where the
   * definitions should be inserted. Available values: `'start'`, `'end'`,
   * `'replace'`. Default: `'start'`
   *   - `minify` - Whether the injected definitions should be minified according
   * to the user-defined minifier function. has no effect if 'insertLocation'
   * is 'replace'. Default: `false`
   *   - `overwriteActiveDefinitions` - Whether the active definitions should
   * be overwritten with the definitions found in the string. Default: `false`
   *   - `separator` - A string that joins definitions and original text into a
   * string. Default: `'\n'`
   */
  public inject(textTarget: string, options: InjectOptions = {}) {
    const defaults = {
      delimeter: "\n",
      includeDefinitionsObjects: false,
      insertLocation: "start",
      minify: false,
      overwriteActiveDefinitions: false,
      separator: "\n",
      target: ""
    };
    const {
      delimeter,
      includeDefinitionsObjects,
      insertLocation,
      minify,
      overwriteActiveDefinitions,
      separator,
      target
    } = Object.assign(defaults, options, { target: textTarget });

    // If target was passed or the instance has one, use that
    if (typeof target !== "string") return;

    // Get definition keywords (== path with dots separating path components)
    const keywords = this.scan(target, {
      overwriteActiveDefinitions
    });

    const stringifiedDefinitions: string[] = [];
    const textToJoin: string[] = [];

    // If includeDefinitionsObject is true, all definitions are processed
    // to avoid variable name clashes, and a stringified version of definitions
    // is created, which does not contain the definitions themselves, but only
    // references to them. This allows the defined variables to be referenced
    // same as they were defined via keywords
    //
    // E.g. for a definition with a keyword 'Array.map', the value will be
    // printed first:
    // "function map(x, y, z){...}"
    //
    // and that will be then referenced:
    // "const Array = {map: map}"
    //
    // so if definition includes:
    // "... Array.map(1, 2, 3) ..."
    //
    // This will get processed correctly
    if (includeDefinitionsObjects && insertLocation !== "replace") {
      // Process definitions such that no two definitions have the same
      // variable name (only first variable taken into consideration)
      // based on user-defined parameters.
      const definitionEntries = keywords.map(keyword => {
        return { keyword, value: this.get(keyword) };
      });
      const processedDefinitions = preventVariableClashes(
        definitionEntries,
        this[variableNameRetrieverSym],
        this[variableNameReplacerSym]
      );

      stringifiedDefinitions.push(
        ...processedDefinitions.map(def => stringify(def.value))
      );

      // Process the object of definitions into object of stringified branches
      // that contain only the references to the first variable names
      // of the definitions.
      const stringifiedBranches = mapDefinitionBranchesToObject(
        processedDefinitions,
        openTag,
        closeTag
      );

      // Format the way the branches are defined using a user-defined
      // function, which takes the branch name, and stringified branch.
      const formattedBranches = Object.keys(stringifiedBranches).map(branch =>
        this[declarationFormatterSym](branch, stringifiedBranches[
          branch
        ] as string)
      );

      const joinedStringifiedDefinitions = stringifiedDefinitions.join(
        delimeter
      );
      const finalDefinitions = minify
        ? this[minifierSym](joinedStringifiedDefinitions)
        : joinedStringifiedDefinitions;

      textToJoin.push(finalDefinitions, ...formattedBranches);
    } else {
      // If the definitions object is not necessary (E.g. in case of textual
      // definitions, instead of a programmatic ones) the definitions are
      // simply pooled together at a specified location.
      stringifiedDefinitions.push(
        ...keywords.map(keyword => stringify(this.get(keyword)))
      );

      const joinedStringifiedDefinitions = stringifiedDefinitions.join(
        delimeter
      );
      const finalDefinitions = minify
        ? this[minifierSym](joinedStringifiedDefinitions)
        : joinedStringifiedDefinitions;

      textToJoin.push(finalDefinitions);
    }

    // Join the definitions with the text with a specified separator inbetween
    if (insertLocation === "start") {
      // Push the target text to the end, so the definitions are at the start
      textToJoin.push(target);
    } else if (insertLocation === "end") {
      // Push the target text to the start, so the definitions are at the end
      textToJoin.unshift(target);
    } else if (insertLocation === "replace") {
      // Replace all occurences of keywords with their definitions
      const replacedTextTarget = stringifiedDefinitions.reduce(
        (modifiedtextTarget, def, i) => {
          const replacee = keywords[i];
          const replacer = def;
          const replaceRegExp = new RegExp(replacee, "g");
          return modifiedtextTarget.replace(replaceRegExp, replacer);
        },
        target
      );
      textToJoin.length = 0;
      textToJoin.push(replacedTextTarget);
    }

    // Join the definitions (optionally definitions object) and target text into single string
    const joinedText = textToJoin.join(separator || "");
    return joinedText;
  }

  /**
   * Returns an array of definition values of definitions that were found in
   * the textTarget string. Definitions must be active to be included in the
   * array.
   *
   * Optionally, the array may be joined into a string.
   *
   * Optionally sets the active definitions to all the definitions that were
   * found in the string.
   *
   * @param targetText A string representing the text to be scanned.
   *
   * @param options An object of options that can modify the behaviour of the
   * scanning process. Options are:
   *   - `delimiter` - A string that joins the definition values into a string.
   * If set to `false`, an array of definition values is returned instead of a
   * string. Default: `false`
   *   - `minify` - Whether the resulting string should be minified according
   * to the user-defined minifier function. Has effect only when `delimeter` is
   * a string. Default: `false`
   *   - `overwriteActiveDefinitions` - Whether the active definitions should
   * be overwritten with the definitions found in the string. Default: `false`
   */
  public generate(targetText: string, options: GenerateOptions = {}) {
    const defaults = {
      minify: false,
      overwriteActiveDefinitions: false,
      delimiter: false as string | false,
      target: ""
    };
    const {
      minify,
      overwriteActiveDefinitions,
      delimiter,
      target
    } = Object.assign(defaults, options, { target: targetText });

    if (typeof target !== "string") return;

    // Get values of definitions found in the target text
    const validDefinitions = this.scan(target, {
      overwriteActiveDefinitions
    });
    const definitionValues = validDefinitions.map(definition =>
      this.get(definition)
    );

    // Return the definition values either as as array or as a string
    if (delimiter === false) return definitionValues;
    return definitionValues
      .map(value => {
        const valueAsString = stringify(value);
        if (minify) {
          return this[minifierSym](valueAsString);
        } else return valueAsString;
      })
      .join(delimiter);
  }

  /**
   * Returns an array of keywords (names) of definitions that were found in the
   * textTarget string. Definitions must be active to be included in the array.
   *
   * Optionally, the array may be joined into a string.
   *
   * Optionally sets the active definitions to all the definitions that were
   * found in the string.
   *
   * @param targetText A string representing the text to be scanned.
   *
   * @param options An object of options that can modify the behaviour of the
   * scanning process. Options are:
   *   - `delimiter` - A string that joins the definition keywords into a
   * string. If set to `false`, an array of definition values is returned
   * instead of a string. Default: `false`
   *   - `overwriteActiveDefinitions` - Whether the active definitions should
   * be overwritten with the definitions found in the string. Default: `false`
   */
  public scan(targetText: string, options: ScanOptionsNoDelimeter): string[];
  public scan(targetText: string, options: ScanOptionsWithDelimeter): string;
  public scan(targetText: string, options: ScanOptions = {}) {
    const defaults = {
      delimeter: false as string | false,
      overwriteActiveDefinitions: false,
      target: ""
    };
    const { delimeter, overwriteActiveDefinitions, target } = Object.assign(
      defaults,
      options,
      { target: targetText }
    );
    if (typeof target !== "string") return;

    // Based on the top-level matched keywords, search for full keywords
    const ownDefinitionKeys = Object.keys(this.definitions).map(
      definitionKey => {
        // Take the whole word that matched
        const definitionKeyRegExp = new RegExp(
          definitionKey + "(\\.\\w+)*",
          "g"
        );
        const matchedDefinitions = target.match(definitionKeyRegExp) || [];

        // Filter out invalid/unknown definitions
        const ownMatchedDefinitions = matchedDefinitions.filter(definitionKey =>
          this.has(definitionKey)
        );

        // Activate the valid definitions
        if (overwriteActiveDefinitions) {
          // Disable all previously detected definitions.
          this.activeDefinitions = {};
          ownMatchedDefinitions.forEach(definition =>
            this.activate(definition)
          );
          return ownMatchedDefinitions;
        } else {
          // Else filter out definitions that are not in activeDefinitions
          return ownMatchedDefinitions.filter(definition =>
            this.has(definition, { definitionsObject: "active" })
          );
        }
      }
    );

    // Flatten the array (in case there was more definition for any top-leve
    // keyword)
    const definitionKeys = ownDefinitionKeys.reduce(
      (aggregateArr, definitionKey) => {
        if (Array.isArray(definitionKey)) aggregateArr.push(...definitionKey);
        else aggregateArr.push(definitionKey);
        return aggregateArr;
      },
      []
    );

    if (delimeter !== false) {
      return definitionKeys.join(delimeter);
    } else {
      return definitionKeys;
    }
  }
}
