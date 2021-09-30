const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  await next();
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = { issue: [{ error: err.message || 'Unexpected error' }] };
    ctx.response.status = 500;
  }
});

class Book {
  constructor({ id, title, date, library}) {
    this.id = id;
    this.title = title;
    this.date = date
    this.library = library
  }
}

const books = [];
for (let i = 0; i < 3; i++) {
  books.push(new Book({
    id: `${i}`,
    title: `book ${i}`,
    date: new Date(Date.now() + i),
    library: `library ${i}` }));
}
let lastUpdated = books[books.length - 1].date;
let lastId = books[books.length - 1].id;
const pageSize = 5;

const broadcast = data =>
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

const router = new Router();

router.get('/book', ctx => {
  const ifModifiedSince = ctx.request.get('If-Modified-Since');
  if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
    ctx.response.status = 304; // NOT MODIFIED
    return;
  }
  const text = ctx.request.query.text;
  const page = parseInt(ctx.request.query.page) || 1;
  ctx.response.set('Last-Modified', lastUpdated.toUTCString());
  const sortedItems = books
    .filter(book => text ? book.text.indexOf(text) !== -1 : true)
    .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
  const offset = (page - 1) * pageSize;
  // ctx.response.body = {
  //   page,
  //   books: sortedItems.slice(offset, offset + pageSize),
  //   more: offset + pageSize < sortedItems.length
  // };
  ctx.response.body = books;
  ctx.response.status = 200;
});

router.get('/book/:id', async (ctx) => {
  const bookId = ctx.request.params.id;
  const book = books.find(item => bookId === item.id);
  if (book) {
    ctx.response.body = book;
    ctx.response.status = 200; // ok
  } else {
    ctx.response.body = { issue: [{ warning: `book with id ${bookId} not found` }] };
    ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
  }
});

const createBook = async (ctx) => {
  const book = ctx.request.body;
  if (!book.title) { // validation
    ctx.response.body = { issue: [{ error: 'Title is missing' }] };
    ctx.response.status = 400; //  BAD REQUEST
    return;
  }
  book.id = `${parseInt(lastId) + 1}`;
  lastId = book.id;
  book.date = new Date();
  book.version = 1;
  books.push(book);
  ctx.response.body = book;
  ctx.response.status = 201; // CREATED
  broadcast({ event: 'created', payload: { book: book } });
};

router.post('/book', async (ctx) => {
  await createBook(ctx);
});

router.put('/book/:id', async (ctx) => {
  const id = ctx.params.id;
  const book = ctx.request.body;
  book.date = new Date();
  const bookId = book.id;
  if (bookId && id !== book.id) {
    ctx.response.body = { issue: [{ error: `Param id and body id should be the same` }] };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  if (!bookId) {
    await createBook(ctx);
    return;
  }
  const index = books.findIndex(book => book.id === id);
  if (index === -1) {
    ctx.response.body = { issue: [{ error: `book with id ${id} not found` }] };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  // const bookVersion = parseInt(ctx.request.get('ETag')) || book.version;
  // if (bookVersion < books[index].version) {
  //   ctx.response.body = { issue: [{ error: `Version conflict` }] };
  //   ctx.response.status = 409; // CONFLICT
  //   return;
  // }
  // book.version++;
  books[index] = book;
  lastUpdated = new Date();
  ctx.response.body = book;
  ctx.response.status = 200; // OK
  broadcast({ event: 'updated', payload: { book: book } });
});

router.del('/book/:id', ctx => {
  const id = ctx.params.id;
  const index = books.findIndex(book => id === book.id);
  if (index !== -1) {
    const book = books[index];
    books.splice(index, 1);
    lastUpdated = new Date();
    broadcast({ event: 'deleted', payload: { book: book } });
  }
  ctx.response.status = 204; // no content
});

setInterval(() => {
  lastUpdated = new Date();
  lastId = `${parseInt(lastId) + 1}`;
  const book = new Book({ id: lastId, title: `book ${lastId}`, date: lastUpdated, library: `library ${lastId}` });
  books.push(book);
  console.log(`test: ${book.title}`);
  broadcast({ event: 'created', payload: { book } });
}, 120000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);