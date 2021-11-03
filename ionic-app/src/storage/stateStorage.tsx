import { Storage } from '@capacitor/storage';
import {BooksState} from "../books/BookProvider";
import {Directory, Encoding} from "@capacitor/filesystem";

export const setState = async (state: BooksState) => {
    await Storage.set({key: 'state', value: JSON.stringify(state)})
}

export const getState = async (): Promise<BooksState> => {
    return await Storage.get({key: 'state'})
        .then(result => JSON.parse(result.value || '{}'))
}

export const removeState = async (deleteFile: any) => {
    const state = await getState()
    if(state.books && state.books.length !== 0){
        state.books.forEach(book => book.image  && deleteFile({
            path: `${book.image.filename}`,
            directory: Directory.Documents,
        })
        )
    }
    await Storage.remove({key: 'state'})
}