/// <reference path="./interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;
import IDefinitionCondensed = DefinitionInjector.IDefinitionCondensed;
import IDefinitionManager = DefinitionInjector.IDefinitionManager;

import { DefinitionManagerArgumentHandler } from "./argument-handler";
import { getOrCreateDefinitionParent } from "./lib/get-or-create-definition-parent";
import { getOrHasDefintion } from "./lib/get-or-has-definition";
import { copyObject } from "./lib/copy-object";
import { createDefinition } from "./lib/create-definition";
import { removeEmptyBranch } from "./lib/branch/remove-empty-branch";
import { changeBranchActiveStatus } from "./lib/branch/change-branch-active-status";
import { exportBranch } from "./lib/branch/export-branch";
import { undefineBranch } from "./lib/branch/undefine-branch";
import { inactivateBranchPath } from "./lib/branch/inactivate-branch-path";
import {
  constructorDefaults,
  defineDefaults,
  undefineAllDefaults,
  getAllDefaults
} from "./lib/defaults/definition-manager";

const definitionsSym = Symbol("definitions");

/**
 * A class that handles addition, removal, activation, deactivation and
 * existence of definitions.
 *
 * @method `define` Defines a definition, adding it to the `definitions` object
 * and optionally (not) activating it.
 *
 * @method `undefine` Removes a definition and all its child definitions.
 *
 * @method `undefineAll` Removes all definitions (or only all (in)active)
 *
 * @method `activate` Activates an existing definition.
 *
 * @method `activateAll` Activates all definitions.
 *
 * @method `deactivate` Deactivates an existing definition.
 *
 * @method `deactivateAll` Deactivates all definitions.
 *
 * @method `get` Returns a definition specified with a path.
 *
 * @method `getAll` Returns definitions tree (full / reduced / condensed) of
 * all / active / inactive definitions.
 *
 * @method `has` Returns a boolean of whether a definition exists at a
 * specified path.
 */
export class DefinitionManager implements IDefinitionManager {
  [definitionsSym]: IDefinition;

  constructor(
    options:
      | {
          definitions?: IDefinition;
        }
      | IDefinitionManager = {}
  ) {
    let definitions: IDefinition;
    if (typeof (options as IDefinitionManager).getAll === "function") {
      definitions = copyObject(
        (options as IDefinitionManager).getAll()
      ) as IDefinition;
    } else {
      const opt = Object.assign(
        {},
        copyObject(constructorDefaults),
        copyObject(options)
      );
      definitions = opt.definitions;
    }

    this[definitionsSym] =
      typeof definitions === "object" ? definitions : createDefinition();
  }

  /**
   * Adds a definition to the `definitions` object and optionally
   * also (not) activates it.
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
  public define(
    path: string | string[],
    definition: string,
    options: {
      activate?: boolean;
    } = {}
  ) {
    return new DefinitionManagerArgumentHandler({
      definition,
      options,
      path,
      defaults: defineDefaults,
      definitionsObject: this[definitionsSym]
    })
      .processPath()
      .processOptions()
      .getDefinition({}, ({ options }) => {
        return { action: options.activate };
      })
      .finally(
        ({
          definition,
          definitionsObject,
          lastPathComponent,
          options,
          path
        }) => {
          // Add definition to definition Objects
          const definitionParent = getOrCreateDefinitionParent(
            path,
            definitionsObject,
            { action: options.activate }
          );

          const newDefinition = createDefinition({
            keyword: path.join("."),
            value: definition,
            active: options.activate
          });
          definitionParent.children[lastPathComponent] = newDefinition;
          if (options.activate === false) {
            inactivateBranchPath(path, definitionsObject);
          }
          removeEmptyBranch(path, definitionsObject);
        }
      );
  }

  /**
   * Removes a definition by removing it from the `definitions` object along
   * with all its child definitions.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are: NONE
   */
  public undefine(path: string | string[], options: object = {}) {
    const definitionWrapperOptions = {
      abortOnFail: false,
      create: false,
      depthOffset: -1
    };

    return new DefinitionManagerArgumentHandler({
      path,
      options,
      definitionsObject: this[definitionsSym]
    })
      .processPath()
      .processOptions()
      .getDefinition({}, definitionWrapperOptions)
      .finally(({ path, definitions, lastPathComponent }) => {
        // Remove definition from all passed definitions objects
        definitions
          .filter(definition => definition !== null)
          .forEach(definitionsObject => {
            delete definitionsObject.children[lastPathComponent];

            // If after the removal, the branch is empty, remove it
            removeEmptyBranch(path, definitionsObject);
          });
      });
  }

  /**
   * Removes all definitions of particular type of active status.
   *
   *  @param options An object of options that can modify the behaviour
   * of the underlying process. Options are:
   *   - `select` - Type of active status of object that will be
   * removed. Available values are `'all'`, `'active'`, `'inactive'`.
   * Default: `'all'`
   */
  public undefineAll(options: { select?: "all" | "active" | "inactive" } = {}) {
    return new DefinitionManagerArgumentHandler({
      options,
      defaults: undefineAllDefaults,
      definitionManager: this
    })
      .processOptions()
      .finally(({ options, definitionManager }) => {
        let activeStatus: boolean | null;
        if (options.select === "active") activeStatus = true;
        else if (options.select === "inactive") activeStatus = false;
        else activeStatus = null;

        if (activeStatus === null) {
          Object.keys(this[definitionsSym].children).forEach(key =>
            this.undefine(key)
          );
          return;
        }

        Object.keys(this[definitionsSym].children).forEach(key => {
          undefineBranch(
            definitionManager,
            this[definitionsSym].children[key],
            {
              activeStatus
            }
          );
        });
      });
  }

  /**
   * Activates a definition. Does nothing if the definition is not defined.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are: NONE
   */
  public activate(path: string | string[], options: object = {}) {
    const definitionsParentOptions = {
      create: false,
      depthOffset: -1,
      action: true
    };

    return new DefinitionManagerArgumentHandler({
      path,
      options,
      definitionsObject: this[definitionsSym]
    })
      .processPath()
      .processOptions()
      .getDefinition({}, definitionsParentOptions)
      .finally(({ definitions, lastPathComponent }) => {
        if (!definitions[0].children.hasOwnProperty(lastPathComponent)) return;

        definitions[0].children[lastPathComponent].active = true;
      });
  }

  /**
   * Activates all definitions.
   */
  public activateAll() {
    changeBranchActiveStatus(this[definitionsSym], true);
  }

  /**
   * Deactivates a definition. Does nothing if the definition is not defined.
   *
   * @param path A string or array of strings specifying the path to a
   * definition. If as string, path components are separated by dot `'.'` .
   *
   * @param options An object of options that can modify the behaviour
   * of the underlying definition process. Options are: NONE
   */
  public deactivate(path: string | string[], options: object = {}) {
    const definitionOptions = {
      create: false,
      depthOffset: -1,
      action: false
    };

    return new DefinitionManagerArgumentHandler({
      path,
      options,
      definitionsObject: this[definitionsSym]
    })
      .processPath()
      .processOptions()
      .getDefinition({}, definitionOptions)
      .finally(({ path, definitions, lastPathComponent, options }) => {
        if (definitions[0].children.hasOwnProperty(lastPathComponent)) {
          definitions[0].children[lastPathComponent].active = false;
          inactivateBranchPath(path, this[definitionsSym]);
        }
      });
  }

  /**
   * Deactivates all definitions.
   */
  public deactivateAll() {
    changeBranchActiveStatus(this[definitionsSym], false);
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
   *   - `select` - Type of definitions object that will be searched
   * through. Available values are `'all'`, `'active'`, `'inactive'`. Default: `'all'`
   */
  public get(
    path: string | string[],
    options: {
      select?: "all" | "active" | "inactive";
    } = {}
  ): IDefinition["value"] {
    return getOrHasDefintion(this, path, false, options);
  }

  public getAll(
    options: {
      select?: "all" | "active" | "inactive";
      type?: "full" | "partial" | "condensed";
    } = {}
  ): IDefinition | IDefinitionCondensed {
    return new DefinitionManagerArgumentHandler({
      options,
      defaults: getAllDefaults
    })
      .processOptions()
      .finally(({ options }) => {
        let activeStatus: boolean | null;
        if (options.select === "active") activeStatus = true;
        else if (options.select === "inactive") activeStatus = false;
        else activeStatus = null;
        return exportBranch(this[definitionsSym], {
          type: options.type,
          activeStatus
        });
      });
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
   *   - `select` - Type of definitions object that will be searched
   * through. Available values are `'all'`, `'active'`, `'inactive'`. Default: `'all'`
   */
  public has(
    path: string | string[],
    options: {
      select?: "all" | "active" | "inactive";
    } = {}
  ): boolean {
    return getOrHasDefintion(this, path, true, options);
  }
}
