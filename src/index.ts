import { DefinitionInjector } from "./definition-injector";

export function init(
  options: {
    definitions?: DefinitionInjector.IDefinition;
    declarationFormatter?: DefinitionInjector.IDeclarationFormatter;
    minifier?: DefinitionInjector.IMinifier;
    variableNameReplacer?: DefinitionInjector.IVariableNameReplacer;
    variableNameRetriever?: DefinitionInjector.IVariableNameRetriever;
  } = {}
) {
  return new DefinitionInjector(options);
}
