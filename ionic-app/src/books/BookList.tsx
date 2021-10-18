import React, {useContext, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonButton, IonCard, IonCheckbox,
    IonContent, IonDatetime,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar, useIonViewWillEnter
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Book from './Book';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import {AuthContext} from "../auth";
import {NetworkStatus} from "../networkStatus";
import {NetworkStatusContext} from "../networkStatus/NetworkStatusProvider";

const log = getLogger('BookList');

const BookList: React.FC<RouteComponentProps> = ({ history }) => {
    const { offset, books, fetching, fetchingError, savingError, deleteError, fetchPaginated, disableInfiniteScroll } = useContext(BookContext);
    const {logout} = useContext(AuthContext);
    const {connected} = useContext(NetworkStatusContext);

    useIonViewWillEnter(async () =>{
        await fetchPaginated(connected);
    }, [connected, offset]);

    async function searchNext($event: CustomEvent<void>) {
        await fetchPaginated(connected);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    log('render');
    return (
        <IonPage>
            <NetworkStatus/>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Libraries</IonTitle>
                </IonToolbar>
                <div>
                    Disable scroll {JSON.stringify(disableInfiniteScroll)}
                </div>
                <div>
                    Offset {JSON.stringify(offset)}
                </div>
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
                {
                    deleteError && (<div>{deleteError.message || 'Failed to delete'}</div>)
                }
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching books" />
                {
                    books?.map((props) =>{
                        return (<IonCard key={props._id}>
                            <Book key={props._id}
                                  _id={props._id}
                                  title={props.title}
                                  library={props.library}
                                  date={props.date}
                                  dueDate={props.dueDate}
                                  isAvailable={props.isAvailable}
                                  pages={props.pages}
                                  onEdit={id => history.push(`/book/${id}`)} />
                        </IonCard>)
                    })
                }
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more books...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch books'}</div>
                )}
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonButton onClick={()=>logout && logout()}>Logout</IonButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/book')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <IonCheckbox style={{'visibility':'hidden'}}></IonCheckbox>
                <IonDatetime style={{'visibility':'hidden'}}></IonDatetime>
            </IonContent>
        </IonPage>
    );
};

export default BookList;
