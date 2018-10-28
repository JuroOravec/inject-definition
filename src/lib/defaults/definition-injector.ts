import { IDefinition } from "src/interface/definition";
import {
  IDeclarationFormatter,
  IMinifier,
  IVariableNameReplacer,
  IVariableNameRetriever
} from "src/interface/definition-injector-custom-methods";

export const constructorDefaults: {
  definitions?: IDefinition;
  declarationFormatter?: IDeclarationFormatter;
  minifier?: IMinifier;
  variableNameReplacer?: IVariableNameReplacer;
  variableNameRetriever?: IVariableNameRetriever;
} = {
  declarationFormatter: defaultDeclarationFormatter,
  minifier: defaultMinifier,
  variableNameReplacer: defaultVariableNameReplacer,
  variableNameRetriever: defaultVariableNameRetriever
};

function defaultDeclarationFormatter(branchKey: string, branch: string) {
  return `var ${branchKey} = ${branch};`;
}

function defaultMinifier(text: string) {
  return text;
}

function defaultVariableNameReplacer(
  definition: string,
  oldName: string,
  newName: string
) {
  var replaced = definition.replace(
    new RegExp("(var|const|let|function)[\\s\\r\\n]" + oldName),
    (match, capture) => capture + " " + newName
  );
  return replaced;
}

function defaultVariableNameRetriever(definition: string) {
  const matched =
    definition.match(/(?:var|const|let|function)[\s\r\n]+\w+/g) || [];
  const lastWords = matched.map(m => (m.match(/\w+$/) || [])[0]);
  return lastWords[0];
}

export const scanDefaults = {
  delimiter: false as string | false,
  overwrite: false,
  target: ""
};

export const generateDefaults = Object.assign({}, scanDefaults, {
  minify: false
});

export const injectDefaults = Object.assign({}, generateDefaults, {
  delimiter: "\n" as string,
  insertLocation: "start" as "start" | "replace" | "end",
  separator: "\n"
});
