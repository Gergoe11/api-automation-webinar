'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');

const postedPhoto = {
    albumId: "number",
    id: "number",
    title: "title",
    url: "url",
    thumbnailUrl: "thumbnailUrl"
};

const existingPhoto = {
    albumId: 1,
    id: 1,
    title: "title",
    url: "url",
    thumbnailUrl: "thumbnailUrl"
};

const updatedPhoto1 = {
    albumId: 1,
    id: 1,
    title: "similique qui sunt",
    url: "https://via.placeholder.com/600/92c952",
    thumbnailUrl: "https://via.placeholder.com/150/92c952"
};

const invalidPhoto = {
    albumId: 1,
    id: 5100,
    title: "similique qui sunt",
    url: "https://via.placeholder.com/600/92c952",
    thumbnailUrl: "https://via.placeholder.com/150/92c952"
};

describe('Photos', () => {
    describe('Create', () => {
        let addedId;

        it('should add a new photo', () => {
            return chakram.post(api.url('photos'), postedPhoto)
                .then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id

                    const photo = chakram.get(api.url('photos/' + addedId));
                    expect(photo).to.have.status(200);
                    expect(photo).to.have.json('data.albumId', 'number');
                    expect(photo).to.have.json('data.title', 'title');
                    expect(photo).to.have.json('data.url', 'url');
                    return chakram.wait();
                });
        });

        it("it should not add photo with existing id", () => {
            const response = chakram.post(api.url('photos'), existingPhoto);
            expect(response).to.have.status(500);
            return chakram.wait();
        });

        after(() => {
            if (addedId) {
                return chakram.delete(api.url('photos/' + addedId));
            }
        });

    });

    describe('Read', () => {
        it('should have existing photos', () => {
            const response = chakram.get(api.url('photos'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });

        it('should not return a photo for invalid ID', () => {
            const response = chakram.get(api.url('photo/invalid123'));
            return expect(response).to.have.status(404);
        });

    });

    describe("Updated", () => {
        it("should update an existing a photo", () => {
            const response = chakram.put(api.url('photos/1'), updatedPhoto1);

            expect(response).to.have.status(200);
            return response.then(data => {
                const updPhoto = chakram.get(api.url('photos/1'));
                expect(updPhoto).to.have.json('data', data => {
                    expect(data.albumId).to.equal(1);
                    expect(data.id).to.equal(1);
                    expect(data.title).to.equal('similique qui sunt');
                });
                return chakram.wait();
            });

        });

        it("should not update a not existing photo", () => {
            const response = chakram.put(api.url('posts/5100'), invalidPhoto);
            expect(response).to.have.status(404);
            return chakram.wait();
        });

    });

    describe('Delete', () => {
        it('should delete a photo by ID', () => {
            const response = chakram.delete(api.url('photos/4000'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const post = chakram.get(api.url('photos/4000'));
                expect(post).to.have.status(404);
                return chakram.wait();
            });
        });

        it('should not delete a photo which does not exists', () => {
            const response = chakram.delete(api.url('photos/4000'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });



});
