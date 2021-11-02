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
    IonToolbar,
    IonImg,
    IonFab,
    IonFabButton,
    IonIcon
} from '@ionic/react';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import { RouteComponentProps } from 'react-router';
import {BookPosition, BookProps} from './BookProps';
import {NetworkStatus} from "../networkStatus";
import {NetworkStatusContext} from "../networkStatus/NetworkStatusProvider";
import {camera} from 'ionicons/icons';
import {usePhoto} from "../photos/usePhoto";
import {AuthContext} from "../auth";
import {useMyLocation} from "../maps/useMyLocation";
import {MyMap} from "../maps/MyMap";
import { createAnimation } from '@ionic/react';
import {validateContent} from "ionicons/dist/types/components/icon/validate";

const log = getLogger('BookEdit');

interface BookEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BookEdit: React.FC<BookEditProps> = ({ history, match }) => {
    const { books, saving, savingError, saveBook, deleteBook, deleteError, deleting } = useContext(BookContext);
    const {connected} = useContext(NetworkStatusContext);

    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}

    const [bookPosition, setBookPosition] = useState<BookPosition>({lat: undefined, lng: undefined})

    const [title, setTitle] = useState('');
    const [library, setLibrary] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [pages, setPages] = useState(0);
    const [dueDate, setDueDate] = useState(new Date(Date.now()))

    const {photo, takePhoto, savePicture} = usePhoto(match.params.id)

    const [book, setBook] = useState<BookProps>();

    useEffect(animateButtons, [])

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
            setBookPosition(book.position)
        }
    }, [match.params.id, books]);
    const handleSave = async () => {
        if(!title || title==="" || !library || library === ""){
            required()
            return
        }

        const editedBook = book ?
            { ...book,
                title:title,
                library: library,
                isAvailable: isAvailable,
                dueDate: dueDate,
                pages: pages,
                position: bookPosition
            }
            : { title:title,
                library: library,
                isAvailable: isAvailable,
                date: new Date(Date.now()),
                dueDate: dueDate,
                pages: pages,
                position: bookPosition
        };
        saveBook && saveBook(editedBook, connected)
            .then(async bookId => bookId && photo.webviewPath
                && await savePicture(bookId))
            .then(() => history.goBack());
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
                        <IonButton id="deleteButton" onClick={handleDelete}>
                            Delete
                        </IonButton>
                        <IonButton id="saveButton" onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem id="titleInput">
                    <IonLabel>Title:</IonLabel>
                    <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
                </IonItem>
                <IonItem id="libraryInput">
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
                {photo.webviewPath && <IonItem>
                    <IonImg src={photo.webviewPath}/>
                </IonItem>}

                <IonItem>
                    Latitude: {JSON.stringify(bookPosition.lat)}
                </IonItem>
                <IonItem>
                    Longitude: {JSON.stringify(bookPosition.lng)}
                </IonItem>
                    {//bookPosition.lng && bookPosition.lat &&
                    <MyMap
                        lat={bookPosition.lat || lat || 0}
                        lng={bookPosition.lng || lng || 0}
                        onMapClick={clickMap('onMap')}
                        onMarkerClick={log('onMarker')}
                    />
                    }

                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
                <IonLoading isOpen={saving || deleting} />
            </IonContent>
        </IonPage>
    );
    function clickMap(source: string) {
        return (e: any) => {
            console.log(source, e.latLng.lat(), e.latLng.lng());
            if(e.latLng.lat() && e.latLng.lng())
              setBookPosition({lat: e.latLng.lat(), lng: e.latLng.lng()})
        }
    }
    function required() {
        const titleInput = document.querySelector('#titleInput');
        const libraryInput = document.querySelector('#libraryInput');
        if (titleInput && libraryInput) {
            (async () => {
                if(!title || title==="")
                    await initAnimation(titleInput).play();
                if(!library || library==="")
                    await initAnimation(libraryInput).play();
            })();
        }
        function initAnimation(el: any){
            return createAnimation()
                .addElement(el)
                .duration(200)
                .direction('alternate')
                .iterations(2)
                .keyframes([
                    { offset: 0, opacity: '1' },
                    {
                        offset: 0.5, opacity: '0.5', transform: "rotate(5deg)"
                    },
                    {
                        offset: 1, opacity: '1', transform: "rotate(-5deg)"
                    }
                ]);
        }
    }

    function animateButtons() {
        const saveButton = document.querySelector('#saveButton');
        const deleteButton = document.querySelector('#deleteButton');
        if (saveButton && deleteButton) {
            const animationA = initAnimation(saveButton)
            const animationB = initAnimation(deleteButton)
            const parentAnimation = createAnimation()
                .duration(1000)
                .direction("alternate")
                .iterations(Infinity)
                .addAnimation([animationA, animationB]);
            parentAnimation.play();
        }
        function initAnimation(el: any){
            return createAnimation()
                .addElement(el)
                .keyframes([
                    { offset: 0, opacity: '1', transform: "rotate(30deg)" },
                    {
                        offset: 0.5, opacity: '0.5', //
                    },
                    {
                        offset: 1, opacity: '1', transform: "rotate(-30deg)"
                    }
                ]);
        }
    }
};

export default BookEdit;
