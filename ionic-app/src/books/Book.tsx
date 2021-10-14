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
           <div style={{
               "borderWidth": 3,
               "borderStyle": "groove",
               "borderColor": "white",
               "width": '90%',
               "margin": "10px auto",
               "padding": "5px",
               "textAlign": "center"
           }}>
               <div style={{
                   "display": "flex",
                   "columnGap": "5%",
                   "width": '80%',
                   "margin": "10px auto",
                   "justifyContent": 'center'
               }}>
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
