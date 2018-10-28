import { IArgumentHandlerOptions } from "./argument-handler-options";

export interface IArgumentHandler {
  getDefinition: (
    newPropertyValues?: Partial<IArgumentHandlerOptions>,
    options?: object
  ) => IArgumentHandler;

  processDefinitionsObject: (
    newPropertyValues?: Partial<IArgumentHandlerOptions>,
    options?: object
  ) => IArgumentHandler;

  processOptions: (
    newPropertyValues?: Partial<IArgumentHandlerOptions>,
    options?: object
  ) => IArgumentHandler;

  processPath: (
    newPropertyValues?: Partial<IArgumentHandlerOptions>,
    options?: object
  ) => IArgumentHandler;

  tap: (
    callback: (opt: Partial<IArgumentHandlerOptions>) => void
  ) => IArgumentHandler;

  new: (
    callback: (opt: Partial<IArgumentHandlerOptions>) => IArgumentHandlerOptions
  ) => IArgumentHandler;

  finally: (callback: (opt: Partial<IArgumentHandlerOptions>) => any) => any;
}
