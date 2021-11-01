import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {FilesystemDirectory} from "@capacitor/filesystem";
import {useCallback, useContext, useEffect, useState} from 'react';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import {addPhoto, getPhotoOfBook} from "../storage/photoStorage";
import {getLogger} from "../core";
import {createPhoto, getPhoto, updatePhoto} from "./photoApi";
import {AuthContext} from "../auth";
import {BookProps} from "../books/BookProps";

export interface Photo {
    filepath?: string
    webviewPath?: string;
    _id?: string
}

type SavePictureFn = (bookId: string) => Promise<void>;

const log = getLogger('usePhoto');

export function usePhoto(bookId: string|undefined) {
    const [photo, setPhoto] = useState<Photo>({_id: undefined, filepath: undefined, webviewPath: undefined});

    const {token} = useContext(AuthContext)

    log("enter")

    const takePhoto = async () => {
        log("takePhoto")
        const cameraPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        });
        //const savedFileImage = await savePicture(cameraPhoto, fileName);
        setPhoto({_id: photo._id, webviewPath: cameraPhoto.webPath});
        //addPhoto(bookId, savedFileImage)
    };

    const { deleteFile, readFile, writeFile } = useFilesystem();
    const savePicture = async (bookId: string): Promise<void> => {
        log("savePicture -- " + bookId)
        const base64Data = await base64FromPath(photo.webviewPath!);

        const serverPhoto = await updatePhoto(token, {_id: photo._id, base64: base64Data, bookId: bookId})
        await writeFile({
            path: `${bookId}.jpeg`,
            data: base64Data,
            directory: FilesystemDirectory.Data
        });
        const updatedPhoto = {webviewPath: photo.webviewPath, _id:serverPhoto._id, filepath: `${bookId}.jpeg`}
        await addPhoto(bookId, updatedPhoto)
        await setPhoto(updatedPhoto)
    };
    const loadSaved = async (id: string) => {
        log(`loadSaved ${id}`)
        const photo = await getPhotoOfBook(id) as Photo;
        if(photo){
            const file = await readFile({
                path: `${id}.jpeg`,
                directory: FilesystemDirectory.Data
            });
            photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
            setPhoto(photo)
        }else{
            if(bookId){
                const photoFromServer = await getPhoto(token, bookId)
                //console.log(JSON.stringify(photo))
                if(photoFromServer !== null){
                    await setPhoto({_id: photoFromServer._id, filepath: `${id}.jpeg`, webviewPath: photoFromServer.base64})
                    await writeFile({
                        path: `${bookId}.jpeg`,
                        data: photoFromServer.base64,
                        directory: FilesystemDirectory.Data
                    });
                    await addPhoto(bookId, {_id: photoFromServer._id, filepath: `${id}.jpeg`, webviewPath: photoFromServer.base64})
                }
            }
        }
    };
    useEffect(() => {
        if(bookId && bookId !== "")
            loadSaved(bookId);
    }, [addPhoto, readFile]);
    //loadSaved()

    const savePictureCallback = useCallback<SavePictureFn>(savePicture, [photo])
    return {
        photo,
        takePhoto: takePhoto,
        savePicture: savePictureCallback
    };
}