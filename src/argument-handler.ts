import { IArgumentHandler } from "./interface/argument-handler";
import { IArgumentHandlerOptions } from "./interface/argument-handler-options";
import { IDefinition } from "./interface/definition";

import { pathHandler } from "./lib/handlers/path-handler";
import { optionsHandler } from "./lib/handlers/options-handler";
import { definitionHandler } from "./lib/handlers/definition-handler";
import { definitionsObjectHandler } from "./lib/handlers/definitions-object-handler";
import { copyObject } from "./lib/copy-object";
import { createDefinition } from "./lib/create-definition";

type Filter<T, U> = T extends U ? T : never;
type LocalArgumentHandlerOptions<T1, T2, T3, T4> = Partial<{
  args: IArgumentHandlerOptions["args"];
  definition: IArgumentHandlerOptions["definition"];
  definitionManager: IArgumentHandlerOptions["definitionManager"];
  definitions: IArgumentHandlerOptions["definitions"];
  definitionsObject: T4;
  defaults: T2;
  lastPathComponent: IArgumentHandlerOptions["lastPathComponent"];
  options: T3;
  path: T1;
}>;
type FilteredPath<T> = Filter<IArgumentHandlerOptions["path"], T>;

type HandlerFunction<T, T1, T2, T3, T4> = (
  options: LocalArgumentHandlerOptions<T1, T2, T3, T4>,
  ...args: any[]
) => T;
type HandlerOptions<T, T1, T2, T3, T4> = T | HandlerFunction<T, T1, T2, T3, T4>;

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
 * @method `tap` Calls a callback with stored arguments. Results are ignored.
 *
 * @method `new` Calls a callback with stored arguments and creates new instance
 * with the result.
 *
 * @method `finally` Calls a callback with stored arguments and returns the result.
 */
export class DefinitionManagerArgumentHandler<
  Path extends IArgumentHandlerOptions["path"],
  Defaults extends IArgumentHandlerOptions["defaults"],
  Options extends IArgumentHandlerOptions["options"],
  DefObject extends IArgumentHandlerOptions["definitionsObject"]
> implements IArgumentHandler {
  private _args: IArgumentHandlerOptions["args"] = [];
  private _definition: IArgumentHandlerOptions["definition"];
  private _definitionManager: IArgumentHandlerOptions["definitionManager"];
  private _definitions: IArgumentHandlerOptions["definitions"] = [];
  private _definitionsObject: DefObject = {} as DefObject;
  private _defaults: Defaults = {} as Defaults;
  private _lastPathComponent: IArgumentHandlerOptions["lastPathComponent"] = "";
  private _options: Options = {} as Options;
  private _path: FilteredPath<Path>;

  constructor(
    options: LocalArgumentHandlerOptions<Path, Defaults, Options, DefObject>
  ) {
    this._args = options.args || [];
    this._definition = options.definition || "";
    this._definitionManager = options.definitionManager;
    this._definitions = options.definitions || [];
    this._definitionsObject =
      options.definitionsObject || (createDefinition() as DefObject);
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
   * @param handlerOptions An object (or a function that returns an object) of
   * options that can modify the behaviour of the underlying definition
   * processor. Options are:
   *   - `abortOnFail` - Whether the handler should not proceed if definition
   * is not found or it is null. Default: `true`
   *   - `action` - boolean or null, whether the newly created object and the path
   * to it (if 'create': true) should be explicitly actived, inactived, or left
   * as is, in which case the newly created object is actiaved, but path is not
   * altered.
   * Default: `null`
   *   - `activeStatus` - boolean or null, whether only active (true), inactive
   * (false), or all (null) definitions should be considered when getting a
   * definition. Default: `null`
   *   - `create` - boolean, whether the object specified by path should be created
   * if it doesn't exist yet. Default: `true`
   *   - `depthOffset` - Specify offset from the path's depth, at which the
   * definition object should be retrieved or created. Default: `0`
   */
  public getDefinition(
    newPropertyValues: Partial<IArgumentHandlerOptions> = {},
    handlerOptions: HandlerOptions<
      {
        abortOnFail?: boolean;
        activeStatus?: boolean | null;
        action?: boolean | null;
        create?: boolean;
        depthOffset?: number;
      },
      Path,
      Defaults,
      Options,
      DefObject
    > = {}
  ): DefinitionManagerArgumentHandler<Path, Defaults, Options, DefObject> {
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

    return definitionHandler(
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
      typeof handlerOptions === "function"
        ? handlerOptions(this.getProperties())
        : handlerOptions
    );
  }

  /**
   * Processes definitions object. Looks up a specific definitions object if
   * string is given. Returns given object if it object.
   *
   * @param newPropertyValues An object of values that overwrite the values
   * stored in the argument handler.
   *
   * @param handlerOptions An object (or a function that returns an object) of
   * options that can modify the behaviour of the underlying definitions object
   * processor.
   */
  public processDefinitionsObject(
    newPropertyValues: Partial<IArgumentHandlerOptions> = {},
    handlerOptions: HandlerOptions<{}, Path, Defaults, Options, DefObject> = {}
  ): DefinitionManagerArgumentHandler<Path, Defaults, Options, IDefinition> {
    const { definitionsObject, definitionManager } = Object.assign(
      this.getProperties(),
      newPropertyValues
    );

    return definitionsObjectHandler(
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
      typeof handlerOptions === "function"
        ? (handlerOptions as Function)(this.getProperties())
        : handlerOptions
    );
  }

  /**
   * Processes given options and defaults by overlying options over
   * defaults and stores that as the options.
   *
   * @param newPropertyValues An object of values that overwrite the values
   * stored in the argument handler.
   *
   * @param handlerOptions An object (or a function that returns an object) of
   * options that can modify the behaviour of the underlying options processor.
   */
  public processOptions(
    newPropertyValues: Partial<IArgumentHandlerOptions> = {},
    handlerOptions: HandlerOptions<{}, Path, Defaults, Options, DefObject> = {}
  ): DefinitionManagerArgumentHandler<
    Path,
    Defaults,
    Options & Defaults,
    DefObject
  > {
    const { defaults, options } = Object.assign(
      this.getProperties(),
      newPropertyValues
    );

    return optionsHandler(
      options => {
        const newProperties = Object.assign(this.getProperties(), { options });
        return new DefinitionManagerArgumentHandler(newProperties);
      },
      defaults,
      options,
      typeof handlerOptions === "function"
        ? (handlerOptions as Function)(this.getProperties())
        : handlerOptions
    );
  }

  /**
   * Processes given path from string to array of strings and stores that as
   * path.
   *
   * @param newPropertyValues An object of values that overwrite the values
   * stored in the argument handler.
   *
   * @param handlerOptions An object (or a function that returns an object) of
   * options that can modify the behaviour of the underlying path processor.
   */
  public processPath(
    newPropertyValues: Partial<IArgumentHandlerOptions> = {},
    handlerOptions: HandlerOptions<{}, Path, Defaults, Options, DefObject> = {}
  ): DefinitionManagerArgumentHandler<string[], Defaults, Options, DefObject> {
    const { path } = Object.assign(this.getProperties(), newPropertyValues);

    return pathHandler(
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
      (typeof handlerOptions === "function"
        ? (handlerOptions as Function)(this.getProperties())
        : handlerOptions) as {}
    );
  }

  /**
   * Calls a callback with an object of stored/processed arguments as the first
   * argument. Returns Argument Handler object, where the results of the
   * callback are used as the parameters for the returned Argument Handler
   * instance.
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
  public new = (
    callback: ((
      properties: LocalArgumentHandlerOptions<
        Path,
        Defaults,
        Options,
        DefObject
      >
    ) => IArgumentHandlerOptions) = props => props as IArgumentHandlerOptions
  ) => {
    return new DefinitionManagerArgumentHandler(callback(this.getProperties()));
  };

  /**
   * Calls a callback with an object of stored/processed arguments as the first
   * argument. Returns Argument Handler object. The results of the callback
   * do not affect the returned Argument Handler instance.
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
  public tap(
    callback: (
      properties: LocalArgumentHandlerOptions<
        Path,
        Defaults,
        Options,
        DefObject
      >
    ) => void = props => undefined
  ) {
    callback(this.getProperties());
    return this;
  }

  /**
   * Calls a callback with an object of stored/processed arguments as the first
   * argument. And returns the result of that callback.
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
