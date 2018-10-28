import { IDefinition } from "./interface/definition";
import {
  IDeclarationFormatter,
  IMinifier,
  IVariableNameReplacer,
  IVariableNameRetriever
} from "./interface/definition-injector-custom-methods";

import { DefinitionInjector } from "./definition-injector";

export function init(
  options: {
    definitions?: IDefinition;
    declarationFormatter?: IDeclarationFormatter;
    minifier?: IMinifier;
    variableNameReplacer?: IVariableNameReplacer;
    variableNameRetriever?: IVariableNameRetriever;
  } = {}
) {
  return new DefinitionInjector(options);
}
