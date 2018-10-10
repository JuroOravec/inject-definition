namespace DefinitionInjector {
  export type IDefinition = {
    active: boolean;
    children: {
      [definition: string]: IDefinition;
    };
    keyword: string;
    value: string;
  };

  export type IDefinitionPartial = {
    children: {
      [definition: string]: IDefinitionPartial;
    };
    value: string;
  };

  export type IDefinitionCondensed =
    | IDefinition["value"]
    | { [definition: string]: IDefinitionCondensed };
}
