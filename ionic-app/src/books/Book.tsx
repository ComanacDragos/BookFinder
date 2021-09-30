import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { BookProps } from './BookProps';

interface BookPropsExt extends BookProps {
    onEdit: (id?: string) => void;
}

const Book: React.FC<BookPropsExt> = ({ id, title, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{title}</IonLabel>
        </IonItem>
    );
};

export default Book;
