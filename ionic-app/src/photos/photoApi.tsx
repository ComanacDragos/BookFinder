import axios from 'axios';
import {authConfig, baseUrl, getLogger, pageSize, withLogs} from '../core';

const photoUrl = `http://${baseUrl}/api/photo`;

interface ServerPhoto{
    _id?: string
    bookId: string
    base64: string
}

export const getPhoto: (token: string, bookId: string) => Promise<ServerPhoto> = (token, bookId) => {
    return withLogs(axios.get(`${photoUrl}/${bookId}`, authConfig(token)), 'getPhoto');
}

export const createPhoto: (token: string, photo: ServerPhoto) => Promise<ServerPhoto> = (token ,photo) => {
    return withLogs(axios.post(photoUrl, photo, authConfig(token)), 'createPhoto');
}

export const updatePhoto: (token: string, photo: ServerPhoto) => Promise<ServerPhoto> = (token, photo) => {
    return withLogs(axios.put(`${photoUrl}/${photo._id}`, photo, authConfig(token)), 'updatePhoto');
}
