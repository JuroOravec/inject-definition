import { IDefinition } from "./definition";

export type IDefinitionEntry = {
  keyword: string;
  value: IDefinition["value"];
  dependencies: IDefinition["keyword"][];
};
