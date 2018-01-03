import { expect } from 'chai';

import { convertPath } from './path-converter.lib';

describe('path-converter.lib', () => {
    it('shoud convert openAPI path to Koa one', () => {
        const paths: {[key: string]: string} = {
            '/profiles/{id}': '/profiles/:id',
            '/profiles/{pid}/friends/{fid}': '/profiles/:pid/friends/:fid'
        };

        Object.keys(paths)
            .forEach(path => {
                const expected = paths[path];

                expect(convertPath(path)).to.be.equal(expected);
            });
    });
});
