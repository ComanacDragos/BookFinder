import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import { RouteComponentProps } from 'react-router';
import { BookProps } from './BookProps';

const log = getLogger('BookEdit');

interface BookEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BookEdit: React.FC<BookEditProps> = ({ history, match }) => {
    const { books, saving, savingError, saveBook, deleteBook, deleteError, deleting } = useContext(BookContext);
    //const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [library, setLibrary] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    const [book, setBook] = useState<BookProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const book = books?.find(it => it.id === routeId);
        setBook(book);
        if (book) {
            setTitle(book.title);
            setLibrary(book.library)
            setIsAvailable(book.isAvailable)
        }
    }, [match.params.id, books]);
    const handleSave = () => {
        const editedBook = book ? { ...book, title:title, library: library, isAvailable: isAvailable, date: new Date(Date.now()) }
            : { title:title, library: library, isAvailable: isAvailable, date: new Date(Date.now()) };
        saveBook && saveBook(editedBook).then(() => history.goBack());
    };

    const handleDelete = ()=>{
        log(`delete ${match.params.id}`)
        deleteBook && deleteBook(match.params.id || '-1').then(() => history.goBack());
    }
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleDelete}>
                            Delete
                        </IonButton>
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel>Title:</IonLabel>
                    <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel>Library:</IonLabel>
                    <IonInput value={library} onIonChange={e => setLibrary(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel>Is available </IonLabel>
                    <IonCheckbox class="ion-text-wrap" checked={isAvailable} onIonChange={e => setIsAvailable(e.detail.checked || false)} />
                </IonItem>
                <IonLoading isOpen={saving || deleting} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
                {
                    deleteError && (<div>{deleteError.message || 'Failed to delete'}</div>)
                }
            </IonContent>
        </IonPage>
    );
};

export default BookEdit;
