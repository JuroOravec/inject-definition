import { IDefinitionEntry } from "src/interface/definition-entry";
import {
  IVariableNameRetriever,
  IVariableNameReplacer
} from "src/interface/definition-injector-custom-methods";

import { stringify } from "./stringify";

/**
 * For each definition, replace the name of the first variable
 * that is being defined to an internal version to prevent clashes
 *
 * Relevant only if the definitions include code snippets with variables.
 *
 * @param definitionEntries An array of definitions entries as objects
 * `{keyword, value}`
 *
 * @param variableNameRetriever A function that extracts the name of a
 * variable from a given definition.
 *
 * @param variableNameReplacer A function that replaces the name of a
 * variable from a definition with a new value.
 */
export function preventVariableClashes(
  definitionEntries: IDefinitionEntry[],
  variableNameRetriever: IVariableNameRetriever,
  variableNameReplacer: IVariableNameReplacer
) {
  /**
   * For clash avoidance, counter object is used that adds 1 to each time
   * a particular variable name has been encountered across all provided
   * definitions.
   */
  const counter = {};
  const definitions = definitionEntries.map(
    ({ keyword, value, dependencies }) => {
      const definition = stringify(value);

      // Retrieve the name of the first defined variable as specified by
      // user-defined methods.
      const varName = variableNameRetriever(definition);

      // Do not set the internal variable name if invalid type or none found
      if (
        (typeof varName !== "number" && typeof varName !== "string") ||
        varName === ""
      ) {
        throw TypeError(
          `Value of Type ${typeof varName} cannot be used as a variable name.`
        );
      }

      // Update counter and create internal variable name
      if (counter.hasOwnProperty(varName)) counter[varName] += 1;
      else counter[varName] = 0;

      /** Variable name with prefixed `_` and suffixed counter. E.g. `_var1` */
      const internalVarName = "_" + varName + counter[varName];

      // Replace the variable name to a new one at a location specified by
      // the user-defined function
      const definitionWithInternalName = variableNameReplacer(
        definition,
        varName,
        internalVarName
      );

      if (typeof definitionWithInternalName !== "string") {
        throw TypeError(
          "Method variableNameReplacer must return a stringified definition"
        );
      }

      return {
        dependencies,
        externalKeyword: keyword,
        internalKeyword: internalVarName,
        value: definitionWithInternalName
      };
    }
  );

  // For each dependency within definitions, replace them to the internal names
  definitions.forEach(definition => {
    definition.dependencies.forEach(dependency => {
      const { externalKeyword, internalKeyword } = definitions.find(
        definition => definition.externalKeyword === dependency
      );
      const regex = new RegExp(externalKeyword.replace(/\./g, "\\."), "g");
      definition.value = definition.value.replace(regex, internalKeyword);
    });
  });

  return definitions;
}
