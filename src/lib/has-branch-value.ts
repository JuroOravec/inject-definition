/**
 * Checks if a passed definitions object has any value in itself or in its
 * children.
 *
 * @param definitionsObject An definition object, whose properties are either
 * other definition objects or definition values.
 */
export function hasBranchValue(definitionsObject: any) {
  // If passed argument is not a definition object, it's a definition value
  if (typeof definitionsObject !== "object") return true;

  // If the object has no properties, it has no value
  const keys = Object.keys(definitionsObject);
  if (keys.length === 0) return false;

  // If at least one of the properties is value as defined above, the branch has value
  return keys.some(key => hasBranchValue(definitionsObject[key]));
}
