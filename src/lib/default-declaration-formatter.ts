export function defaultDeclarationFormatter(branchKey: string, branch: string) {
  return `var ${branchKey} = ${branch}`;
}
