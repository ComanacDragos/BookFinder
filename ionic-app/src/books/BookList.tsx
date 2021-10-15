import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonItem, IonLabel,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Book from './Book';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import {AuthContext} from "../auth";

const log = getLogger('BookList');

const BookList: React.FC<RouteComponentProps> = ({ history }) => {
    const { books, fetching, fetchingError } = useContext(BookContext);
    const {logout} = useContext(AuthContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Libraries</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching books" />
                {books && (
                    <IonList>
                        {books.map((props) =>
                            <Book key={props._id}
                                  _id={props._id}
                                  title={props.title}
                                  library={props.library}
                                  date={props.date}
                                  dueDate={props.dueDate}
                                  isAvailable={props.isAvailable}
                                  pages={props.pages}
                                  onEdit={id => history.push(`/book/${id}`)} />)}
                    </IonList>
                )}
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
            </IonContent>
        </IonPage>
    );
};

export default BookList;
