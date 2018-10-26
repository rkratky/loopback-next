// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Action to handle life cycle events
 */
export interface LifeCycleAction {
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
}

/**
 * Test if an object implements LifeCycleAction
 * @param obj An object
 */
export function isLifeCycleAction(
  // tslint:disable-next-line:no-any
  obj: {[name: string]: any},
): obj is LifeCycleAction {
  return typeof obj.start === 'function' && typeof obj.stop === 'function';
}
