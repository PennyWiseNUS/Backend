// import required packages
const express = require('express'); // web framework to build APIs
const cors = require('cors'); // cross-origin sharing, for frontend to interact with backend
const mongoose = require('mongoose'); // node.js to connect to MongoDB using models
require('dotenv').config(); // loads env var from .env to process.env

// setting up of the Express app and choosing the port number
const app = express(); // main express application
const port = process.env.PORT || 5000; // comes from .env

// adding middleware -- a function that runs between receiving a request and sending a response
app.use(cors()); // for cross-origin requests
app.use(express.json()); // for parsing json into request bodies

/*
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");
*/

// connecting to MongoDB using Mongoose
// mongoDB connection string
const uri = process.env.MONGO_URI;
// connection to the database
mongoose.connect(uri)
    // log upon successful connection
    .then(() => console.log('MongoDB connected')) // cfms the app is connected and working
    .catch(err => console.log(err)); // helps with debugging connection issues

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// routing system -- handling routes
// .use() is ususally used for handling all HTTP methods for a specific route/ set of
// used here to mount a specific route handler
// any path starting with '/api/auth' will be handled by "/routes/auth.js"
// auth.js file contains the logic for handling the specific routes
// require executes the auth.js code and attach its routes to the /api/auth path
app.use('/api/auth', require('./routes/auth'));

// AddEntry route
const authToken = require('./middleware/authToken');
// first arg: base url path midware and route handlers will apply to
// second arg: handles user verification - whether access is available
// third arg: adding a new Entry logic or getting an entry 
app.use('/api/entries', authToken, require('./routes/entries'))
// additional route for loan entries
app.use('/api/loanEntries', authToken, require('./routes/loanEntries'))

// Income Extraction route
app.use('/api/income', authToken, require('./routes/income'));

// Expense Extraction route
app.use('/api/expense', authToken, require('./routes/expense'));

// Notification route
app.use('/api/notifications', authToken, require('./routes/notification'));

// Start cron jobs
require('./cronJobs');

mongoose.set('debug', true);

// basic route -- for GET requests (retrieving data)
// serves as a health check / simple test route to confirm server is up and running
app.get('/', (req, res) => {
  res.send('Auth API is running'); // sends the string as a response to the client
});

// starting the server
// tells the app to listen for req on the chosen port
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`); // log a message once server is live
});