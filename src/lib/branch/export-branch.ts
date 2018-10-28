import {
  IDefinition,
  IDefinitionPartial,
  IDefinitionCondensed
} from "src/interface/definition";

import { diveDownBranch } from "./dive-down-branch";
import { defaults } from "../defaults/branch/export-branch";

/**
 * Exports a definition branch, formatting it either as full definion branch
 * (same as used internally), as partial objects with only children and values
 * or as condensed objects, where each definition value is either the
 * definition value itself, or is an object of children definitions that are of
 * same type.
 *
 * @param definition A definition object, which and whose children, are being
 * exported.
 * @param options An object of options:
 *   - `activeStatus` A boolean or null specifying definitions of what type
 * should be exported. `true` for active, `false` for inactive, `null` for all
 *   - `type` A string specifying the export type. either `"full"`, `"partial"`
 * or `"condensed"`
 */
export function exportBranch(
  definition: IDefinition,
  options: { activeStatus: boolean | null; type: "full" }
): IDefinition;
export function exportBranch(
  definition: IDefinition,
  options: { activeStatus: boolean | null; type: "partial" }
): IDefinitionPartial;
export function exportBranch(
  definition: IDefinition,
  options: {
    activeStatus: boolean | null;
    type: "condensed";
  }
): IDefinitionCondensed;
export function exportBranch(
  definition: IDefinition,
  options: {
    activeStatus: boolean | null;
    type: "full" | "partial" | "condensed";
  }
): IDefinition | IDefinitionPartial | IDefinitionCondensed;
export function exportBranch(
  definition: IDefinition,
  options: {
    activeStatus: boolean | null;
    type: "full" | "partial" | "condensed";
  }
) {
  const { activeStatus, type } = Object.assign({}, defaults, options);
  // If the definition matches the specified active status, go further down the
  // branch.
  const onDiveCheck = (definition: IDefinition) =>
    Object.keys(definition.children).length > 0;

  const onNoChildren = (definition: IDefinition) => {
    if (
      (typeof activeStatus === "boolean" &&
        definition.active === activeStatus) ||
      activeStatus === null ||
      definition.keyword === null
    ) {
      return onChildren(definition, []);
    }
  };
  // If the object has children, then based on the type of export, add children
  // definitions to the specified type of definition, and return that type of
  // definition.
  const onChildren = (definition: IDefinition, childrenValues: any[] = []) => {
    const filteredChildrenValues = childrenValues.filter(
      value => value !== undefined
    );
    const childrenAggregateActiveStatus =
      filteredChildrenValues.length === 0
        ? definition.active
        : filteredChildrenValues.some(keyValuePair => keyValuePair[1].active);
    const condensedDefinition: IDefinitionCondensed = definition.value;

    const partialDefinition: IDefinitionPartial = {
      children: {},
      value: definition.value
    };

    const fullDefinition: IDefinition = {
      active:
        (definition.value !== null && definition.active) ||
        childrenAggregateActiveStatus,
      children: {},
      keyword: definition.keyword,
      value: definition.value
    };

    let exportedDefinition:
      | IDefinition
      | IDefinitionPartial
      | IDefinitionCondensed;

    if (type === "full") exportedDefinition = fullDefinition;
    else if (type === "partial") exportedDefinition = partialDefinition;
    else if (type === "condensed") exportedDefinition = condensedDefinition;

    // Assign the children definitions either to the definition.children or
    // directly to the definition if condensed.
    filteredChildrenValues.forEach((keyValuePair: [string, any], i) => {
      if (type === "full" || type === "partial") {
        (exportedDefinition as IDefinitionPartial).children[keyValuePair[0]] =
          keyValuePair[1];
      } else if (type === "condensed") {
        if (i === 0) {
          (exportedDefinition as IDefinitionCondensed) = {};
        }
        exportedDefinition[keyValuePair[0]] = keyValuePair[1];
      }
    });

    const splitPath =
      typeof definition.keyword === "string"
        ? definition.keyword.split(".")
        : [];
    const lastPathComponent =
      splitPath.length > 0 ? splitPath[splitPath.length - 1] : "";

    // Return the definition as [key, pair], so the exported definition can
    // be assigned under the correct key
    if (
      (typeof definition.active === "boolean" &&
        definition.active === activeStatus &&
        definition.value !== null) ||
      childrenAggregateActiveStatus === activeStatus ||
      activeStatus === null ||
      definition.keyword === null
    ) {
      return [lastPathComponent, exportedDefinition];
    }
  };

  const exportedBranch = diveDownBranch(definition, {
    onDiveCheck,
    onChildren,
    onNoChildren
  });

  if (Array.isArray(exportedBranch)) {
    return exportedBranch[1];
  }
  return exportedBranch as
    | IDefinition
    | IDefinitionPartial
    | IDefinitionCondensed;
}
