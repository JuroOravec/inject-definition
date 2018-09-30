namespace DefinitionInjector {
  export type IDefinitionEntry = {
    keyword: string;
    value: IDefinition[keyof IDefinition];
  };
}
