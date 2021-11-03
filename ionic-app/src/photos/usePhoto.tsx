import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {Directory, Encoding, FilesystemDirectory, WriteFileResult} from "@capacitor/filesystem";
import {useCallback, useContext, useEffect, useState} from 'react';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import {getLogger} from "../core";
import {book} from "ionicons/icons";

export interface Photo {
    webviewPath?: string;
    filename?: string;
}

type SavePictureFn = (bookId: string) => Promise<Photo>;

const log = getLogger('usePhoto');

export function usePhoto() {
    const [photo, setPhoto] = useState<Photo>({});
    log("enter")

    const takePhoto = async () => {
        log("takePhoto")
        const cameraPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        });
        await setPhoto({webviewPath: cameraPhoto.webPath});
    };

    const { deleteFile, readFile, writeFile } = useFilesystem();
    const savePicture = async (bookId: string): Promise<Photo> => {
        log("savePicture")
        const base64Data = await base64FromPath(photo.webviewPath!);
        const fileName = bookId + ".jpeg"//new Date().getTime() + '.jpeg';
        await setPhoto({...photo, filename: fileName})
        const result: WriteFileResult = await writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        return {filename: fileName, webviewPath: result.uri}
    };

    const savebase64Picture = async (base64Data: string, bookId: string): Promise<Photo> => {
        log("savePicture")
        const fileName = bookId + ".jpeg"//new Date().getTime() + '.jpeg';
        await setPhoto({...photo, filename: fileName})
        const result: WriteFileResult = await writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        return {filename: fileName, webviewPath: result.uri}
    };
    const loadSaved = async (path: string) => {
        log(`loadSaved`)
        if(photo.webviewPath)
            return
        const filename = path.substr(path.lastIndexOf('/') + 1);
        const file = await readFile({
                path: filename,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });
        setPhoto({webviewPath: file.data//`data:image/jpeg;base64,${file.data}`
            , filename: path})
    };

    return {
        photo,
        takePhoto: takePhoto,
        savePicture: savePicture,
        setPhoto: setPhoto,
        saveBase64Picture: savebase64Picture,
        loadSaved: loadSaved
    };
}