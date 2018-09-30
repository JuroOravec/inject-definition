/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;

import { getOrCreateDefinitionParent } from "./get-or-create-definition-parent";
import { DefinitionManagerArgumentHandler } from "../argument-handler";

type DefinitionWrapperOptions = {
  abortOnFail?: boolean;
  create: boolean;
  depthOffset: number;
};

/**
 * Looks up specified definition. Runs the passed callback if and only if
 * the definition exists, and prepends the found definition as the first
 * argument. First 4 arguments (`callback`, `definitionPath`,
 * `definitionObject`, `options`) are consumed (they are not forwarded to the
 * callback), the remaining arguments are forwarded to the callback.
 *
 * @param callback A function that is called with prepended definition object.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject A definitions object that is searched through.
 *
 * @param options An object of options:
 *   - `abortOnFail` - Whether the wrapper should not proceed if definition
 * is not found or it is null. Default: `true`
 *   - `create` - boolean, whether the object specified by path should be created
 * if it doesn't exist yet. Default: `true`
 *   - `depthOffset` - Specify offset from the path's depth, at which the
 * definition object should be retrieved or created. Default: `0`
 */

export function definitionWrapper<T>(
  callback: (definition: IDefinition, ...args: any[]) => T,
  path: string[],
  definitionsObject: IDefinition = {},
  options: {
    abortOnFail?: boolean;
    create?: boolean;
    depthOffset?: number;
  } = {},
  ...args: any[]
) {
  const defaults = { abortOnFail: true };

  return new DefinitionManagerArgumentHandler({
    path,
    definitionsObject,
    options,
    defaults
  })
    .processOptions()
    .finally(({ path, definitionsObject, options }) => {
      const definition = getOrCreateDefinitionParent(
        path as string[],
        definitionsObject,
        options
      );
      if (
        definition === null &&
        (options as DefinitionWrapperOptions).abortOnFail
      )
        return;

      return callback(definition, ...args);
    }) as T;
}
