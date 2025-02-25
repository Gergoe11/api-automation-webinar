'use strict';
const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const commentData = require('../database/testdata.json');

describe('Comments', () => {
    describe('Created', () => {
        let addedId;

        it("should add a comment", () => {
            return chakram.post(api.url('comments'), commentData.comments[0])
                .then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;
                    const comment = chakram.get(api.url('comments/' + addedId));
                    
                    expect(comment).to.have.status(200);
                    expect(comment).to.have.json('data.postId', "number");
                    expect(comment).to.have.json('data.name', 'name');
                    expect(comment).to.have.json('data.body', 'body')
                    return chakram.wait();

                });
        });

        it("should not add a comment without existing id", () => {
            return chakram.post(api.url('comments123'), 
                commentData.comments[0])
                .then(response => {
                return expect(response).to.have.status(404);
            });
        });
    });

    describe("Read", () => {
        it("should return all comments", () => {
            const response = chakram.get(api.url('comments'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceOf(Array);
                expect(data).to.have.lengthOf(501);
            });
            return chakram.wait();
        });

        it("should return a given comment", () => {
            const response = chakram.get(api.url('comments/1'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data.id).to.equal(1);
            });
            return chakram.wait();
        });

        it("should not get a comment without existing id", () => {
            const response = chakram.get(api.url('comments/2222'));
            return expect(response).to.have.status(404);
        });
    });

    describe("Filter", () => {
        it("should return all comments by name", () => {
            const responseData = data.comments
            const response = chakram.get(api.url('comments?author.name'));
            
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', comments => {
                expect(responseData).to.be.instanceof(Array);
                expect(responseData.length).to.equal(500);
            });
            return chakram.wait();

        });
        it("should ignore filtering if invalid filter passed", () => {
            const response = chakram.get(api.url('commets?author.name'));
            return expect(response).to.have.status(404);
        });

        describe("Paginate", () => {
            it('should return paginated data if requested', () => {
                const response = chakram.get(api.url('comments', '_page=1'));
                
                expect(response).to.have.status(200);
                expect(response).to.have.header('X-Total-Count', '501');
                expect(response).to.have.json('data', data => {
                    expect(data).to.be.instanceof(Array);
                    expect(data.length).to.equal(10);
                });
                return chakram.wait();
            });
        });

        describe("Updated", () => {
            it("should update an existing a comment", () => {
                const response = chakram.put(api.url('comments/1'), commentData.comments[1]);
 
                expect(response).to.have.status(200);
                return response.then(data => {
                    const comment = chakram.get(api.url('comments/1'));
                    expect(comment).to.have.json('data', data => {
                        expect(data.postId).to.equal(1);
                        expect(data.id).to.equal(1);
                        expect(data.name).to.equal('iii');
                    });
                    return chakram.wait();
                });
            });

            it("should not update a comment which does not exist", () => {
                const response = chakram.put(api.url('comments/' + commentData.comments[2]));
                expect(response).to.have.status(404);
                return chakram.wait();
            });
        });

        describe("Delete", () => {
            it("should delete an existing a comment", () => {
                const response = chakram.delete(api.url('comments/2'));
                
                expect(response).to.have.status(200);
                return response.then(data => {
                    const comment = chakram.get(api.url('comments/2'));
                    expect(comment).to.have.status(404);
                    return chakram.wait();
                });
            });

            it("should not delete a comment which does not exist", () => {
                const response = chakram.delete(api.url('comments/503'));
                expect(response).to.have.status(404);
                return chakram.wait()
            });
        });
    });
})

