import React from 'react';
import {IonButton, IonFabButton, IonIcon, IonItem, IonLabel} from '@ionic/react';
import { BookProps } from './BookProps';
import {removeCircle, checkmarkCircleOutline, removeCircleOutline} from "ionicons/icons";

interface BookPropsExt extends BookProps {
    onEdit: (id?: string) => void;
}
//{ id, title, onEdit }
const Book: React.FC<BookPropsExt> = (props) => {
    return (
        <IonItem onClick={() => props.onEdit(props.id)}>
            <IonLabel>{props.title}</IonLabel>
            <IonLabel>{props.library}</IonLabel>
            <IonLabel>{new Date(props.date).toDateString()}</IonLabel>
            <IonLabel>
            {
                props.isAvailable && <IonIcon icon={checkmarkCircleOutline} />
            }
            {
                !props.isAvailable && <IonIcon icon={removeCircleOutline} />
            }
            </IonLabel>
        </IonItem>
    );
};

export default Book;
