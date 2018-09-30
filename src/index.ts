import { DefinitionInjector } from "./definition-injector";

export function init(
  options: {
    activeDefinitions?: DefinitionInjector.IDefinition;
    definitions?: DefinitionInjector.IDefinition;
    declarationFormatter?: DefinitionInjector.IDeclarationFormatter;
    minifier?: DefinitionInjector.IMinifier;
    variableNameReplacer?: DefinitionInjector.IVariableNameReplacer;
    variableNameRetriever?: DefinitionInjector.IVariableNameRetriever;
  } = {}
) {
  return new DefinitionInjector(options);
}
