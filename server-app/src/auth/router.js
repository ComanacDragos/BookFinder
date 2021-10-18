import Router from 'koa-router';
import userStore from './store';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../utils';

export const router = new Router();

const createToken = (user) =>{
    return jwt.sign(
        {
            username: user.username,
            _id: user._id
        },
        jwtConfig.secret,
        { expiresIn: 60 * 60 * 60 * 24 }
    )
}

const createUser = async (user, response) => {
    try{
        if(!user.username || user.username === ''){
            response.body = { issue: [{ error: "Username must not be empty" }] };
            response.status = 500;
            return
        }
        if(!user.password || user.password === ''){
            response.body = { issue: [{ error: "Password must not be empty" }] };
            response.status = 500;
            return
        }
        if(await userStore.findOne({username: user.username})){
            response.body = { issue: [{ error: "Username already exists" }] };
            response.status = 500;
            return
        }
        delete user.confirmPassword;
        await userStore.insert(user);

        response.body = {token: createToken(await userStore.findOne({username: user.username}))};
        response.status = 201;
    }catch (err){
        response.body = { issue: [{ error: err.message }] };
        response.status = 400;
    }
}

router.post('/signup', async (ctx) => {
    const userData = ctx.request.body;
    if(userData.password !== userData.confirmPassword){
        ctx.response.body = { issue: [{ error: "Password and confirm password must be the same" }] };
        ctx.response.status = 500;
        return
    }
    await createUser(ctx.request.body, ctx.response)
});

router.post('/login', async (ctx) => {
    const credentials = ctx.request.body;
    const response = ctx.response;
    const user = await userStore.findOne({username: credentials.username});
    if(user && credentials.password === user.password){
        response.body = {token: createToken(user)};
        response.status = 201;
    } else {
        response.body = {issue: [{error: 'Invalid credentials'}]};
        response.status = 500;
    }
});
