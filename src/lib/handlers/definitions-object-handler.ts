import { IDefinition } from "src/interface/definition";
import { IDefinitionManager } from "src/interface/definition-manager";

/**
 * Processes and validates definitions object. Calls passed callback if and
 * only if the definitions object is valid, and prepends the object as the
 * first argument. First 3 arguments (`callback`, `definitionManager`,
 * `definitionObject`) are consumed (they are not forwarded to the callback),
 * the remaining arguments are forwarded to the callback.
 *
 * @param callback A function that is called with prepended listified path,
 * in case the path is valid.
 *
 * @param definitionManager An instance of DefinitionManager that is used to
 * look up the definitions objects.
 *
 * @param definitionsObject A string or a definitions object. If string, the
 * definitionManager is searched for the definitions object with that label.
 */
export function definitionsObjectHandler<R>(
  callback: (definitionsObject: IDefinition, ...args: any[]) => R,
  definitionManager: IDefinitionManager,
  definitionsObject: IDefinition | string,
  ...args: any[]
) {
  if (!definitionManager) throwMissingDefManagerError();

  const availableCommands = [
    {
      key: "all",
      value: definitionManager.getAll({
        select: "all",
        type: "full"
      }) as IDefinition
    },
    {
      key: "active",
      value: definitionManager.getAll({
        select: "active",
        type: "full"
      }) as IDefinition
    },
    {
      key: "inactive",
      value: definitionManager.getAll({
        select: "inactive",
        type: "full"
      }) as IDefinition
    }
  ];

  if (typeof definitionsObject === "object") {
    return callback(definitionsObject, ...args);
  }

  if (typeof definitionsObject !== "string") throwUnknownObjectError();

  const command = availableCommands.find(
    command => command.key === definitionsObject
  );

  if (!command) throwUnknownObjectError();

  return callback(command.value, ...args);

  function throwUnknownObjectError() {
    throw TypeError(
      `Unknown definitions object "${definitionsObject}".` +
        ` Available options are: ` +
        `"${availableCommands.map(cmd => cmd.key).join(", ")}" `
    );
  }

  function throwMissingDefManagerError() {
    throw ReferenceError(
      `Invalid reference to the Definition Manager, got ${definitionManager} instead.`
    );
  }
}
