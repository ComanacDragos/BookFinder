import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent, IonDatetime,
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
import {NetworkStatus} from "../networkStatus";
import {NetworkStatusContext} from "../networkStatus/NetworkStatusProvider";

const log = getLogger('BookEdit');

interface BookEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BookEdit: React.FC<BookEditProps> = ({ history, match }) => {
    const { books, saving, savingError, saveBook, deleteBook, deleteError, deleting } = useContext(BookContext);
    const {connected} = useContext(NetworkStatusContext);

    //const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [library, setLibrary] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [pages, setPages] = useState(0);
    const [dueDate, setDueDate] = useState(new Date(Date.now()))

    const [book, setBook] = useState<BookProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const book = books?.find(it => it._id === routeId);
        setBook(book);
        if (book) {
            setTitle(book.title);
            setLibrary(book.library);
            setIsAvailable(book.isAvailable);
            setPages(book.pages);
            setDueDate(book.dueDate);
        }
    }, [match.params.id, books]);
    const handleSave = () => {
        const editedBook = book ?
            { ...book,
                title:title,
                library: library,
                isAvailable: isAvailable,
                dueDate: dueDate,
                pages: pages
            }
            : { title:title,
                library: library,
                isAvailable: isAvailable,
                date: new Date(Date.now()),
                dueDate: dueDate,
                pages: pages
        };

        saveBook && saveBook(editedBook, connected).then(() => history.goBack());
    };

    const handleDelete = ()=>{
        log(`delete ${match.params.id}`)
        if(connected)
            deleteBook && deleteBook(match.params.id || '-1').then(() => history.goBack());
        else
            alert("can't delete in offline mode")
    }
    log('render');
    return (
        <IonPage>
            <NetworkStatus/>
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
                <IonItem>
                    <IonLabel>Pages:</IonLabel>
                    <IonInput type='number' value={pages} onIonChange={e => setPages(parseInt(e.detail.value || '0') )} />
                </IonItem>
                <IonItem>
                    <IonLabel>Due Date:</IonLabel>
                    <IonDatetime max="2222-10-31" value={new Date(dueDate).toDateString()} onIonChange={e =>
                        setDueDate(new Date(Date.parse(e.detail.value || new Date(Date.now()).toDateString())))} />
                </IonItem>

                <IonLoading isOpen={saving || deleting} />
            </IonContent>
        </IonPage>
    );
};

export default BookEdit;
