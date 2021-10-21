import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { BookProps } from './BookProps';
import {
    createBook,
    getBooks,
    newWebSocket,
    updateBook,
    deleteBook,
    getBooksPaginated,
    getLibraries,
    getBooksPaginatedAndFiltered
} from './bookApi';
import { AuthContext } from '../auth';
import {NetworkStatusContext} from "../networkStatus/NetworkStatusProvider";
import {addAction, getActions, getToken, removeActions} from "../storage";

const log = getLogger('BookProvider');

type SaveBookFn = (book: BookProps, isConnected: boolean) => Promise<any>;
type DeleteBookFn = (bookId: string) => Promise<any>;
type FetchPaginatedFn = (isConnected: boolean) => void
type SetFilterFn = (filter: string) => void


export interface BooksState {
    books?: BookProps[],
    libraries: string[]
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,

    deleting: boolean,
    deleteError?: Error | null,

    saveBook?: SaveBookFn,
    deleteBook?: DeleteBookFn,

    offset: number,
    disableInfiniteScroll: boolean,
    fetchPaginated: FetchPaginatedFn
    clearData?: () => void

    filter: string | null,
    startFiltering: boolean;
    setFilterFn?: SetFilterFn,

    actions: any,
    settingActions: boolean
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: BooksState = {
    fetching: false,
    libraries: [],
    saving: false,
    deleting: false,
    offset: 0,
    disableInfiniteScroll: false,
    fetchPaginated: ()=>{},
    filter: null,
    startFiltering: false,
    actions: [],
    settingActions: false
};

const FETCH_BOOKS_STARTED = 'FETCH_BOOKS_STARTED';
const FETCH_BOOKS_SUCCEEDED = 'FETCH_BOOKS_SUCCEEDED';
const FETCH_BOOKS_PAGINATED_SUCCEEDED = 'FETCH_BOOKS_PAGINATED_SUCCEEDED';
const FETCH_BOOKS_FAILED = 'FETCH_BOOKS_FAILED';

const SAVE_BOOK_STARTED = 'SAVE_BOOK_STARTED';
const SAVE_BOOK_SUCCEEDED = 'SAVE_BOOK_SUCCEEDED';
const SAVE_BOOK_FAILED = 'SAVE_BOOK_FAILED';

const DELETE_BOOK_STARTED = 'DELETE_BOOK_STARTED';
const DELETE_BOOK_SUCCEEDED = 'DELETE_BOOK_SUCCEEDED';
const DELETE_BOOK_FAILED = 'DELETE_BOOK_FAILED';

const DISABLE_INFINITE_SCROLL = 'DISABLE_INFINITE_SCROLL'

const CLEAR_DATA = 'CLEAR_DATA'
const CLEAR_BOOKS = 'CLEAR_BOOKS'

const SET_LIBRARIES = 'SET_LIBRARIES'

const SET_FILTER = 'SET_FILTER'
const END_FILTERING = 'END_FILTERING'

const SET_ACTIONS = 'SET_ACTIONS'


const reducer: (state: BooksState, action: ActionProps) => BooksState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_BOOKS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_BOOKS_SUCCEEDED:
                return { ...state, books: payload.books, fetching: false };
            case FETCH_BOOKS_PAGINATED_SUCCEEDED:
                return { ...state,
                    books: state.offset===payload.offset?[...state.books
                    || [], ...payload.books
                            .filter((book:any)=>
                                !state.books?.map(stateBook => stateBook._id).includes(book._id))
                        ]
                        :state.books,
                    fetching: false,
                    offset: state.offset===payload.offset?state.offset+1:state.offset,
                }
            case FETCH_BOOKS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_BOOK_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_BOOK_SUCCEEDED:
                let books = [...(state.books || [])];
                const book = payload.book;
                const index = books.findIndex(it => it._id === book._id);
                if (index === -1) {
                    if(state.filter === null)
                        books.splice(0, 0, book);
                    else{
                        if(book.library === state.filter)
                            books.splice(0, 0, book);
                    }
                } else {
                    books[index] = book;
                }
                return { ...state, books: books, saving: false};
            case SAVE_BOOK_FAILED:
                return { ...state, savingError: payload.error, saving: false, settingActions: true  };
            case DELETE_BOOK_STARTED:
                return {...state, deleteError: null, deleting: true}
            case DELETE_BOOK_SUCCEEDED:
                const deleteIndex = (state.books || []).findIndex(book => payload.bookId === book._id);
                if (deleteIndex !== -1 && state.books) {
                    state.books.splice(deleteIndex, 1);
                }
                return {...state, deleting: false, offset: state.offset!==0?state.offset-1:0};
            case DELETE_BOOK_FAILED:
                return {...state, deleteError: payload.error, deleting: false}
            case DISABLE_INFINITE_SCROLL:
                return {...state, disableInfiniteScroll: true, fetching: false}
            case CLEAR_DATA:
                return {
                    ...state, books: [],
                    libraries: [],
                    fetching: false,
                    saving: false,
                    deleting: false,
                    offset: 0,
                    disableInfiniteScroll: false,
                    deleteError: null,
                    savingError: null,
                    fetchingError: null,
                    filter: null,
                    startFiltering: false
                }
            case SET_LIBRARIES:
                return {...state, libraries: payload.libraries}
            case SET_FILTER:
                 return {...state, filter: payload.filter}
            case CLEAR_BOOKS:
                return {...state, books: [], offset: 0, startFiltering: true, disableInfiniteScroll: false}
            case END_FILTERING:
                return {...state, startFiltering: false}
            case SET_ACTIONS:
                return {...state, actions: payload.actions, settingActions: false}
            default:
                return state;
        }
    };

export const BookContext = React.createContext<BooksState>(initialState);

interface BookProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const BookProvider: React.FC<BookProviderProps> = ({ children }) => {
    const {connected} = useContext(NetworkStatusContext);
    const { token, isAuthenticated } = useContext(AuthContext);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { startFiltering, books, libraries, filter, fetching, fetchingError, saving, savingError, deleting, deleteError, offset, disableInfiniteScroll, clearData, settingActions, actions } = state;
    //useEffect(getBooksPaginatedEffect, [token]);
    useEffect(wsEffect, [token]);
    useEffect(backOnlineEffect, [connected])
    useEffect(setLibrariesEffect, [books])

    const clearDataFn = useCallback<()=>void>(clearDataCallback, [token])
    const saveBook = useCallback<SaveBookFn>(saveBookCallback, [token]);
    const delBook = useCallback<DeleteBookFn>(deleteBookCallBack, [token])
    const fetchPaginated = useCallback<FetchPaginatedFn>(fetchPaginatedBooks, [token, connected, offset]);
    const setFilterCallback = useCallback<SetFilterFn>(setFilter, [])

    const value = { books, libraries, fetching, fetchingError, saving, savingError, deleting, deleteError,
        saveBook: saveBook, deleteBook: delBook, fetchPaginated: fetchPaginated, setFilterFn: setFilterCallback,
        offset, disableInfiniteScroll, clearData: clearDataFn, filter, startFiltering,
        settingActions, actions
    };
    log('returns');

    useEffect(()=>{
        dispatch({type: CLEAR_BOOKS})
        log('clear books')
    }, [filter])
    
    useEffect(
        ()=>{
            if(startFiltering){
                fetchPaginated(connected)
                dispatch({type: END_FILTERING})
                log('end filtering')
            }
        },[startFiltering]
    )

    useEffect(setActionsEffect, [settingActions])

    return (
        <BookContext.Provider value={value}>
            {children}
        </BookContext.Provider>
    );

    async function setFilter(filter: string){
        dispatch({type: SET_FILTER, payload: {filter: filter}})
    }

    async function clearDataCallback(){
        dispatch({type: CLEAR_DATA})
    }

    function setActionsEffect(){
        let canceled = false;
        setActions()
        return () => {canceled = true}

        async function setActions(){
            if(!canceled && settingActions){
                log("settings actions")
                dispatch({type: SET_ACTIONS, payload: {actions: await getActions()}})
            }
        }
    }

    function setLibrariesEffect(){
        if(!token || !connected)
            return ;
        let canceled = false;
        setLibraries()
        return () => {canceled = true}

        async function setLibraries(){
            if(!canceled){
                const libraries = await getLibraries(token)
                dispatch({ type: SET_LIBRARIES, payload: { libraries: libraries } });
            }
        }
    }

    function backOnlineEffect(){
        let canceled = false;
        backOnline()
        return () => {canceled = true}

        async function backOnline(){
            if(connected) {
                const actions = await getActions();
                if(canceled)
                    return;

                for (let i=0;i<actions.length; i++) {
                    if(actions[i]){
                        saveBookCallback(actions[i].payload, connected)
                    }
                }
                await removeActions();
                value.savingError = null;
                dispatch({type: SET_ACTIONS, payload:{actions: []}})
            }
        }
    }

    async function fetchPaginatedBooks(isConnected: boolean) {
        const trueToken = await getToken();
        if (!token?.trim() || token !== trueToken) {
            return;
        }

        if(!isConnected){
            log("Can't fetch paginated books because there is no connection")
            return;
        }
        if(fetching || !isAuthenticated || !token){
            return;
        }

        try {
            log('fetchBooksPaginated started');
            dispatch({ type: FETCH_BOOKS_STARTED })

            const books = filter ? await getBooksPaginatedAndFiltered(token, offset, filter):await getBooksPaginated(token, offset);
            log('fetchBooksPaginated succeeded - books:', books.length, " offset: ", offset);
            if(books && books.length>0){
                dispatch({ type: FETCH_BOOKS_PAGINATED_SUCCEEDED, payload: { books: books, offset: offset } });
                if(books.length < 3)
                    dispatch({type: DISABLE_INFINITE_SCROLL, payload: {offset: offset}});
            }else{
                dispatch({type: DISABLE_INFINITE_SCROLL, payload: {offset: offset}});
            }
        } catch (error) {
            log('fetchBooksPaginated failed');
            dispatch({ type: FETCH_BOOKS_FAILED, payload: { error } });
        }
    }

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

    async function saveBookCallback(book: BookProps, isConnected: boolean) {
        try {
            log('saveBook started, isConnected: ' + isConnected);
            if(isConnected){
                dispatch({ type: SAVE_BOOK_STARTED });
                const savedBook = await (book._id ? updateBook(token, book) : createBook(token, book));
                log('saveBook succeeded');
                //dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book: savedBook } });
                const libraries = await getLibraries(token)
                dispatch({ type: SET_LIBRARIES, payload: { libraries: libraries } });
            }else{
                log('saveBook failed - no network');
                addAction(book._id?'updateBook':'createBook', book)
                dispatch({ type: SAVE_BOOK_FAILED, payload: {error:{
                    message: `Changes to book with title ${book.title} will be sent to server when back online`
                }}});
            }

        } catch (error) {
            log('saveBook failed --' + error);
            addAction(book._id?'updateBook':'createBook', book)
            dispatch({ type: SAVE_BOOK_FAILED, payload: { error } });
        }
    }

    async function deleteBookCallBack(bookId: string){
        try{
            log("deleteBook started")
            dispatch({type: DELETE_BOOK_STARTED})
            await deleteBook(token, bookId);
            //dispatch({type: DELETE_BOOK_SUCCEEDED, payload: {bookId: bookId}})
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
