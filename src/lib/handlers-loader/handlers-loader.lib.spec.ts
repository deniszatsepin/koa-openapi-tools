import { expect } from 'chai';
import * as mock from 'mock-require';

import { join } from 'path';
import { loadHandlers } from '.';

describe('handlers-loader.lib', () => {
    const handlersDirectory = join(__dirname, `../../handlers_${Math.floor(Math.random() * 1e5)}`);
    const serviceName = 'accounts';
    const handlerNames = ['controller', 'serializer'];
    const operations = ['index', 'show', 'create', 'update'];
    const handlerModuleContent = operations.reduce((file, operation) => {
        return {
            ...file,
            [operation]: () => {}
        };
    }, {});
    const handlerPaths = handlerNames
        .map(name => join(handlersDirectory, `${serviceName}.${name}`));

    before(() => {
        handlerPaths.forEach((handlerPath) => {
            mock(handlerPath, handlerModuleContent);
        });
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

    after(() => mock.stopAll());
});
