import { Storage } from '@capacitor/storage';

export const setToken:(token: string)=>void = async (token: string)=>{
    await Storage.set({
        key: 'token',
        value: token
    });
}

export const getToken: ()=>Promise<string> = async () =>{
    return await Storage.get({
        key: 'token'
    }).then(result => Promise.resolve(result.value || ''));
}

export const removeToken = async () =>{
    await Storage.remove({
        key: 'token'
    })
}