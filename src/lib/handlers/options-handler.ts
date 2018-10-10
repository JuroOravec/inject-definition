/// <reference path="../../interface/definition-manager.ts" />

/**
 * Assigns user-defined options to the default values. Calls passed callback,
 * and prepends the options object as the first argument. First 3 arguments
 * (`callback`, `defaults`, `options`) are consumed (they are not forwarded
 * to the callback), the remaining arguments are forwarded to the callback.
 *
 * @param callback A function that is called with prepended options object.
 *
 * @param defaults A object with default values that can be overriden with
 * user-defined values.
 *
 * @param options An object with user-defined options.
 */
export function optionsHandler<CBResult, O1 extends object, O2 extends object>(
  callback: (options: O1 & O2, ...args: any[]) => CBResult,
  defaults: O1 = {} as O1,
  options: O2 = {} as O2,
  ...args
) {
  const optionsWithDefaults = Object.assign({}, defaults, options);

  return callback(optionsWithDefaults, ...args);
}
