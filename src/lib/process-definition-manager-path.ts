/**
 * Converts path to array of strings, each specifying a property of an object
 * that was selected by a preceeding string.
 *
 * @param path A string or array of strings.
 */
export function processDefinitionManagerPath(path: string | string[]) {
  let pathAsArray: string[];

  if (typeof path === "string") pathAsArray = path.split(".");
  else if (Array.isArray(path)) pathAsArray = path;
  else pathAsArray = [];

  return pathAsArray.filter(item => item !== "");
}
