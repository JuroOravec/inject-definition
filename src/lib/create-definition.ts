/// <reference path="../interface/definition-manager.ts" />

import IDefinition = DefinitionInjector.IDefinition;

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
