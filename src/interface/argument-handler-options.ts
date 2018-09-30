/// <reference path="definition-manager.ts" />

namespace DefinitionInjector {
  export type ArgumentHandlerOptions = {
    args: any[];
    definition: IDefinition[keyof IDefinition];
    definitionManager: IDefinitionManager;
    definitions: IDefinition[];
    definitionsObject: string | IDefinition;
    defaults: object;
    lastPathComponent: string;
    options: object;
    path: string | string[];
  };
}
