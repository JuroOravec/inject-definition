import { IDefinitionInjector } from "src/interface/definition-injector";
import {
  IDeclarationFormatter,
  IMinifier,
  IVariableNameReplacer,
  IVariableNameRetriever
} from "src/interface/definition-injector-custom-methods";

/**
 * Defines a method as a non-enumerable symbol property on an object
 *
 * @param definitionInjector A DefinitionInjector to which the method will be defined.
 *
 * @param property A string | number | symbol that serves as the object's property.
 *
 * @param method A function that is assigned to the object as a
 * `[methodSymbol]` property.
 */
export function setMethod(
  definitionInjector: IDefinitionInjector,
  property: string | number | symbol,
  method: IDeclarationFormatter,
  name: "declarationFormatter"
);
export function setMethod(
  definitionInjector: IDefinitionInjector,
  property: string | number | symbol,
  method: IMinifier,
  name: "minifier"
);
export function setMethod(
  definitionInjector: IDefinitionInjector,
  property: string | number | symbol,
  method: IVariableNameReplacer,
  name: "variableNameReplacer"
);
export function setMethod<T>(
  definitionInjector: IDefinitionInjector,
  property: string | number | symbol,
  method: IVariableNameRetriever,
  name: "variableNameRetriever"
);
export function setMethod(
  definitionInjector: IDefinitionInjector,
  property: string | number | symbol,
  method: Function,
  name: string
) {
  if (typeof method !== "function") {
    throw TypeError("Tried to assign a non-function to a method.");
  }
  Object.defineProperty(definitionInjector, property, {
    enumerable: false,
    writable: true,
    value: method
  });
}
