'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const albumsData = require('../database/testdata.json');


describe('Albums', () => {
    describe('Create', () => {
        let addedId;

        it("should create a new album", () => {
            return chakram.post(api.url('albums'), albumsData.albums[0])
                .then(response => {
                    expect(response).to.have.status(201);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const checkAlbum = chakram.get(api.url('albums/' + addedId));
                    expect(checkAlbum).to.have.status(200);
                    expect(checkAlbum).to.have.json('data.userId', 'number');
                    expect(checkAlbum).to.have.json('data.id', 'number');
                    expect(checkAlbum).to.have.json('data.title', 'title');
                    return chakram.wait();

                });
        });

        it("should not add album with an existing id", () => {
            const response = chakram.post(api.url('albums'), albumsData.albums[1]);
            expect(response).to.have.status(500);
            return chakram.wait();
        });


    });

    describe('Read', () => {
        it('should have existing albums', () => {
            const response = chakram.get(api.url('albums'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });

        it('should not return an album for invalid ID', () => {
            const response = chakram.get(api.url('albums/123'));
            return expect(response).to.have.status(404);
        });

    });

    describe("Updated", () => {
        it("should update an existing album", () => {
            const response = chakram.put(api.url('albums/1'), albumsData.albums[2]);

            expect(response).to.have.status(200);
            return response.then(data => {
                const updatedAlbum = chakram.get(api.url('albums/1'));
                expect(updatedAlbum).to.have.json('data', data => {
                    expect(data.userId).to.equal(1);
                    expect(data.id).to.equal(1);
                    expect(data.title).to.equal('delectus aut autem');
                });
                return chakram.wait();
            });

        });

        it("should not update a not existing album", () => {
            const response = chakram.put(api.url('albums/211'), albumsData.albums[3]);
            console.log(response)
            expect(response).to.have.status(404);
            console.log
            return chakram.wait();
        });

    });

    describe("Delete", () => {
        it("should be able to delete an album", () => {
            const response = chakram.delete(api.url('albums/10'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const albumDeleted = chakram.get(api.url('albums/10'));
                expect(albumDeleted).to.have.status(404);
                return chakram.wait();
            });
        });

        it("should not delete todo which does not exist", () => {
            const response = chakram.delete(api.url('albums/' + albumsData.albums[3]));
            expect(response).to.have.status(404);
            return chakram.wait()
        });


    });
})
