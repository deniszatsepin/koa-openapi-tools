import { expect } from 'chai';

import { join } from 'path';
import { promisify, map } from 'bluebird';
import { writeFile, unlink, mkdir, rmdir } from 'fs';
import { loadHandlers } from './handlers-loader.lib';

const mkdirAsync = promisify(mkdir);
const rmdirAsync = promisify(rmdir);
const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

describe('handlers-loader.lib', () => {
    const handlersDirectory = join(__dirname, `../../handlers_${Math.floor(Math.random() * 1e5)}`);
    const serviceName = 'accounts';
    const handlerNames = ['controller', 'serializer'];
    const operations = ['index', 'show', 'create', 'update'];
    const handlerModuleContent = operations.reduce((file, operation) => {
        return file + `export function ${operation}() {}\n`;
    }, '');
    const handlerPaths = handlerNames
        .map(name => join(handlersDirectory, `${serviceName}.${name}.ts`));

    before(async () => {
        await mkdirAsync(handlersDirectory);
        await map(handlerPaths, (fileName) => writeFileAsync(fileName, handlerModuleContent));
    });

    it('should load handlers', async () => {
        const handlers = await loadHandlers([serviceName], handlersDirectory, handlerNames);

        expect(handlers).to.be.not.undefined;
        expect(handlers).has.all.keys(serviceName);
        expect(handlers[serviceName]).has.lengthOf(handlerNames.length);

        handlers[serviceName].forEach((handler, i) => {
            expect(handler.name).is.equal(handlerNames[i]);
            expect(handler.operations).has.all.keys(operations);
            operations.forEach(operation => {
                expect(handler.operations[operation]).to.be.a('function');
            });
        });
    });

    after(async () => {
        await map(handlerPaths, (fileName) => unlinkAsync(fileName));
        await rmdirAsync(handlersDirectory);
    });
});
