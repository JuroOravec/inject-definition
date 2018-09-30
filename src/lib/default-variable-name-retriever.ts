export function defaultVariableNameRetriever(definition: string) {
  const matched =
    definition.match(/(?:var|const|let|function)[\s\r\n]+\w+/g) || [];
  const lastWords = matched.map(m => (m.match(/\w+$/) || [])[0]);
  return lastWords[0];
}
