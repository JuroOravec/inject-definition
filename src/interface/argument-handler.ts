/// <reference path="definition-manager.ts" />

namespace DefinitionInjector {
  export interface ArgumentHandler {
    getDefinition: (
      newPropertyValues?: Partial<ArgumentHandlerOptions>,
      options?: object
    ) => ArgumentHandler;

    processDefinitionsObject: (
      newPropertyValues?: Partial<ArgumentHandlerOptions>,
      options?: object
    ) => ArgumentHandler;

    processOptions: (
      newPropertyValues?: Partial<ArgumentHandlerOptions>,
      options?: object
    ) => ArgumentHandler;

    processPath: (
      newPropertyValues?: Partial<ArgumentHandlerOptions>,
      options?: object
    ) => ArgumentHandler;

    finally: (callback: (opt: Partial<ArgumentHandlerOptions>) => any) => any;
  }
}
