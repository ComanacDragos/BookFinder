import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { BookProps } from './BookProps';
import { createBook, getBooks, newWebSocket, updateBook, deleteBook } from './bookApi';
import { AuthContext } from '../auth';

const log = getLogger('BookProvider');

type SaveBookFn = (book: BookProps) => Promise<any>;
type DeleteBookFn = (bookId: string) => Promise<any>;

export interface BooksState {
    books?: BookProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,

    deleting: boolean,
    deleteError?: Error | null,

    saveBook?: SaveBookFn,
    deleteBook?: DeleteBookFn
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: BooksState = {
    fetching: false,
    saving: false,
    deleting: false
};

const FETCH_BOOKS_STARTED = 'FETCH_BOOKS_STARTED';
const FETCH_BOOKS_SUCCEEDED = 'FETCH_BOOKS_SUCCEEDED';
const FETCH_BOOKS_FAILED = 'FETCH_BOOKS_FAILED';

const SAVE_BOOK_STARTED = 'SAVE_BOOK_STARTED';
const SAVE_BOOK_SUCCEEDED = 'SAVE_BOOK_SUCCEEDED';
const SAVE_BOOK_FAILED = 'SAVE_BOOK_FAILED';

const DELETE_BOOK_STARTED = 'DELETE_BOOK_STARTED';
const DELETE_BOOK_SUCCEEDED = 'DELETE_BOOK_SUCCEEDED';
const DELETE_BOOK_FAILED = 'DELETE_BOOK_FAILED';


const reducer: (state: BooksState, action: ActionProps) => BooksState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_BOOKS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_BOOKS_SUCCEEDED:
                return { ...state, books: payload.books, fetching: false };
            case FETCH_BOOKS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_BOOK_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_BOOK_SUCCEEDED:
                let books = [...(state.books || [])];
                const book = payload.book;
                const index = books.findIndex(it => it._id === book._id);
                if (index === -1) {
                    books.splice(0, 0, book);
                } else {
                    books[index] = book;
                }
                return { ...state, books: books, saving: false };
            case SAVE_BOOK_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            case DELETE_BOOK_STARTED:
                return {...state, deleteError: null, deleting: true}
            case DELETE_BOOK_SUCCEEDED:
                const deleteIndex = (state.books || []).findIndex(book => payload.bookId === book._id);
                if (deleteIndex !== -1 && state.books) {
                    state.books.splice(deleteIndex, 1);
                }
                return {...state, deleting: false};
            case DELETE_BOOK_FAILED:
                return {...state, deleteError: payload.error, deleting: false}
            default:
                return state;
        }
    };

export const BookContext = React.createContext<BooksState>(initialState);

interface BookProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const BookProvider: React.FC<BookProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { books, fetching, fetchingError, saving, savingError, deleting, deleteError } = state;
    useEffect(getBooksEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveBook = useCallback<SaveBookFn>(saveBookCallback, [token]);
    const delBook = useCallback<DeleteBookFn>(deleteBookCallBack, [token])
    const value = { books, fetching, fetchingError, saving, savingError, deleting, deleteError, saveBook: saveBook, deleteBook: delBook };
    log('returns');
    return (
        <BookContext.Provider value={value}>
            {children}
        </BookContext.Provider>
    );

    function getBooksEffect() {
        let canceled = false;
        fetchBooks();
        return () => {
            canceled = true;
        }

        async function fetchBooks() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchBooks started');
                dispatch({ type: FETCH_BOOKS_STARTED });
                const books = await getBooks(token);
                log('fetchBooks succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_BOOKS_SUCCEEDED, payload: { books: books } });
                }
            } catch (error) {
                log('fetchBooks failed');
                dispatch({ type: FETCH_BOOKS_FAILED, payload: { error } });
            }
        }
    }

    async function saveBookCallback(book: BookProps) {
        try {
            log('saveBook started');
            dispatch({ type: SAVE_BOOK_STARTED });
            const savedBook = await (book._id ? updateBook(token, book) : createBook(token, book));
            log('saveBook succeeded');
            dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book: savedBook } });
        } catch (error) {
            log('saveBook failed');
            dispatch({ type: SAVE_BOOK_FAILED, payload: { error } });
        }
    }

    async function deleteBookCallBack(bookId: string){
        try{
            log("deleteBook started")
            dispatch({type: DELETE_BOOK_STARTED})
            await deleteBook(token, bookId);
            dispatch({type: DELETE_BOOK_SUCCEEDED, payload: {bookId: bookId}})
        }catch (error){
            log('deleteBook failed');
            dispatch({ type: SAVE_BOOK_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if(token?.trim()){
            closeWebSocket = newWebSocket(token,message => {
                if (canceled) {
                    return;
                }
                const { event, payload: book} = message;
                log(`ws message, book ${event} -- ${book.title}`);
                if (event === 'created' || event === 'updated') {
                    dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book: book } });
                }
                if(event === 'deleted'){
                    dispatch({type: DELETE_BOOK_SUCCEEDED, payload: {bookId: book._id}})
                }
            });
            return () => {
                log('wsEffect - disconnecting');
                canceled = true;
                closeWebSocket();
            }
        }

    }
};
