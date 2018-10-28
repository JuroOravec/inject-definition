import { IArgumentHandlerOptions as _IArgumentHandlerOptions } from "./argument-handler-options";
import { IArgumentHandler as _IArgumentHandler } from "./argument-handler";
import { IDefinitionEntry as _IDefinitionEntry } from "./definition-entry";
import {
  IDeclarationFormatter as _IDeclarationFormatter,
  IMinifier as _IMinifier,
  IVariableNameReplacer as _IVariableNameReplacer,
  IVariableNameRetriever as _IVariableNameRetriever
} from "./definition-injector-custom-methods";
import { IDefinitionInjector as _IDefinitionInjector } from "./definition-injector";
import { IDefinitionManager as _IDefinitionManager } from "./definition-manager";
import {
  IDefinition as _IDefinition,
  IDefinitionPartial as _IDefinitionPartial,
  IDefinitionCondensed as _IDefinitionCondensed
} from "./definition";

export namespace DefinitionInjector {
  export type IArgumentHandlerOptions = _IArgumentHandlerOptions;
  export interface IArgumentHandler extends _IArgumentHandler {}
  export type IDefinitionEntry = _IDefinitionEntry;
  export type IDeclarationFormatter = _IDeclarationFormatter;
  export type IMinifier = _IMinifier;
  export type IVariableNameReplacer = _IVariableNameReplacer;
  export type IVariableNameRetriever = _IVariableNameRetriever;
  export interface IDefinitionInjector extends _IDefinitionInjector {}
  export interface IDefinitionManager extends _IDefinitionManager {}
  export type IDefinition = _IDefinition;
  export type IDefinitionPartial = _IDefinitionPartial;
  export type IDefinitionCondensed = _IDefinitionCondensed;
}
