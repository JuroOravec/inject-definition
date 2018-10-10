import { createDefinition } from "../create-definition";

export const constructorDefaults = {
  definitions: createDefinition()
};

export const defineDefaults = {
  activate: true
};

export const undefineAllDefaults = {
  select: "all" as "all" | "active" | "inactive"
};

export const getAllDefaults = { select: "all", type: "full" };
