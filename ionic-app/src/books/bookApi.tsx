import axios from 'axios';
import { BookProps } from './BookProps';
import {authConfig, baseUrl, getLogger, pageSize, withLogs} from '../core';


const bookUrl = `http://${baseUrl}/api/book`;

export const getBooks: (token: string) => Promise<BookProps[]> = (token) => {
    return withLogs(axios.get(bookUrl, authConfig(token)), 'getBooks');
}

export const getBooksPaginated: (token: string, offset:number) => Promise<BookProps[]> = (token, offset) => {
    return withLogs(axios.get(bookUrl + `/paginated/size=${pageSize}&offset=${offset}`, authConfig(token)), 'getBooksPaginated');
}

export const createBook: (token: string, book: BookProps) => Promise<BookProps[]> = (token ,book) => {
    return withLogs(axios.post(bookUrl, book, authConfig(token)), 'createBook');
}

export const updateBook: (token: string, book: BookProps) => Promise<BookProps[]> = (token, book) => {
    return withLogs(axios.put(`${bookUrl}/${book._id}`, book, authConfig(token)), 'updateBook');
}

export const deleteBook: (token: string, bookId: string) => Promise<BookProps[]> = (token, bookId) => {
    return withLogs(axios.delete(`${bookUrl}/${bookId}`, authConfig(token)), 'deleteBook');
}

interface MessageData {
    event: string;
    payload: BookProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
