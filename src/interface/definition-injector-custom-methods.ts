namespace DefinitionInjector {
  export type IDeclarationFormatter = (
    branchName: string,
    branch: string,
    ...args: any[]
  ) => string;

  export type IMinifier = (definition: string, ...args: any[]) => string;

  export type IVariableNameReplacer = (
    definition: string,
    oldVariableName: string,
    newVariableName: string,
    ...args: any[]
  ) => string;

  export type IVariableNameRetriever = (
    definition: string,
    ...args: any[]
  ) => string;
}
