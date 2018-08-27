import { expect } from 'chai';
import * as http from 'http';
import * as request from 'supertest';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { createRouter } from './router.middleware';
import { IServiceHandlers } from '../lib/handlers-loader';
import { IServiceEndpointConfigs } from '../lib/opeapi-parser';

const serviceName = 'accounts';

const serviceHandlers: IServiceHandlers = {
    [serviceName]: [
        {
            name: 'controller',
            operations: {
                show: function(ctx) {
                    ctx.body = 'test';
                },
                create: function() {}
            }
        }
    ]
};

const servicesInfo: IServiceEndpointConfigs = {
    [serviceName]: [
        {
            service: 'accounts',
            path: '/accounts/{id}',
            method: 'get',
            operationId: 'show',
            operation: {
                responses: []
            }
        },
        {
            service: 'accounts',
            path: '/accounts/{id}',
            method: 'post',
            operationId: 'create',
            operation: {
                responses: []
            }
        }
    ]
};

describe('router.middleware', () => {
    let router: Router, app: Koa;

    before(async () => {
        router = await createRouter(servicesInfo, serviceHandlers);
        app = new Koa();
        app.use(router.routes());
    });

    it('router should be an instance of Router', () => {
        expect(router).to.be.an.instanceof(Router);
    });

    it('should successfully respond on get by id', () => {
        return request(http.createServer(app.callback()))
            .get('/accounts/1')
            .expect(200);
    });

    it('should successfully respond on post', async () => {
        request(http.createServer(app.callback()))
            .post('/accounts/1')
            .expect(200);
    });
});
