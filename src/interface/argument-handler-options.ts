import { IDefinition } from "./definition";
import { IDefinitionManager } from "./definition-manager";

export type IArgumentHandlerOptions = {
  args: any[];
  definition: IDefinition["value"];
  definitionManager: IDefinitionManager;
  definitions: IDefinition[];
  definitionsObject: string | IDefinition;
  defaults: object;
  lastPathComponent: string;
  options: object;
  path: string | string[];
};
