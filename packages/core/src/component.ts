// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Constructor,
  Provider,
  BoundValue,
  Binding,
  ClassDecoratorFactory,
  MetadataInspector,
  MetadataAccessor,
} from '@loopback/context';
import {Server} from './server';
import {Application, ControllerClass} from './application';

/**
 * A map of name/class pairs for binding providers
 */
export interface ProviderMap {
  [key: string]: Constructor<Provider<BoundValue>>;
}

export interface ClassMap {
  [key: string]: Constructor<BoundValue>;
}

/**
 * A component declares a set of artifacts so that they cane be contributed to
 * an application as a group
 */
export interface Component {
  /**
   * An array of controller classes
   */
  controllers?: ControllerClass[];
  /**
   * A map of name/class pairs for binding providers
   */
  providers?: ProviderMap;

  classes?: ClassMap;

  /**
   * A map of name/class pairs for servers
   */
  servers?: {
    [name: string]: Constructor<Server>;
  };

  /**
   * An array of bindings
   */
  bindings?: Binding[];

  /**
   * Other properties
   */
  // tslint:disable-next-line:no-any
  [prop: string]: any;
}

export const COMPONENT_KEY = MetadataAccessor.create<Component, ClassDecorator>(
  'component',
);

/**
 * Decorator for a component. For example:
 * ```ts
 * @component({
 *   controllers: [MyController],
 *   bindings: [binding],
 *   classes: {'my-class': MyClass},
 *   providers: {'my-provider': MyProvider},
 * })
 * class MyComponentWithDecoration {}
 * ```
 * @param spec Component spec
 */
export function component(spec: Component = {}) {
  return ClassDecoratorFactory.createDecorator<Component>(COMPONENT_KEY, spec);
}

/**
 * Mount a component to an Application.
 *
 * @param {Application} app
 * @param {Component} componentInst
 */
export function mountComponent(app: Application, componentInst: Component) {
  const cls = componentInst.constructor;
  if (typeof cls === 'function') {
    const decoratedComponent = MetadataInspector.getClassMetadata(
      COMPONENT_KEY,
      cls,
    );
    if (decoratedComponent) {
      mountComponent(app, decoratedComponent);
    }
  }

  if (componentInst.classes) {
    for (const classKey in componentInst.classes) {
      const binding = Binding.bind(classKey).toClass(
        componentInst.classes[classKey],
      );
      app.add(binding);
    }
  }

  if (componentInst.providers) {
    for (const providerKey in componentInst.providers) {
      const binding = Binding.bind(providerKey).toProvider(
        componentInst.providers[providerKey],
      );
      app.add(binding);
    }
  }

  if (componentInst.bindings) {
    for (const binding of componentInst.bindings) {
      app.add(binding);
    }
  }

  if (componentInst.controllers) {
    for (const controllerCtor of componentInst.controllers) {
      app.controller(controllerCtor);
    }
  }

  if (componentInst.servers) {
    for (const serverKey in componentInst.servers) {
      app.server(componentInst.servers[serverKey], serverKey);
    }
  }
}
