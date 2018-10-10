/// <reference path="../interface/definition-injector.ts" />

import IDefinitionEntry = DefinitionInjector.IDefinitionEntry;
import IDefinitionInjector = DefinitionInjector.IDefinitionInjector;
import { resolveDependency } from "./resolve-dependency";
import { stringify } from "./stringify";

/**
 *
 * @param definitionInjector An instance of DefinitionInjector whose
 * definitions are used.
 * @param definitionEntries Array of objects, each describing a definition
 * that may or may not have dependencies.
 *
 * @return Sorted array of definition entries with dependency definitions added
 */
export function resolveDefinitionDependencies(
  definitionInjector: IDefinitionInjector,
  definitionEntries: IDefinitionEntry[]
) {
  let dependencyRelationships: string[][] = [];
  let dependencyNodes: string[] = [];
  let defEntries: IDefinitionEntry[] = definitionEntries.slice();

  definitionEntries.forEach(definition => {
    const allDependencyEntriesAndNodesAndRelationships = recursiveDependencySearch(
      defEntries,
      dependencyNodes,
      dependencyRelationships,
      definition.keyword,
      definition.dependencies
    );

    defEntries = allDependencyEntriesAndNodesAndRelationships.defEntries;
    dependencyNodes = allDependencyEntriesAndNodesAndRelationships.depNodes;
    dependencyRelationships =
      allDependencyEntriesAndNodesAndRelationships.depRelationships;
  });

  const definitionOrder = resolveDependency(
    dependencyNodes,
    dependencyRelationships
  ).reverse();

  const orderedDefinitions = definitionOrder.map(keyword => {
    const definition = defEntries.find(def => def.keyword === keyword);
    if (definition === null) {
      const insertedDefinition: IDefinitionEntry = {
        keyword,
        value: definitionInjector.get(keyword),
        dependencies: []
      };
      return insertedDefinition;
    }
    return definition;
  });

  return orderedDefinitions;

  function recursiveDependencySearch(
    definitionEntries: IDefinitionEntry[],
    dependencyNodes: string[],
    dependencyRelationships: string[][],
    keyword: string,
    dependencies: string[]
  ): {
    defEntries: IDefinitionEntry[];
    depNodes: string[];
    depRelationships: string[][];
  } {
    const definitionEntriesCopy = definitionEntries.slice();
    const dependencyNodesCopy = dependencyNodes.slice();
    const dependencyRelationshipsCopy = dependencyRelationships.slice();

    if (!dependencyNodesCopy.includes(keyword)) {
      dependencyNodesCopy.push(keyword);
      definitionEntriesCopy.push({
        keyword,
        value: definitionInjector.get(keyword),
        dependencies: dependencies
      });
    }

    return dependencies.reduce(
      ({ defEntries, depNodes, depRelationships }, dependency) => {
        depRelationships.push([keyword, dependency]);

        const dependencyValue = definitionInjector.get(dependency);
        const dependencyDependencies = definitionInjector.scan(
          stringify(dependencyValue),
          { delimiter: false }
        ) as string[];

        return recursiveDependencySearch(
          defEntries,
          depNodes,
          depRelationships,
          dependency,
          dependencyDependencies
        );
      },
      {
        defEntries: definitionEntriesCopy,
        depNodes: dependencyNodesCopy,
        depRelationships: dependencyRelationshipsCopy
      } as {
        defEntries: IDefinitionEntry[];
        depNodes: string[];
        depRelationships: string[][];
      }
    );
  }
}
