import dataStore from 'nedb-promise';

export class PhotoStore {
    constructor({ filename, autoload }) {
        this.store = dataStore({ filename, autoload });
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(photo) {
        return this.store.insert(photo);
    };

    async update(props, photo) {
        return this.store.update(props, photo);
    }

    async remove(props) {
        return this.store.remove(props);
    }
}

export default new PhotoStore({ filename: './db/photos.json', autoload: true });