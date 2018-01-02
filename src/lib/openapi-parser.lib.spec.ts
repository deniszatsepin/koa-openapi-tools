import { expect } from 'chai';

import { join } from 'path';
import * as RefParser from 'json-schema-ref-parser';
import { OpenAPIObject } from 'openapi3-ts';
import { parseOpenAPI } from './openapi-parser.lib';

const refParser = new RefParser();
const openAPIPath = join(__dirname, '../openapi/test-api.yaml');

describe('parse-openapi.lib', () => {
    let openAPI: OpenAPIObject;

    before(async () => {
        openAPI = await refParser.dereference(openAPIPath);
    });

    it('should parse openAPI', () => {
        const serviceEndpointConfigs = parseOpenAPI(openAPI);

        expect(Object.keys(serviceEndpointConfigs)).to.eql(['accounts']);
        expect(serviceEndpointConfigs['accounts']).to.have.lengthOf(4);
        serviceEndpointConfigs['accounts'].forEach(endpoint => {
            expect(endpoint).to.have.all.keys(
                'service',
                'path',
                'method',
                'operationId',
                'operation'
            );
        });
    });
});
