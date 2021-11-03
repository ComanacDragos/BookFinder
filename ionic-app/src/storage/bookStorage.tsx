import { Storage } from '@capacitor/storage';


export const addAction = async (action: any, payload: any) =>{
    const {value} = await Storage.get({key:'actions'})
    let actions;
    if(value === null)
        actions = []
    else
        actions = JSON.parse(value)
    actions.push({action: action, payload: payload})
    await Storage.set({
        key:'actions',
        value: JSON.stringify(actions)
    })
}

export const getActions = async () => {
    return await Storage.get({key: 'actions'})
        .then(result => JSON.parse(result.value || '[]'))
}

export const removeActions = async () =>{
    await Storage.remove({key: 'actions'})
}

