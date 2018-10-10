/// <reference path="../../interface/definition-manager.ts" />

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
export function pathHandler<R>(
  callback: (path: string[], ...args: any[]) => R,
  path: string | string[],
  ...args: any[]
) {
  const pathAsArray: string[] = [];

  // Converts path to array of strings
  if (typeof path === "string") pathAsArray.push(...path.split("."));
  else if (Array.isArray(path)) pathAsArray.push(...path);

  const cleanedPath = pathAsArray.filter(item => item !== "");

  if (cleanedPath.length === 0) {
    console.warn("Invalid definition keyword.");
    return;
  }
  return callback(cleanedPath, ...args);
}
