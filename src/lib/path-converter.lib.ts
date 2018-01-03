/**
 * Converts an OpenAPI specific routes to those wich could be used in Koa
 * OpenAPI path: /path/{parameter}
 * Koa path: /path/:parameter
 *
 * @param path string
 */
export function convertPath(path: string): string {
    const re = /(\{(\w+)\})/ig;

    return path.replace(re, ':$2');
}
