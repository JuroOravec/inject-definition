export function defaultVariableNameReplacer(
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
