import * as objStringify from "obj-stringify";

/**
 * Stringifies argument.
 *
 * @param arg Value to be stringifies.
 *
 * @return string
 */
export function stringify(arg: any) {
  if (typeof arg === "string") return arg;
  else if (typeof arg === "boolean") return arg.toString();
  if (arg === undefined || arg === null) return arg + "";
  if (typeof arg === "symbol") {
    return arg.toString().replace(/\(.*\)/, (match, capture) => {
      if (Number.isNaN(Number.parseFloat(capture))) {
        return '"' + capture + '"';
      } else {
        return capture;
      }
    });
  }
  if (typeof arg === "function") return arg.toString() as string;
  return objStringify(arg, { inline: true, indent: 0 }) as string;
}
