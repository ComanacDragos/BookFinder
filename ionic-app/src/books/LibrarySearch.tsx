import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext, useState} from "react";
import {
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonList,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonButtons,
    useIonViewWillEnter
} from '@ionic/react';
import {BookContext} from "./BookProvider";

const log = getLogger('library search');


const LibrarySearch: React.FC<RouteComponentProps> = ({ history, match }) => {
    const {libraries} = useContext(BookContext);
    const [searchLibrary, setSearchLibrary] = useState<string>('');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Search Libraries</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={()=> history.goBack()}>Back</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonSearchbar
                    value={searchLibrary}
                    debounce={1000}
                    onIonChange={e => setSearchLibrary(e.detail.value!)}>
                </IonSearchbar>
                <IonList>
                    {libraries
                        .filter(library => library.indexOf(searchLibrary) >= 0)
                        .map(library => <IonItem key={library}>{library}</IonItem>)}
                </IonList>
            </IonContent>
        </IonPage>
    );
}

export default LibrarySearch;