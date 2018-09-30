/// <reference path="./interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;
import IDefinitionManager = DefinitionInjector.IDefinitionManager;
import IOptions = DefinitionInjector.IOptions;

import { getOrCreateDefinitionParent } from "./lib/get-or-create-definition-parent";
import { removeEmptyBranch } from "./lib/remove-empty-branch";

import { DefinitionManagerArgumentHandler } from "./argument-handler";
import { getOrHasDefintion } from "./lib/get-or-has-definition";
import { copyObject } from "./lib/copy-object";

/**
 * A class that handles addition, removal, activation, deactivation and
 * existence of definitions.
 *
 * @property `definitions` An object of definitions stored as a tree of nested
 * definition objects, where leafs are definition values.
 *
 * @property `activeDefinitions` An object of definitions stored as a tree of
 * nested definition objects. A subset of `definitions`. Only definitions that
 * have existing path in `activeDefinitions` will be recognized when scanning/
 * generating/injecting text.
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
 */
export class DefinitionManager implements IDefinitionManager {
  definitions: IDefinitionManager["definitions"];
  activeDefinitions: IDefinitionManager["activeDefinitions"];

  constructor(
    options: {
      definitions?: IDefinitionManager["definitions"];
      activeDefinitions?: IDefinitionManager["definitions"];
    } = {}
  ) {
    const defaults = { definitions: {}, activeDefinitions: {} };
    const { definitions, activeDefinitions } = Object.assign(
      defaults,
      copyObject(options)
    );
    this.definitions = typeof definitions === "object" ? definitions : {};
    this.activeDefinitions =
      typeof definitions === "object" ? activeDefinitions : {};
  }

  /**
   * Adds a definition to the `definitions` object and optionally
   * also to `activeDefinitions`.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param definition Value of the definition. This can be anything.
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are:
   *   - `activate` - Whether the definition should be automatically activated.
   * Non-active definitions will be ignored when scanning/generating/injecting
   * text. Default: `true`
   */
  define(
    path: string | string[],
    definition: string,
    options: IOptions & {
      activate?: boolean;
    } = {}
  ) {
    const definitionsObject = this.definitions;
    const defaults = {
      activate: true
    };

    return new DefinitionManagerArgumentHandler({
      definition,
      options,
      path,
      defaults,
      definitionsObject,
      definitionManager: this
    })
      .processPath()
      .processOptions()
      .finally(
        ({
          definition,
          definitionManager,
          definitionsObject,
          lastPathComponent,
          options,
          path
        }) => {
          // TODO(Juro) Add handling for include and exclude options

          const definitionsObjects = [definitionsObject];
          if (options.activate) {
            definitionsObjects.push(definitionManager.activeDefinitions);
          }

          // Add definition to definition Objects
          definitionsObjects.forEach(definitionsObject => {
            const definitionParent = getOrCreateDefinitionParent(
              path,
              definitionsObject
            );
            definitionParent[lastPathComponent] = definition;
          });
        }
      );
  }

  /**
   * Removes a definition by removing it from the `definitions` object and
   * `activeDefinitions` object.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are:
   */
  undefine(path: string | string[], options: IOptions = {}) {
    const definitionWrapperOptions = {
      abortOnFail: false,
      create: false,
      depthOffset: -1
    };

    return new DefinitionManagerArgumentHandler({
      path,
      options,
      definitionsObject: this.definitions
    })
      .processPath()
      .processOptions()
      .getDefinition({}, definitionWrapperOptions)
      .getDefinition(
        { definitionsObject: this.activeDefinitions },
        definitionWrapperOptions
      )
      .finally(({ path, options, definitions, lastPathComponent }) => {
        // TODO(Juro) Add handling for include and exclude options

        // Remove definition from all passed definitions objects
        definitions
          .filter(definition => definition !== null)
          .forEach(definitionsObject => {
            delete definitionsObject[lastPathComponent];

            // If after the removal, the branch is empty, remove it
            removeEmptyBranch(path, definitionsObject);
          });
      });
  }

  /**
   * Activates a definition by adding it to the `activeDefinitions` object.
   * Does nothing if the definition does not exist in the `definitions` object.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are:
   */
  activate(path: string | string[], options: IOptions = {}) {
    const definitionsParentOptions = {
      abortOnFail: false,
      create: true,
      depthOffset: -1
    };
    const activeDefinitionsParentOptions = {
      abortOnFail: false,
      create: true,
      depthOffset: -1
    };

    return new DefinitionManagerArgumentHandler({
      path,
      options,
      definitionsObject: this.definitions
    })
      .processPath()
      .processOptions()
      .getDefinition({}, definitionsParentOptions)
      .getDefinition(
        { definitionsObject: this.activeDefinitions },
        activeDefinitionsParentOptions
      )
      .finally(({ definitions, lastPathComponent, options, path }) => {
        if (!definitions[0].hasOwnProperty(lastPathComponent)) return;

        // TODO(Juro) Add handling for include and exclude options

        // Enable the branch by adding it to the activeDefinitions definition
        // object
        if (!definitions[1].hasOwnProperty(lastPathComponent)) {
          definitions[1][lastPathComponent] = undefined;
        }
      });
  }

  /**
   * Deactivates a definition by removing it from the `activeDefinitions`
   * object. Does nothing if the definition does not exist in the `definitions` object.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are:
   */
  deactivate(path: string | string[], options: IOptions = {}) {
    const definitionOptions = {
      create: false,
      depthOffset: -1
    };

    return new DefinitionManagerArgumentHandler({
      path,
      options,
      definitionsObject: this.activeDefinitions
    })
      .processPath()
      .processOptions()
      .getDefinition({}, definitionOptions)
      .finally(
        ({
          definitions,
          definitionsObject,
          lastPathComponent,
          options,
          path
        }) => {
          // TODO(Juro) Add handling for include and exclude options

          // Disable the definition by removing it from this.activeDefinitions
          // definition object.
          if (definitions[0].hasOwnProperty(lastPathComponent)) {
            delete definitions[0][lastPathComponent];
            removeEmptyBranch(path, definitionsObject);
          }
        }
      );
  }

  /**
   * Retrieves value of a definition specified by path. Returns undefined if
   * no definition can be found.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are:
   *   - `definitionsObject` - Type of definitions object that will be searched
   * through. Available values are `'all'`, `'active'`. Default: `'all'`
   */
  get(
    path: string | string[],
    options: IOptions & { definitionsObject?: "all" | "active" } = {}
  ): IDefinition[keyof IDefinition] {
    return getOrHasDefintion(
      this,
      path,
      false,
      options
    ) as IDefinition[keyof IDefinition];
  }

  /**
   * Checks if a definition specified by a path exists, and returns `true` if
   * so. Returns `false` if a definition could not be found.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are:
   *   - `definitionsObject` - Type of definitions object that will be searched
   * through. Available values are `'all'`, `'active'`. Default: `'all'`
   */
  has(
    path: string | string[],
    options: IOptions & { definitionsObject?: "all" | "active" } = {}
  ): boolean {
    return getOrHasDefintion(this, path, true, options) as boolean;
  }
}
