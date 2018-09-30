namespace DefinitionInjector {
  export type IDefinition = {
    [definition: string]: string | IDefinition;
  };
}
