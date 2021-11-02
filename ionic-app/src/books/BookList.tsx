import React, {useContext, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonButton, IonCard, IonCheckbox,
    IonContent, IonDatetime,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel,
    IonList, IonLoading,IonButtons,
    IonPage, IonSelect, IonSelectOption,
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
    const { filter, setFilterFn, libraries, clearData, offset, books, fetching, fetchingError, savingError, deleteError, fetchPaginated, disableInfiniteScroll, actions } = useContext(BookContext);
    const {logout, token} = useContext(AuthContext);
    const {connected} = useContext(NetworkStatusContext);

    useIonViewWillEnter(async () =>{
        if(offset ===0)
            await fetchPaginated(connected);
    }, [token, connected, offset]);

    async function searchNext($event: CustomEvent<void>) {
        await fetchPaginated(connected);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    async function logoutHandle(){
        if(logout && clearData){
            log('logout handle')
            clearData()
            logout()
        }
    }

    log('render');
    return (
        <IonPage>
            <NetworkStatus/>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Libraries</IonTitle>
                    <IonButtons slot="end">
                        <IonButton slot="end" onClick={()=> history.push('/libraries')}>Search</IonButton>
                    </IonButtons>
                </IonToolbar>
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
                {
                    deleteError && (<div>{deleteError.message || 'Failed to delete'}</div>)
                }
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch books'}</div>
                )}

                <IonSelect value={filter} placeholder="Select Library" onIonChange={e => setFilterFn && setFilterFn(e.detail.value)}>
                    {libraries.map(library => <IonSelectOption key={library} value={library}>{library}</IonSelectOption>)}
                </IonSelect>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching books" />
                {   actions.length !== 0 &&
                    <div>Actions to be done when back online</div>
                }
                {   actions.length !== 0 &&
                    actions?.map((props:any) =>{
                        return (<IonCard key={props.payload._id}>
                            <div>Action to be taken: {props.action}</div>
                            <Book key={props.payload._id}
                                  _id={props.payload._id}
                                  title={props.payload.title}
                                  library={props.payload.library}
                                  date={props.payload.date}
                                  dueDate={props.payload.dueDate}
                                  isAvailable={props.payload.isAvailable}
                                  pages={props.payload.pages}
                                  position={props.payload.position || {}}
                                  onEdit={() => {}} />
                        </IonCard>)
                    })
                }
                {   actions.length !== 0 &&
                    <div>Books state on the server:</div>
                }
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
                                  onEdit={id => history.push(`/book/${id}`)}
                                  position={props.position || {}}
                            />
                        </IonCard>)
                    })
                }
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more books...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>


                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonButton onClick={logoutHandle}>Logout</IonButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/book')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <IonCheckbox style={{'visibility': 'hidden'}}/>
                <IonDatetime style={{'visibility': 'hidden'}}/>
            </IonContent>
        </IonPage>
    );
};

export default BookList;
