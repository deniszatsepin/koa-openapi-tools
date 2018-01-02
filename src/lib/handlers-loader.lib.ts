import { join } from 'path';
import * as Promise from 'bluebird';
import { Middleware } from 'koa';

export interface IServicesHandlers {
    [service: string]: {
        [handler: string]: {
            [operation: string]: Middleware | null
        }
    };
}

interface IHandlersPaths {
    [handler: string]: string;
}

interface IServiceHandlerPaths {
    [service: string]: IHandlersPaths;
}

/**
 * Gets a services configs and loads handlers (controller, validator etc.) for each service
 *
 * @param serviceNames a list of service names
 * @param servicesPath path to a directory on your file system where service files could be found
 * @param handlers a list of handler names. For instance, ['controller', 'serializer'].
 */
export function loadHandlers(
    serviceNames: Array<string>,
    servicePaths: string,
    handlers: Array<string>
): Promise<IServicesHandlers> {
    const handlersPaths: IServiceHandlerPaths = serviceNames
        .reduce((acc, serviceName) => ({
            ...acc,
            [serviceName]: getHandlerPaths(serviceName, servicePaths, handlers)
        }), {});

    return Promise.props(
        Object.keys(handlersPaths).reduce((acc, serviceName) => {
            return {
                ...acc,
                [serviceName]: getHandlers(handlersPaths[serviceName])
            };
        }, {})
    );
}

function getHandlerPaths(
    serviceName: string,
    servicePath: string,
    handlers: Array<string>
): IHandlersPaths {
    return handlers.reduce((paths: IHandlersPaths, handler) => ({
        ...paths,
        [handler]: join(servicePath, `${serviceName}.${handler}`)
    }), {} as IHandlersPaths);
}

/**
 * Loads node modules for each service's handler
 *
 * @param handlers  handlers description structure where the key is a handler name and
 *                  the value is module absolute path
 */
function getHandlers(handlers: IHandlersPaths) {
    return Promise.props(
        Object.keys(handlers).reduce((acc, handler) => {
            return {
                ...acc,
                [handler]: import(handlers[handler]).catch(_ => null)
            };
        }, {})
    );
}
