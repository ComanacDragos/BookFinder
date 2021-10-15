import React from 'react';
import {IonIcon, IonItem, IonLabel} from '@ionic/react';
import { BookProps } from './BookProps';
import {checkmarkCircleOutline, removeCircleOutline} from "ionicons/icons";

interface BookPropsExt extends BookProps {
    onEdit: (id?: string) => void;
}

const Book: React.FC<BookPropsExt> = (props) => {
    return (
        <IonItem onClick={() => props.onEdit(props._id)}>
           <div className="book">
               <div className="row">
                   <IonLabel>{props.title}</IonLabel>
                   <IonLabel>
                       {
                           props.isAvailable && <IonIcon style={{"color": "#7FFF00"}} icon={checkmarkCircleOutline} />
                       }
                       {
                           !props.isAvailable && <IonIcon style={{"color": "red"}} icon={removeCircleOutline} />
                       }
                   </IonLabel>
               </div>

               <IonLabel>{props.library}</IonLabel>
               <IonLabel>{new Date(props.dueDate).toDateString()}</IonLabel>
               <IonLabel>Pages: {props.pages}</IonLabel>
           </div>
        </IonItem>

    );
};

export default Book;
