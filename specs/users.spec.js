'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

const newUser = {
    id: "id",
    name: "name",
    username: "username",
    email: "email"
};

const existingUser = {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv"
};

const updatedUser = {
    id: 2,
    name: "Ervin Howell",
    username: "Anton",
    email: "Shanna@melissa.tv"
};

const invalidUser = {
    id: 14,
    name: "Mrs. Dennis Schule",
    username: "Leopoldo_Cork",
    email: "Karley_Dach@jasper.info"
};




describe('Users', () => {
    describe('Create', () => {
        let addedId;

        it("should create a new user", () => {
            return chakram.post(api.url('users'), newUser)
                .then(response => {
                    expect(response).to.have.status(201);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const checkUser = chakram.get(api.url('users/' + addedId));
                    expect(checkUser).to.have.status(200);
                    expect(checkUser).to.have.json('data.id', 'id');
                    expect(checkUser).to.have.json('data.name', 'name');
                    expect(checkUser).to.have.json('data.email', 'email');
                    return chakram.wait();

                });
        });

        it("should not add user with an existing id", () => {
            const response = chakram.post(api.url('users'), existingUser);
            expect(response).to.have.status(500);
            return chakram.wait();
        });


    });

    describe('Read', () => {
        it('should have users', () => {
            const response = chakram.get(api.url('users'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
                expect(data.length).to.equal(11)
            });
            return chakram.wait();
        });

        it("should not return user when ID is invalid", () => {
            const response = chakram.get(api.url('users/13'));
            return expect(response).to.have.status(404);
        });

    });

    describe("Updated", () => {
        it("should update an existing a user data", () => {
            const response = chakram.put(api.url('users/2'), updatedUser);

            expect(response).to.have.status(200);
            return response.then(data => {
                const comment = chakram.get(api.url('users/2'));
                expect(comment).to.have.json('data', data => {
                    expect(data.id).to.equal(2);
                    expect(data.name).to.equal("Ervin Howell");
                    expect(data.username).to.equal('Anton');
                });
                return chakram.wait();
            });

        });

        it("should not update not existing users data", () => {
            const response = chakram.put(api.url('users/14'), invalidUser);
            expect(response).to.have.status(404);
            return chakram.wait();
        });

    });

    describe("Delete", () => {
        it("should be able to delete a user", () => {
            const response = chakram.delete(api.url('users/10'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const userDeleted = chakram.get(api.url('users/10'));
                expect(userDeleted).to.have.status(404);
                return chakram.wait();
            });
        });

        it("should not delete a user which does not exist", () => {
            const response = chakram.delete(api.url('users/13'));
            expect(response).to.have.status(404);
            return chakram.wait()
        });



    });


});