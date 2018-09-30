import * as deepcopy from "deepcopy";

export function copyObject<T>(obj: T) {
  return deepcopy(obj) as T;
}
