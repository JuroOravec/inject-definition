import { IDefinition } from "src/interface/definition";

import { DefinitionManagerArgumentHandler } from "../argument-handler";
import { createDefinition } from "./create-definition";
import { defaults } from "./defaults/get-or-create-definition";

/**
 *  Creates or retrieves a definition value specified by path and definition
 *  object.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 *
 * @param options An object of options:
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
export function getOrCreateDefinition(
  path: string[],
  definitionsObject: IDefinition,
  options?: {
    action?: boolean | null;
    activeStatus?: boolean | null;
    create?: boolean;
    depthOffset?: number;
  }
) {
  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processOptions()
    .finally(({ definitionsObject, options, path }) => {
      return path.reduce((defObject, currentPath, i, arr) => {
        // Propagate null downwards if path is deeper than definition object
        if (defObject === null) return null;

        // Return null if the path to the definition object does not match
        // the desired active status when getting (i.e. NOT creating) a
        // definition
        if (
          !options.create &&
          typeof options.activeStatus === "boolean" &&
          defObject.active !== options.activeStatus
        ) {
          return null;
        }

        if (i === arr.length + options.depthOffset) {
          // Return the target definition Object and set it's activity
          if (options.action === true) {
            defObject.active = options.action;
          }
          return defObject;
        }

        if (!defObject.children.hasOwnProperty(currentPath)) {
          if (options.create && defObject !== undefined) {
            const parentDefinitionKeyword =
              defObject.keyword === null ? "" : defObject.keyword;

            const definitionKeyword =
              parentDefinitionKeyword !== ""
                ? parentDefinitionKeyword + "." + currentPath
                : currentPath;
            defObject.children[currentPath] = createDefinition({
              active:
                typeof options.action === "boolean" ? options.action : true,
              keyword: definitionKeyword
            });
          } else {
            return null;
          }
        }
        if (options.action === true) {
          defObject.active = options.action;
        }
        return defObject.children[currentPath];
      }, definitionsObject);
    });
}
