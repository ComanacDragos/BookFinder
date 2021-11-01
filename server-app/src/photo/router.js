import Router from 'koa-router';
import photoStore from './store';
import { broadcast } from "../utils";
import {create} from "nedb-promises";

export const router = new Router();

router.get('/:id', async (ctx) =>{
   const response = ctx.response;
   const userId = ctx.state.user._id;
   const id = ctx.params.id;

    const photos = await photoStore.find({bookId:id})

    if(photos.length === 1)
        response.body = photos[0]
    else
        response.body = null
    response.status = 200;
});

const createPhoto = async (ctx, photo, response) => {
    try{
        response.body = await photoStore.insert(photo);
        response.status = 201;
        //broadcast(userId, {event: 'created', payload: response.body});
    }catch (err){
        response.body = {message: err.message};
        console.log(err.message)
        response.status = 400;
    }
}

router.post('/', async ctx => await createPhoto(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
    const photo = ctx.request.body;
    const id = ctx.params.id;
    const photoId = photo._id;
    const response = ctx.response;

    if(photoId && photoId !== id){
        response.body = {message: 'Param id and body _id should be the same'};
        response.status = 400;
        return;
    }

    if(!photoId){
        await createPhoto(ctx, photo, response);
    }else {
        const updateCount = await photoStore.update({_id:photoId}, photo);
        if(updateCount === 1){
            response.body = photo;
            response.status = 200;
            //broadcast(userId, {event: 'updated', payload: book});
        }else{
            response.body = {message: 'Resource no longer exists'};
            response.status = 405
        }
    }
});
