import {Storage} from "@capacitor/storage";
import {useFilesystem} from "@ionic/react-hooks/filesystem";
import {FilesystemDirectory} from "@capacitor/filesystem";

const PHOTO_STORAGE = 'photos';

export const addPhoto = async (bookId: string, photo: any) =>{
    const {value} = await Storage.get({key:PHOTO_STORAGE})
    let photos;
    if(value === null)
        photos = {}
    else
        photos = JSON.parse(value)
    photos[bookId] = photo
    await Storage.set({
        key: PHOTO_STORAGE,
        value: JSON.stringify(photos)
    })
}

export const getPhotoOfBook = async (bookId: string) => {
    return await Storage.get({key: PHOTO_STORAGE})
        .then(result => JSON.parse(result.value || '{}')[bookId])
}

export const removePhoto = async (bookId: string, deleteFile: any) =>{
    const {value} = await Storage.get({key:PHOTO_STORAGE})
    let photos;
    if(value === null)
        photos = []
    else
        photos = JSON.parse(value)

    if(photos[bookId])
        deleteFile({
            path: photos[bookId].filepath,
            directory: FilesystemDirectory.Data
        });
    delete photos[bookId]
    await Storage.set({
        key: PHOTO_STORAGE,
        value: JSON.stringify(photos)
    })
}

export const removePhotos = async (deleteFile: any) =>{
    const {value} = await Storage.get({key:PHOTO_STORAGE})
    let photos:any;
    if(value !== null){
        photos = JSON.parse(value)
        Object.keys(photos).forEach(k=>{
            const filename = photos[k].filepath.substr(photos[k].filepath.lastIndexOf('/') + 1);
            deleteFile({
                path: filename,
                directory: FilesystemDirectory.Data
            });
        })
    }

    await Storage.remove({key: PHOTO_STORAGE})
}
