namespace DefinitionInjector {
  export type IDefinitionEntry = {
    keyword: string;
    value: IDefinition["value"];
    dependencies: IDefinition["keyword"][];
  };
}
