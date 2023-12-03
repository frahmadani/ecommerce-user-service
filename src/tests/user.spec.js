const expect = require('chai').expect;
const express = require('express');
const expressApp = require('../express-app');
const runMiddleware = require('run-middleware');
const sinon = require('sinon');
const MockExpressResponse = require('mock-express-response');

describe('Test user services', () => {
    let app;
    const res = new MockExpressResponse();

    describe('User signing up', () => {
        const path = '/user/signup';
        beforeEach(() => {
            app = express();
            runMiddleware(app);
        });
        it('sign up cannot support get', () => {
            expressApp(app);
            app.runMiddleware(path, res, (code, _data, _headers) => {
                expect(code).equal(404);
            });
        });
        it('sign up handler random error', () => {
            expressApp(app, {
                getProfileByEmail(_email) {
                    throw Error('random');
                }
            });
            app.runMiddleware(path, res, (code, data, _headers) => {
                expect(code).equal(500);
                let body = data.toJson();
                expect(body.message).to.a('failed to signup');
            });
        });
        it('sign up failed when email already registered', () => {
            expressApp(app, {
                getProfileByEmail(_) {
                    return true;
                }
            });
            app.runMiddleware(path, res, (code, data, _headers) => {
                expect(code).equal(400);
                let body = data.toJson();
                expect(body.message).to.a('user already exist');
            });
        });
        it('sign up success creating new user', () => {
            const id = 'random-id';
            const token = 'bearer token';
            expressApp(app, {
                async getProfileByEmail(_) {
                    return false;
                },
                async signUp(_) {
                    return { id: id, token: token };
                }
            });
            app.runMiddleware(path, res, (code, data, _headers) => {
                expect(code).equal(200);
                let body = data.toJson();
                expect(body.id).to.a(id);
                expect(body.token).to.a(token);
            });
        });
    });

    describe('User signing in', () => {
        const path = '/user/signin';
        beforeEach(() => {
            app = express();
            runMiddleware(app);
        });
        it('sign in cannot support get', () => {
            expressApp(app);
            app.runMiddleware(path, res, (code, _data, _headers) => {
                expect(code).equal(404);
            });
        });
        it('sign in handler random error', () => {
            expressApp(app, {
                signIn(_email) {
                    throw Error('random');
                }
            });
            app.runMiddleware(path, res, (code, data, _headers) => {
                expect(code).equal(500);
                let body = data.toJson();
                expect(body.message).to.a('failed to signup');
            });
        });
        it('sign in failed when no existing user', () => {
            expressApp(app, {
                signIn(_) {
                    return null;
                }
            });
            app.runMiddleware(path, res, (code, data, _headers) => {
                expect(code).equal(400);
                let body = data.toJson();
                expect(body.message).to.a('user already exist');
            });
        });
        it('sign in success', () => {
            const id = 'random-id';
            const token = 'bearer token';
            expressApp(app, {
                async signIn(_) {
                    return { id: id, token: token };
                }
            });
            app.runMiddleware(path, res, (code, data, _headers) => {
                expect(code).equal(200);
                let body = data.toJson();
                expect(body.id).to.a(id);
                expect(body.token).to.a(token);
            });
        });
    });
});