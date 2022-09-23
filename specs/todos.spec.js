'use strict'
const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const todosData = require('../database/testdata.json')

describe('Todos', () => {
    describe('Create', () => {
        let addedId;

        it("should create a new todo", () => {
            return chakram.post(api.url('todos'), todosData.todos[0])
                .then(response => {
                    expect(response).to.have.status(201);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const checkTodo = chakram.get(api.url('todos/' + addedId));
                    expect(checkTodo).to.have.status(200);
                    expect(checkTodo).to.have.json('data.userId', 'number');
                    expect(checkTodo).to.have.json('data.id', 'number');
                    expect(checkTodo).to.have.json('data.title', 'title');
                    return chakram.wait();
                });
        });

        it("should not add a todo with existing id", () => {
            const response = chakram.post(api.url('todos'), todosData.todos[1]);
            expect(response).to.have.status(500);
            return chakram.wait();
        });
    });

    describe('Read', () => {
        it('should have todos', () => {
            const response = chakram.get(api.url('todos'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
                expect(data.length).to.equal(201)
            });
            return chakram.wait();
        });

        it("should not return a todo when the ID is invalid", () => {
            const response = chakram.get(api.url('todos/211'));
            return expect(response).to.have.status(404);
        });
    });

    describe("Updated", () => {
        it("should update an existing todo data", () => {
            const response = chakram.put(api.url('todos/2'), todosData.todos[2]);

            expect(response).to.have.status(200);
            return response.then(data => {
                const todo = chakram.get(api.url('todos/2'));
                expect(todo).to.have.json('data', data => {
                    expect(data.userId).to.equal(1);
                    expect(data.id).to.equal(2);
                    expect(data.title).to.equal('aut autem');
                });
                return chakram.wait();
            });
        });

        it("should not update not existing todo data", () => {
            const response = chakram.put(api.url('todos/211'), todosData.todos[3]);
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe("Delete", () => {
        it("should be able to delete a todo", () => {
            const response = chakram.delete(api.url('todos/10'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const todoDeleted = chakram.get(api.url('todos/10'));
                expect(todoDeleted).to.have.status(404);
                return chakram.wait();
            });
        });

        it("should not delete todo which does not exist", () => {
            const response = chakram.delete(api.url('todos/' + todosData.todos[3]));
            expect(response).to.have.status(404);
            return chakram.wait()
        });
    });
});