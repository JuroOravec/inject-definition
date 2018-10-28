import { IDefinition } from "src/interface/definition";

export function createDefinition(options: Partial<IDefinition> = {}) {
  const activeStatus = options.active !== undefined ? options.active : true;
  const newDefinition: IDefinition = {
    keyword: options.keyword || null,
    value: options.value || null,
    children: options.children || {},
    active: Boolean(activeStatus)
  };

  return newDefinition;
}
