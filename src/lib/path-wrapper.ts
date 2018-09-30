/// <reference path="../interface/definition-manager.ts" />

import { processDefinitionManagerPath } from "./process-definition-manager-path";

/**
 * Processes and validates path. Calls passed callback if and only if the path
 * is valid, and prepends the path as the first argument. First 2 arguments
 * (`callback`, `path`) are consumed (they are not forwarded to the callback),
 * the remaining arguments are forwarded to the callback.
 *
 * @param callback A function that is called with prepended listified path,
 * in case the path is valid.
 *
 * @param path A string or array of strings that points to a definition within
 * a definitions object structure.
 */
export function pathWrapper<R>(
  callback: (path: string[], ...args: any[]) => R,
  path: string | string[],
  ...args: any[]
) {
  const pathAsArray = processDefinitionManagerPath(path);

  if (pathAsArray.length === 0) {
    console.warn("Invalid definition keyword.");
    return;
  }
  return callback(pathAsArray, ...args);
}
