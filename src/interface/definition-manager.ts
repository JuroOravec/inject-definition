import { IDefinition, IDefinitionCondensed } from "./definition";

export interface IDefinitionManager {
  define: (
    path: string | string[],
    definition: string,
    options?: object
  ) => void;

  undefine: (path: string | string[], options?: object) => void;

  undefineAll: (options?: object) => void;

  activate: (path: string | string[], options?: object) => void;

  activateAll: () => void;

  deactivate: (path: string | string[], options?: object) => void;

  deactivateAll: () => void;

  get: (path: string | string[]) => IDefinition["value"];

  getAll: (options?: object) => IDefinition | IDefinitionCondensed;

  has: (path: string | string[]) => boolean;
}
