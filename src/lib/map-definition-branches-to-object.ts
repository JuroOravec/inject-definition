import { IDefinitionCondensed } from "src/interface/definition";

import { DefinitionManager } from "../definition-manager";
import { stringify } from "./stringify";

/**
 * Creates an object with the structure based on the passed definitions,
 * where properties are stringified branches.
 *
 * @param processedDefinitions An array of definition entries as objects
 * `{externalKeyword, internalKeyword, value}`.
 *
 * @param openingTag A string that represents the start of where the
 * definition's external keyword should be replaced for the internal one.
 *
 * @param closingTag A string that represents the end of where the
 * definition's external keyword should be replaced for the internal one.
 */
export function mapDefinitionBranchesToObject(
  processedDefinitions: {
    externalKeyword: string;
    internalKeyword: string;
    value: string;
  }[],
  openingTag: string,
  closingTag: string,
  quoteMark: string = "'"
) {
  const stringifiedDefinitionsObject = {} as IDefinitionCondensed;

  const definitionManager = new DefinitionManager();

  // Define the definitions to the temporary definition manager to create the
  // right structure. Instead of the actual value, the definition value is only
  // a reference, based on the user-defined referencing system wrapped in
  // enclosing tags
  processedDefinitions.forEach(definition => {
    const definitionReference = definition.internalKeyword;
    definitionManager.define(
      definition.externalKeyword,
      openingTag + definitionReference + closingTag,
      {
        activate: false
      }
    );
  });

  // Separately stringify each of the branches, and remove the enclosing
  // tags, so only the reference without quotes remains.
  const tagsRegExp = new RegExp(
    quoteMark + "?" + openingTag + "|" + closingTag + quoteMark + "?",
    "g"
  );
  const branches = definitionManager.getAll({ type: "condensed" } || {});
  Object.keys(branches).forEach(branchKey => {
    const branch = branches[branchKey];
    const branchAsString = stringify(branch);
    const stringifiedDefinition = branchAsString.replace(tagsRegExp, "");

    stringifiedDefinitionsObject[branchKey] = stringifiedDefinition;
  });

  return stringifiedDefinitionsObject;
}
