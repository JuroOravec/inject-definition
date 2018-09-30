/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;

import { hasBranchValue } from "./has-branch-value";

/**
 * Removes nested definitions objects that do not terminate with a value
 * (E.g. they are only nested objects terminating with empty object)
 *
 * @param path An array of strings representing path to a definition.
 *
 * @param definitionsObject An object that contains definitions.
 */

export function removeEmptyBranch(
  path: string[],
  definitionsObject: IDefinition
) {
  const pathMappedDefinitionObjects: {
    parent: IDefinition;
    key: string;
    value: any;
  }[] = [];

  path.reduce((definitionObject, currentPath) => {
    if (definitionObject === null) return null;
    if (!definitionObject.hasOwnProperty(currentPath)) {
      return null;
    }

    pathMappedDefinitionObjects.push({
      parent: definitionObject,
      key: currentPath,
      value: definitionObject[currentPath]
    });
    return definitionObject[currentPath];
  }, definitionsObject);

  // pathMappedTemplatObjects is array of nested definition objects,
  // as specified by path, and going deeper with increasing index
  //
  // shallower ---------------------> deeper
  // [{}, {}, {}, {}, str, null, null, null]
  //
  // Where '{}' is definition objects, 'str' is the value, and 'null'
  // is where the specified path was deeper than the specified branch.

  // Reduce loop starts at the deepest end of the branch and checks upwards
  // whether the branch can be removed.
  pathMappedDefinitionObjects.reduceRight(
    (canRemove, pathMappedDefinitionObject, i) => {
      // canRemove propagates upwards the info on whether the branch has any value
      // down the tree.
      if (!canRemove) return false;

      // If current item is null (e.g. path is deeper than the definitionObject),
      // it is unknown if the branch has value, so propagate consent to remove
      // up the tree until non-null is encountered.
      if (pathMappedDefinitionObject.value === null) return true;

      // If current item is not an object nor null, it is a value, so do not
      // remove this branch as it has a value, and propagate this info
      // through canRemove
      if (typeof pathMappedDefinitionObject.value !== "object") {
        return false;
      }

      // Check if object has properties and delete those sub-branches that lack value
      Object.keys(pathMappedDefinitionObject.value).forEach(key => {
        if (!hasBranchValue(pathMappedDefinitionObject.value[key])) {
          delete pathMappedDefinitionObject.value[key];
        }
      });

      // If now the object has no properties, it has no value, and can be removed
      if (Object.keys(pathMappedDefinitionObject.value).length === 0) {
        delete pathMappedDefinitionObject.parent[
          pathMappedDefinitionObject.key
        ];
      }
      return true;
    },
    true
  );
}
