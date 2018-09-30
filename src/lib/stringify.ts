import * as objStringify from "obj-stringify";

export function stringify(arg: any) {
  if (typeof arg === "string") return arg;
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
