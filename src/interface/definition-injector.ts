import { IDefinition } from "./definition";
import { IDefinitionManager } from "./definition-manager";
import {
  IMinifier,
  IDeclarationFormatter,
  IVariableNameReplacer,
  IVariableNameRetriever
} from "./definition-injector-custom-methods";

export interface IDefinitionInjector extends IDefinitionManager {
  minifier: IMinifier;
  declarationFormatter: IDeclarationFormatter;
  variableNameReplacer: IVariableNameReplacer;
  variableNameRetriever: IVariableNameRetriever;

  inject: (
    targetText: string,
    options?: {
      overwrite?: boolean;
      minify?: boolean;
      reference?: boolean;
      insertLocation?: "start" | "replace" | "end";
      separator?: string;
      delimiter?: string;
    }
  ) => string;

  generate: (
    targetText: string,
    options?: {
      delimiter?: string | false;
      overwrite?: boolean;
      minify?: boolean;
    }
  ) => string | IDefinition["value"][];

  scan: (
    targetText: string,
    options?: {
      delimiter?: string | false;
      overwrite?: boolean;
    }
  ) => string | string[];
}
