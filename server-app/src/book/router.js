import Router from 'koa-router';
import bookStore from './store';
import { broadcast } from "../utils";
import {create} from "nedb-promises";

export const router = new Router();

router.get('/', async (ctx) =>{
   const response = ctx.response;
   const userId = ctx.state.user._id;
   const books = (await bookStore.find({userId}))
       .sort(
            (a, b) => new Date(b.date).getTime()-new Date(a.date).getTime()
        );
   response.body = books
   response.status = 200;
});

router.get('/libraries', async (ctx) =>{
    const userId = ctx.state.user._id;
    const books = await bookStore.find({userId})
    const libraries = {}
    books.forEach(book=>libraries[book.library] = '')
    ctx.response.body = Object.keys(libraries)
    ctx.response.status = 200
})

router.get('/paginated/size=:size&offset=:offset', async (ctx) =>{
    const response = ctx.response;
    const userId = ctx.state.user._id;
    const books = (await bookStore.find({userId}))
        .sort(
            (a, b) => new Date(b.date).getTime()-new Date(a.date).getTime()
    );;
    const size = parseInt(ctx.params.size);
    const offset = parseInt(ctx.params.offset);
    response.body = books.slice(offset*size, offset*size+size)
    response.status = 200;
})

router.get('/paginated/filtered/size=:size&offset=:offset&filter=:filter', async (ctx) =>{
    const response = ctx.response;
    const userId = ctx.state.user._id;
    const filter = ctx.params.filter;
    console.log("filter: ", filter)
    const books = (await bookStore.find({userId}))
        .sort(
            (a, b) => new Date(b.date).getTime()-new Date(a.date).getTime()
        )
        .filter(book => book.library === filter)
    ;
    const size = parseInt(ctx.params.size);
    const offset = parseInt(ctx.params.offset);
    response.body = books.slice(offset*size, offset*size+size)
    response.status = 200;
})


router.get('/:id', async (ctx)=>{
    const userId = ctx.state.user._id;
    const book = await bookStore.findOne({_id: ctx.params.id });
    const response = ctx.response;
    if(book){
        if(book.userId === userId){
            response.body = book;
            response.status = 200;
        } else{
            response.status = 403;
        }
    }else{
        response.status = 404;
    }
});

const createBook = async (ctx, book, response) => {
    try{
        const userId = ctx.state.user._id;
        book.userId = userId;
        response.body = await bookStore.insert(book);
        response.status = 201;
        broadcast(userId, {event: 'created', payload: response.body});
    }catch (err){
        response.body = {message: err.message};
        console.log(err.message)
        response.status = 400;
    }
}

router.post('/', async ctx => await createBook(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
    const book = ctx.request.body;
    const id = ctx.params.id;
    const bookId = book._id;
    const response = ctx.response;
    if(bookId && bookId !== id){
        response.body = {message: 'Param id and body _id should be the same'};
        response.status = 400;
        return;
    }
    if(!bookId){
        await createBook(ctx, book, response);
    }else {
        const userId = ctx.state.user._id;
        book.userId = userId;
        const updateCount = await bookStore.update({_id:id}, book);
        if(updateCount === 1){
            response.body = book;
            response.status = 200;
            broadcast(userId, {event: 'updated', payload: book});
        }else{
            response.body = {message: 'Resource no longer exists'};
            response.status = 405
        }
    }
});

router.del('/:id', async (ctx) =>{
    const userId = ctx.state.user._id;
    const book = await bookStore.findOne({_id:ctx.params.id});
    if(book && userId !== book.userId){
        ctx.response.status = 403;
    }else{
        await bookStore.remove({_id: ctx.params.id});
        ctx.response.status = 204;
        broadcast(userId, {event: 'deleted', payload: book});
    }
})