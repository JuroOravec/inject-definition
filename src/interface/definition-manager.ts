/// <reference path="definition.ts" />
/// <reference path="options.ts" />

namespace DefinitionInjector {
  export interface IDefinitionManager {
    definitions: IDefinition;
    activeDefinitions: IDefinition;

    define: (
      path: string | string[],
      definition: string,
      options?: IOptions
    ) => void;

    undefine: (path: string | string[], options?: IOptions) => void;

    activate: (path: string | string[], options?: IOptions) => void;

    deactivate: (path: string | string[], options?: IOptions) => void;

    get: (path: string | string[]) => IDefinition[keyof IDefinition];

    has: (path: string | string[]) => boolean;
  }
}
