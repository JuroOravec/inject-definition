/// <reference path="../interface/definition-manager.ts" />

import IDefinitionManager = DefinitionInjector.IDefinitionManager;
import IDefinition = DefinitionInjector.IDefinition;

import { DefinitionManagerArgumentHandler } from "../argument-handler";
import { search } from "./search";

/**
 * Common path for either retrieving or checking existence of definitions
 * in Definition Manager.
 *
 * @param definitionManager An instance of Definition Manager that will be
 * checked for the definiton.
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param returnAsBoolean Whether the function should return boolean or the
 * found definition. This setting overrides user-defined setting.
 *
 * @param options An object of options:
 *   - `select` - Specify which definitions object should be used.
 * Available options: `all` or `active`. Default: `all`
 *
 * @param defaults An object with default values that can be overriden with
 * user-defined values. Default: {}
 */
export function getOrHasDefintion(
  definitionManager: IDefinitionManager,
  path: string | string[],
  returnAsBoolean: false,
  options: {
    select?: "all" | "active" | "inactive";
  }
): IDefinition["value"];
export function getOrHasDefintion(
  definitionManager: IDefinitionManager,
  path: string | string[],
  returnAsBoolean: true,
  options: {
    select?: "all" | "active" | "inactive";
  }
): boolean;
export function getOrHasDefintion(
  definitionManager: IDefinitionManager,
  path: string | string[],
  returnAsBoolean: boolean,
  options: {
    select?: "all" | "active" | "inactive";
  } = {}
) {
  let activeStatus: boolean | null;
  if (options.select === "active") activeStatus = true;
  else if (options.select === "inactive") activeStatus = false;
  else activeStatus = null;

  const defaults = {
    activeStatus
  };
  const definitionsObject = options.select || "all";

  return new DefinitionManagerArgumentHandler({
    options,
    defaults,
    path,
    definitionsObject,
    definitionManager: definitionManager
  })
    .processPath()
    .processOptions()
    .processDefinitionsObject()
    .finally(({ definitionsObject, options, path }) => {
      const searchOptions = Object.assign(options, {
        returnAsBoolean
      });

      return search(path, definitionsObject, searchOptions);
    });
}
