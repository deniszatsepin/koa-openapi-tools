import { Middleware } from 'koa';
import * as Router from 'koa-router';
import { IServiceEndpointConfigs, IEndpointConfig } from '../lib/openapi-parser.lib';
import { IServiceHandlers } from '../lib/handlers-loader.lib';
import { convertPath } from '../lib/path-converter.lib';

export async function createRouter(
    servicesInfo: IServiceEndpointConfigs,
    handlers: IServiceHandlers
): Promise<Router> {
    const router = new Router();

    Object.keys(servicesInfo)
        .forEach(serviceName => {
            const endpoints: Array<IEndpointConfig> = servicesInfo[serviceName];

            endpoints.forEach(endpoint => {
                const {
                    operationId,
                    path,
                    method
                } = endpoint;
                const serviceHanlders = handlers[serviceName];
                const middlewares = serviceHanlders
                    .map(handler => handler.operations)
                    .reduce((acc, operations) => {
                        const operation = operations ? operations[operationId] : null;

                        return operation ? [...acc, operation] : acc;
                    }, [] as Array<Middleware>);

                if (!middlewares.length) {
                    console.warn(`Service '${serviceName}' doesn't have any handlers for Operation '${operationId.toUpperCase()}'`);

                    return;
                }

                (router as any).register(convertPath(path), [method.toLowerCase()], ...middlewares);
            });
        });

    return router;
}
