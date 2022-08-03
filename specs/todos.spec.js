const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');


const postedTodo = {
    userId: "number",
    id: "number",
    title: "title",
    completed: false
};

const existingTodo = {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false
};

const updatedTodo = {
    userId: 1,
    id: 1,
    title: "aut autem",
    completed: false
};

const invalidTodo = {
    userId: 211,
    id: 211,
    title: "lorem",
    completed: false
};


describe('Todos', () => {
    describe('Create', () => {
        let addedId;

        it("should create a new todo", () => {
            return chakram.post(api.url('todos'), postedTodo)
                .then(response => {
                    expect(response).to.have.status(201);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const checkUser = chakram.get(api.url('todos/' + addedId));
                    expect(checkUser).to.have.status(200);
                    expect(checkUser).to.have.json('data.userId', 'number');
                    expect(checkUser).to.have.json('data.id', 'number');
                    expect(checkUser).to.have.json('data.title', 'title');
                    return chakram.wait();

                });
        });

        it("should not add a todo with existing id", () => {
            const response = chakram.post(api.url('todos'), existingTodo);
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
            const response = chakram.put(api.url('todos/2'), updatedTodo);

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
            const response = chakram.put(api.url('todos/211'), invalidTodo);
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
            const response = chakram.delete(api.url('todos/' + invalidTodo));
            expect(response).to.have.status(404);
            return chakram.wait()
        });



    });


});