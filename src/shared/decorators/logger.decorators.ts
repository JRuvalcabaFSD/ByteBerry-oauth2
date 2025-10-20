/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from '@/interfaces';

const WRAPPED_FLAG = Symbol('__logger_wrapped__');
const ORIGINAL_LOGGER = Symbol('__original_logger__');
const BASE_CONTEXT = Symbol('__base_context__');

// Logger methods to intercept
const LOGGER_METHODS = ['debug', 'info', 'warn', 'error', 'log'];

/**
 * Type guard that asserts whether a value appears to implement the minimal ILogger shape.
 *
 * Performs a runtime check that the provided value is neither null nor undefined and that
 * it exposes callable `debug` and `info` properties. This function narrows the type of
 * `x` to `ILogger` when it returns `true`.
 *
 * Note: this only verifies the presence and callability of `debug` and `info`. It does
 * not guarantee any additional `ILogger` contract (such as method signatures, behavior,
 * or other optional properties).
 *
 * @param x - Value to inspect.
 * @returns `true` if `x` is non-null/undefined and has `debug` and `info` methods; otherwise `false`.
 */

function isLoggerLike(x: any): x is ILogger {
  return !!x && typeof x.debug === 'function' && typeof x.info === 'function';
}

/**
 * Wraps a logger or function with a contextual logger prefix.
 *
 * Generic:
 * @template T - Either an ILogger instance or a callable (function/middleware).
 *
 * Behavior:
 * - If `target` is an ILogger (object exposing logging methods), returns a Proxy
 *   that intercepts calls to configured logging methods (LOGGER_METHODS) and
 *   prefixes the first string argument with `[context] ` when it is not already
 *   present. The wrapper avoids double-wrapping by checking a WRAPPED_FLAG
 *   attached to the logger.
 * - If `target` is a function, returns a wrapped function that searches the
 *   invocation arguments for an object containing a `logger` or `log` property;
 *   if found, it emits a debug message with the given context when the function
 *   is executed, then forwards the call to the original function.
 *
 * Type preservation:
 * - The returned value preserves the static type of `T` so the wrapper can be
 *   used transparently in call sites expecting the original logger or function.
 *
 * Side effects / metadata:
 * - When wrapping a logger, the returned proxy will have metadata properties
 *   attached:
 *     - ORIGINAL_LOGGER: reference to the original (unproxied) logger
 *     - BASE_CONTEXT: the provided `context` string
 *     - WRAPPED_FLAG: marker equal to `context` to indicate it is already wrapped
 *
 * Notes:
 * - Only the first argument of type `string` passed to recognized logger
 *   methods is prefixed.
 * - The list of intercepted methods is controlled by LOGGER_METHODS.
 *
 * @param target - The logger instance or function to wrap.
 * @param context - The context string to prefix log messages with (without brackets).
 * @returns The proxied logger or wrapped function, typed as `T`.
 *
 * @example
 * ```ts
 * const loggerWithCtx = withLoggerContext(myLogger, 'Auth');
 * loggerWithCtx.info('User logged in'); // => "[Auth] User logged in"
 *
 * const wrappedMiddleware = withLoggerContext(myMiddleware, 'Auth');
 * // when invoked with an arg containing { logger }, it will emit a debug entry:
 * // logger.debug("[Auth] Function executed")
 * ```
 */

export function withLoggerContext<T extends ILogger | ((...args: any[]) => any)>(target: T, context: string): T {
  // Si es un logger
  if ('debug' in (target as any)) {
    const logger = target as ILogger;

    // Evitar envolver múltiples veces el mismo contexto
    if ((logger as any)[WRAPPED_FLAG] === context) return logger as T;

    const existingOriginal = (logger as any)[ORIGINAL_LOGGER] as ILogger | undefined;
    const actualTarget = existingOriginal ?? logger;

    const handler: ProxyHandler<ILogger> = {
      get(t, prop: string | symbol) {
        const orig = (t as any)[prop];
        if (typeof orig === 'function' && LOGGER_METHODS.includes(String(prop))) {
          return (...args: any[]) => {
            if (typeof args[0] === 'string') {
              const prefix = `[${context}]`;
              if (!args[0].startsWith(prefix)) {
                args[0] = `${prefix} ${args[0]}`;
              }
            }
            return orig.apply(t, args);
          };
        }
        return orig;
      },
    };

    const proxy = new Proxy(actualTarget as any, handler) as ILogger;

    (proxy as any)[ORIGINAL_LOGGER] = actualTarget;
    (proxy as any)[BASE_CONTEXT] = context;
    (proxy as any)[WRAPPED_FLAG] = context;

    return proxy as T;
  }

  // Si es una función (arrow function, middleware, etc.)
  if (typeof target === 'function') {
    const fn = target as (...args: any[]) => any;
    const wrappedFn = ((...args: Parameters<typeof fn>): ReturnType<typeof fn> => {
      const loggerArg = args.find(arg => arg && (arg.logger || arg.log))?.logger as ILogger;
      if (loggerArg) {
        loggerArg.debug(`[${context}] Function executed`);
      }
      return fn(...args);
    }) as typeof fn;

    return wrappedFn as T;
  }

  return target;
}

function getOriginalLogger(logger: ILogger): ILogger {
  if (!isLoggerLike(logger)) return logger;
  return (logger as any)[ORIGINAL_LOGGER] ?? logger;
}

function getBaseContext(logger: ILogger): string | undefined {
  return (logger as any)[BASE_CONTEXT];
}

export function LogContextClass() {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  return function <T extends { new (...args: any[]): {} }>(constructor: T): T {
    const className = constructor.name || 'UnknownClass';

    return class extends constructor {
      constructor(...args: any[]) {
        // 1) Envolver loggers que se pasen como argumentos (ej: logger inyectado por DI)
        const argsWrapped = args.map(arg => (isLoggerLike(arg) ? withLoggerContext(arg, className) : arg));

        // Llamar al constructor original con argumentos envueltos (si los hubo)
        super(...(argsWrapped as any));

        // 2) Asegurar que propiedades de la instancia logger-like estén envueltas
        const self = this as any;
        for (const key of Object.keys(self)) {
          const prop = self[key];
          if (isLoggerLike(prop)) {
            // Si la propiedad ya es un proxy con BASE_CONTEXT igual, dejarla.
            // Si no, envolverla con el contexto de clase.
            const base = getBaseContext(prop as ILogger);
            if (!base || base !== className) {
              self[key] = withLoggerContext(getOriginalLogger(prop as ILogger), className);
            }
          }
        }
      }
    } as any as T;
  };
}

/**
 * Method decorator factory that temporarily injects a contextualized logger into
 * logger-like properties of the method's `this` object for the duration of the
 * method invocation.
 *
 * The decorator:
 * - Captures a reliable static class name at decoration time (prototype or constructor).
 * - At call time, prefers a useful runtime class name (this.constructor.name) when available.
 * - Builds a context string of the form `ClassName.methodName`.
 * - Scans the own enumerable properties of `this` (Object.keys) and, for each
 *   property that satisfies `isLoggerLike`, replaces it with a context-wrapped
 *   proxy produced by `withLoggerContext(getOriginalLogger(prop), ctx)`.
 * - Skips replacement when a logger already carries the same `WRAPPED_FLAG` context.
 * - Calls the original method and awaits its result if it returns a Promise.
 * - Always restores the original logger properties in a finally block, even if
 *   the method throws or rejects.
 *
 * Important notes:
 * - The decorator mutates the instance (or class for static methods) only for
 *   the duration of the method call and restores the original properties after
 *   completion.
 * - Only own enumerable properties are considered (Object.keys); inherited or
 *   non-enumerable logger properties will not be wrapped.
 * - The decorator relies on the presence and semantics of helper utilities:
 *   `isLoggerLike`, `getOriginalLogger`, `withLoggerContext` and the `WRAPPED_FLAG`
 *   sentinel. Those must be available in scope for the decorator to function as intended.
 *
 * @returns A MethodDecorator that wraps the target method and temporarily injects
 *          contextualized logger proxies into logger-like properties of `this`.
 *
 * @throws {Error} When the decorator is applied to a class element that is not a method
 *                 (descriptor is missing or descriptor.value is not a function).
 *
 * @example
 * class Service {
 *   logger = createLogger();
 *
 *   @LogContextMethod()
 *   async doWork() {
 *     // During this call, `this.logger` will include the context "Service.doWork"
 *     this.logger.info('starting work');
 *     await someAsyncOperation();
 *   }
 * }
 *
 * @remarks
 * - Works for both synchronous and asynchronous methods.
 * - Uses a best-effort runtime class name and falls back to the static name captured
 *   at decoration time, finally using 'UnknownClass' if none are available.
 */

export function LogContextMethod(): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('LogContextMethod solo puede aplicarse a métodos');
    }

    // Capturamos un nombre *estático* fiable en el momento de aplicar el decorador.
    // target puede ser el prototype (para métodos de instancia) o el constructor (para estáticos).
    const staticClassName =
      (typeof target === 'function' && (target as any).name) ||
      (target && (target as any).constructor && (target as any).constructor.name) ||
      undefined;

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Preferimos el nombre en tiempo de ejecución si está disponible y es útil.
      const runtimeName =
        this && this.constructor && this.constructor.name && this.constructor.name !== 'Function' ? this.constructor.name : undefined;

      const className = runtimeName || staticClassName || 'UnknownClass';
      const ctx = `${className}.${String(propertyKey)}`;
      const self = this as any;
      const replaced: Array<{ key: string | symbol; original: any }> = [];

      try {
        for (const key of Object.keys(self || {})) {
          const prop = self[key];
          if (!isLoggerLike(prop)) continue;

          const originalTarget = getOriginalLogger(prop as ILogger);

          // Si ya tiene exactamente el contexto que queremos, saltar
          if ((prop as any)[WRAPPED_FLAG] && (prop as any)[WRAPPED_FLAG] === ctx) continue;

          const methodProxy = withLoggerContext(originalTarget, ctx);

          replaced.push({ key, original: prop });
          self[key] = methodProxy;
        }

        // Handle both sync and async methods
        const result = originalMethod.apply(this, args);

        // If the result is a Promise, wait for it
        if (result && typeof result.then === 'function') {
          return await result;
        }

        return result;
      } finally {
        for (const r of replaced) {
          self[r.key] = r.original;
        }
      }
    };

    return descriptor;
  };
}

/**
 * Wraps a function so that the first argument (an ILogger) is replaced with a
 * context-enhanced logger before invoking the original function.
 *
 * @template T - A function type. The original function is expected to accept an ILogger
 *               as its first parameter followed by any number of additional arguments.
 * @param fn - The function to wrap. When the returned function is called, it will:
 *               1. Create a context-aware logger by calling `withLoggerContext(logger, fn.name || 'AnonymousFunction')`.
 *               2. Invoke `fn` with that wrapped logger as the first argument, forwarding all remaining arguments unchanged.
 * @returns A function with the same call signature as `fn` (typed as `T`). When invoked it returns whatever `fn` returns
 *          and will propagate any errors thrown by `fn`.
 *
 * @remarks
 * - `fn.name` is used to derive the logger context; if `fn` is anonymous, the literal 'AnonymousFunction' is used.
 * - This wrapper casts the returned function to `T` to preserve the original function's type shape; callers should ensure
 *   `fn`'s first parameter is indeed an `ILogger`.
 * - The wrapper does not alter `this` binding of the original function; if `fn` depends on a particular `this`, callers
 *   must bind it appropriately before wrapping or call the wrapped function with an explicit receiver.
 *
 * @example
 * // Given `fn: (logger: ILogger, id: string) => Promise<void>`
 * // const wrapped = logContextFunction(fn);
 * // wrapped(logger, 'abc') // calls fn(withLoggerContext(logger, 'fnName'), 'abc')
 */

export function logContextFunction<T extends (...args: any[]) => any>(fn: T): T {
  return ((logger: ILogger, ...args: any[]) => {
    const wrappedLogger = withLoggerContext(logger, fn.name || 'AnonymousFunction');
    return fn(wrappedLogger, ...args);
  }) as T;
}

/**
 * Creates a proxy around a dependency container that attaches a logging context
 * to any resolved Logger instances.
 *
 * The returned object has the same static type as the provided container (T)
 * but intercepts accesses to the "resolve" property. When "resolve" is invoked
 * with the token "Logger" and the resolved value satisfies `isLoggerLike`, the
 * logger instance is wrapped with `withLoggerContext(..., context)` before
 * being returned. All other tokens and all other properties are forwarded to
 * the original container unchanged.
 *
 * @template T - Type of the container. Must have a `resolve(token: string): any` method.
 * @param container - The original container whose `resolve` method will be proxied.
 * @param context - The logging context string to attach to resolved Logger instances.
 * @returns A proxied container (typed as T) that injects the provided logging context
 *          into resolved Logger instances while preserving all other container behavior.
 *
 * @remarks
 * - This function relies on the runtime functions `isLoggerLike` and
 *   `withLoggerContext` to detect logger-like objects and attach context,
 *   respectively.
 * - The proxy only intercepts property access where the property name strictly
 *   equals "resolve". Other property names (including symbols) are returned
 *   directly from the original container.
 * - The original container is not mutated; the proxy forwards calls to it.
 * - If `container.resolve` throws or returns a non-logger value for the "Logger"
 *   token, the proxy will propagate that behavior/value unchanged (except when
 *   `isLoggerLike` returns true, in which case the logger is wrapped).
 *
 * @example
 * // const proxied = createLoggerContextContainer(container, 'request-id-123');
 * // proxied.resolve('Logger'); // returns logger wrapped with 'request-id-123' context
 */

export function createLoggerContextContainer<T extends { resolve: (token: string) => any }>(container: T, context: string): T {
  return new Proxy(container, {
    get(target, prop) {
      if (prop === 'resolve') {
        return (token: string) => {
          const resolved = target.resolve(token);
          if (token === 'Logger' && isLoggerLike(resolved)) {
            return withLoggerContext(resolved, context);
          }
          return resolved;
        };
      }
      return target[prop as keyof T];
    },
  });
}
