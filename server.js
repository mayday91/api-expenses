// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// require route files
const noteRoutes = require('./app/routes/note_routes')
const expenseRoutes = require('./app/routes/expense_routes')
const userRoutes = require('./app/routes/user_routes')

// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 3001
const clientDevPort = 3000

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
	useNewUrlParser: true,
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN ||`http://localhost:${clientDevPort}` || `http://127.0.0.1:${clientDevPort}` ||"https://pecunia.netlify.app/" ,
	})
)

// define port for API to run on
// adding PORT= to your env file will be necessary for deployment
const port = process.env.PORT || serverDevPort || 5000

// for Heroku deployment
// if (process.env.PORT === 'production' || process.env.PORT ===' staging') {
// 	app.use(express.static('client/build'));
// 	app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname + '/client/build/index.html'));
// 	});
// }

// const path = require("path");



// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', req.headers.origin);
// 	res.header('Access-Control-Allow-Credentials', true);
// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
// 	next();
// });

////////// CORS ACCESS //////////////////////
/////////////////////////////////////////////////
// app.all('*', function (req, res, next) {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
// 	res.header('Access-Control-Allow-Headers', 'Content-Type');
// 	next();
// });
////////////////////////////////////////////////

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(expenseRoutes)
app.use(noteRoutes)
app.use(userRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)


app.listen(port, () => {
	console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
