import React from 'react';
import {IonIcon, IonImg, IonItem, IonLabel} from '@ionic/react';
import { BookProps } from './BookProps';
import {checkmarkCircleOutline, removeCircleOutline} from "ionicons/icons";
import {usePhoto} from "../photos/usePhoto";

interface BookPropsExt extends BookProps {
    onEdit: (id?: string) => void;
}

const Book: React.FC<BookPropsExt> = (props) => {
    const {photo, loadSaved} = usePhoto()
    if(props.image?.webviewPath)
        loadSaved(props.image?.webviewPath!)
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
               {props.image && props.image.webviewPath !== '' &&
                   <IonImg class="myImg" src={photo.webviewPath}/>
               }
           </div>
        </IonItem>
    );
};

export default Book;
