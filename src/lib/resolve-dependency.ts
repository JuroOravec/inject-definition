import * as toposort from "toposort";

/**
 * Wrapper for dependency resolution module.
 *
 * @param nodes An array of string, where each item is a node in the dependency
 * graph.
 *
 * @param dependecyEdges An array of [node, node] pairs that signify dependency
 * link between the two. Second node depends on the first one.
 *
 * @return Array of string (sorted nodes)
 */
export function resolveDependency<T>(
  nodes: string[],
  dependecyEdges: string[][]
) {
  return toposort.array(nodes, dependecyEdges) as string[];
}
