import * as clone from "clone";

export function copyObject<T>(obj: T) {
  return clone(obj) as T;
}
