/// <reference path="./interface/definition-manager.ts" />

import ArgumentHandler = DefinitionInjector.ArgumentHandler;
import ArgumentHandlerOptions = DefinitionInjector.ArgumentHandlerOptions;
import IDefinition = DefinitionInjector.IDefinition;

import { pathWrapper } from "./lib/path-wrapper";
import { optionsWrapper } from "./lib/options-wrapper";
import { definitionWrapper } from "./lib/definition-wrapper";
import { definitionsObjectWrapper } from "./lib/definitions-object-wrapper";
import { copyObject } from "./lib/copy-object";

type Filter<T, U> = T extends U ? T : never;
type LocalArgumentHandlerOptions<T1, T2, T3, T4> = Partial<{
  args: ArgumentHandlerOptions["args"];
  definition: ArgumentHandlerOptions["definition"];
  definitionManager: ArgumentHandlerOptions["definitionManager"];
  definitions: ArgumentHandlerOptions["definitions"];
  definitionsObject: T4;
  defaults: T2;
  lastPathComponent: ArgumentHandlerOptions["lastPathComponent"];
  options: T3;
  path: T1;
}>;
type FilteredPath<T> = Filter<ArgumentHandlerOptions["path"], T>;

/**
 * Private class that handles processing of arguments passed to
 * DefinitionManager endpoints.
 *
 * @method `definition` Retrieves a definition based on specified path and
 * definitionsObject.
 *
 * @method `options` Overlays default option values with user-defined values.
 *
 * @method `path` Transforms a path from a string with dots '.' to an array of
 * strings.
 *
 * @method `finally` Calls a callback with stored arguments.
 */
export class DefinitionManagerArgumentHandler<
  Path extends ArgumentHandlerOptions["path"],
  Defaults extends ArgumentHandlerOptions["defaults"],
  Options extends ArgumentHandlerOptions["options"],
  DefObject extends ArgumentHandlerOptions["definitionsObject"]
> implements ArgumentHandler {
  private _args: ArgumentHandlerOptions["args"] = [];
  private _definition: ArgumentHandlerOptions["definition"];
  private _definitionManager: ArgumentHandlerOptions["definitionManager"];
  private _definitions: ArgumentHandlerOptions["definitions"] = [];
  private _definitionsObject: DefObject = {} as DefObject;
  private _defaults: Defaults = {} as Defaults;
  private _lastPathComponent: ArgumentHandlerOptions["lastPathComponent"] = "";
  private _options: Options = {} as Options;
  private _path: FilteredPath<Path>;

  constructor(
    options: LocalArgumentHandlerOptions<Path, Defaults, Options, DefObject>
  ) {
    this._args = options.args || [];
    this._definition = options.definition || "";
    this._definitionManager = options.definitionManager;
    this._definitions = options.definitions || [];
    this._definitionsObject = (options.definitionsObject || {}) as DefObject;
    this._defaults = (options.defaults || {}) as Defaults;
    this._options = (options.options || {}) as Options;
    this._path = (options.path || []) as FilteredPath<Path>;

    if (Array.isArray(this._path)) {
      if (this._path.length > 0) {
        this._lastPathComponent = this._path[this._path.length - 1];
      }
    } else if (typeof this._path === "string") {
      this._lastPathComponent = this._path;
    }
  }

  /**
   * Retrieves a definition specified by path and definitionsObject and pushes
   * that definition to the definitions array.
   *
   * @param newPropertyValues An object of values that overwrite the values
   * stored in the argument handler.
   *
   * @param wrapperOptions An object of options that can modify the behaviour
   * of the underlying definition processor. Options are:
   *   - `abortOnFail` - Whether the wrapper should not proceed if definition
   * is not found or it is null. Default: `true`
   *   - `create` - boolean, whether the object specified by path should be created
   * if it doesn't exist yet. Default: `true`
   *   - `depthOffset` - Specify offset from the path's depth, at which the
   * definition object should be retrieved or created. Default: `0`
   */
  public getDefinition(
    newPropertyValues: Partial<ArgumentHandlerOptions> = {},
    wrapperOptions = {}
  ) {
    const { path, definitionsObject } = Object.assign(
      this.getProperties(),
      newPropertyValues
    );

    if (!Array.isArray(path)) {
      throw TypeError(
        `Definition path must be an array of string, got ${typeof path}`
      );
    }
    if (typeof definitionsObject !== "object") {
      throw TypeError(
        `Definitions object must be an object, got ${typeof definitionsObject}`
      );
    }

    return definitionWrapper(
      definition => {
        const newDefinitions: IDefinition[] = this._definitions.slice();
        newDefinitions.push(definition);

        const newProperties = Object.assign(this.getProperties(), {
          definitions: newDefinitions
        });
        return new DefinitionManagerArgumentHandler(newProperties);
      },
      path,
      definitionsObject as IDefinition,
      wrapperOptions
    );
  }

  /**
   * Processes definitions object. Looks up a specific definitions object if
   * string is given. Returns given object if it object.
   *
   * @param newPropertyValues An object of values that overwrite the values
   * stored in the argument handler.
   *
   * @param wrapperOptions An object of options that can modify the behaviour
   * of the underlying definitions object processor.
   */
  public processDefinitionsObject(
    newPropertyValues: Partial<ArgumentHandlerOptions> = {},
    wrapperOptions: object = {}
  ) {
    const { definitionsObject, definitionManager } = Object.assign(
      this.getProperties(),
      newPropertyValues
    );

    return definitionsObjectWrapper(
      definitionsObject => {
        const newProperties: LocalArgumentHandlerOptions<
          Path,
          Defaults,
          Options,
          IDefinition
        > = Object.assign(this.getProperties(), { definitionsObject });

        return new DefinitionManagerArgumentHandler(newProperties);
      },
      definitionManager,
      definitionsObject,
      wrapperOptions
    );
  }

  /**
   * Processes given options and defaults by overlying options over
   * defaults and stores that as the options.
   *
   * @param newPropertyValues An object of values that overwrite the values
   * stored in the argument handler.
   *
   * @param wrapperOptions An object of options that can modify the behaviour
   * of the underlying options processor.
   */
  public processOptions(
    newPropertyValues: Partial<ArgumentHandlerOptions> = {},
    wrapperOptions: object = {}
  ) {
    const { defaults, options } = Object.assign(
      this.getProperties(),
      newPropertyValues
    );

    return optionsWrapper(
      options => {
        const newProperties = Object.assign(this.getProperties(), { options });
        return new DefinitionManagerArgumentHandler(newProperties);
      },
      defaults,
      options,
      wrapperOptions
    );
  }

  /**
   * Processes given path from string to array of strings and stores that as
   * path.
   *
   * @param newPropertyValues An object of values that overwrite the values stored
   * in the argument handler.
   *
   * @param wrapperOptions An object of options that can modify the behaviour
   * of the underlying path processor.
   */
  public processPath(
    newPropertyValues: Partial<ArgumentHandlerOptions> = {},
    wrapperOptions: object = {}
  ) {
    const { path } = Object.assign(this.getProperties(), newPropertyValues);

    return pathWrapper(
      path => {
        const newProperties: LocalArgumentHandlerOptions<
          string[],
          Defaults,
          Options,
          DefObject
        > = Object.assign(this.getProperties(), { path });

        return new DefinitionManagerArgumentHandler(newProperties);
      },
      path,
      wrapperOptions
    );
  }

  /**
   * Calls a callback with an object of stored/processed arguments as the first
   * argument.
   *
   * @param callback An function that accepts object of arguments as the first
   * argument. Available arguments are:
   *   - `args` - Custom arguments. Default: `[]`
   *   - `definition` - A value passed as definition value. Default: `""`
   *   - `definitions` - An array of definitions retrieved by definition
   * method. Default: `[]`
   *   - `definitionsObject` - A passed definitions object. Default: `{}`
   *   - `defaults` - An object of default values that may be overwriten by
   * values in options. Default: `{}`
   *   - `lastPathComponent` - A string that specifies property of parental
   * definitions object where the definition, specified by path, is located.
   * Default: `""`
   *   - `options` - An object of values that overwrite the defaults.
   * Default: `{}`
   *   - `path` - A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot '.' .
   * Default: `[]`
   */
  public finally<T>(
    callback: (
      properties: LocalArgumentHandlerOptions<
        Path,
        Defaults,
        Options,
        DefObject
      >
    ) => T
  ) {
    return callback(this.getProperties());
  }

  /**
   * Returns an object of stored arguments.
   *
   * @returns An object of stored arguments:
   *   - `args` - Custom arguments. Default: `[]`
   *   - `definition` - A value passed as definition value. Default: `""`
   *   - `definitions` - An array of definitions retrieved by definition
   * method. Default: `[]`
   *   - `definitionsObject` - A passed definitions object. Default: `{}`
   *   - `defaults` - An object of default values that may be overwriten by
   * values in options. Default: `{}`
   *   - `lastPathComponent` - A string that specifies property of parental
   * definitions object where the definition, specified by path, is located.
   * Default: `""`
   *   - `options` - An object of values that overwrite the defaults.
   * Default: `{}`
   *   - `path` - A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot '.' .
   * Default: `[]`
   */
  private getProperties() {
    const args = this._args.slice();
    const definition = this._definition;
    const definitionManager = this._definitionManager;
    const definitions = this._definitions.slice();
    const definitionsObject: DefObject = this._definitionsObject;
    const defaults = copyObject(this._defaults);
    const lastPathComponent = this._lastPathComponent;
    const options = copyObject(this._options);
    const path: FilteredPath<Path> = (typeof this._path === "string"
      ? this._path
      : this._path.slice()) as FilteredPath<Path>;

    return {
      args,
      definition,
      definitionManager,
      definitions,
      definitionsObject,
      defaults,
      lastPathComponent,
      options,
      path
    };
  }
}
