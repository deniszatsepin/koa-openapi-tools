import {
    OpenAPIObject,
    OperationObject
} from 'openapi3-ts';

export interface IEndpointConfig {
    service: string;
    path: string;
    method: string;
    operationId: string;
    operation: OperationObject;
}

export interface IServiceEndpointConfigs {
    [serviceName: string]: Array<IEndpointConfig>;
}

export const DEFAULT_SERVICE_KEY = 'x-openapi-service-name';

export function parseOpenAPI(
    openAPI: OpenAPIObject,
    serviceKey: string = DEFAULT_SERVICE_KEY
): IServiceEndpointConfigs {

    const { paths } = openAPI;

    return Object.keys(paths)
        .map(path => [path, paths[path]])
        .reduce((acc, [path, definition]) => {
            const service = definition[serviceKey];

            const endpoints: Array<IEndpointConfig> = Object.keys(definition)
                .filter(method => method !== serviceKey)
                .map(method => [method, definition[method]])
                .map(([method, operation]) => (
                    {
                        path,
                        method,
                        operationId: operation.operationId,
                        operation,
                        service
                    } as IEndpointConfig
                ));

            return {
                ...acc,
                [service]: [...(acc[service] || []), ...endpoints]
            };
        }, {} as IServiceEndpointConfigs);
}
