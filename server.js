// @ts-check

const express = require('express')
const cors = require('cors')
const path = require('path');
const { MongoClient, ServerApiVersion, Collection } = require('mongodb');

const util       = require('./modules/util.mjs');
const middleware = require('./modules/middleware.mjs')
const routes     = require('./modules/routes.mjs')

const serverData = util.setup();

const dburi = `mongodb+srv://${serverData.user}:${serverData.pass}@${serverData.host}`;
// create mongoDb client
const dbclient = new MongoClient(dburi);

// middleware and app config
const app = express();
app.use(cors());
app.use(express.json());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/views'))

// serve static files
app.use('/public/js',  express.static('public/js'));
app.use('/public/css', express.static('public/css'));

// route setup 
app.use(middleware.log);

// connect to database server 
/** @type {Collection<Document>} */
let collection;
/** @type {{col?:Collection<Document> | undefined }} */
let options = {};
(async ()=>{
    console.log("connecting to database")
    await dbclient.connect();
    console.log("done connecting to database")
    collection = await dbclient.db("dataset").collection("test")
    options.col = collection
})();

// more middleware
app.use(middleware.checkCollection(options))

app.get('/', routes.index);

app.get('/data', routes.docs(options))
app.post('/add', routes.add(options))
app.post('/remove', routes.remove(options))
app.post('/update', routes.update(options))

// server listen
app.listen(serverData.port, () => {
    console.log(`server listening at http://localhost:${serverData.port}`);
})