/// <reference path="definition-manager.ts" />

namespace DefinitionInjector {
  export interface IDefinitionInjector extends IDefinitionManager {
    inject: (options?: string | { target?: string }) => string;

    generate: (
      options?: string | { target?: string }
    ) => string | IDefinition[keyof IDefinition][];

    scan: (
      targetText: string,
      options: object & { delimeter: false }
    ) => string | string[];
  }
}
