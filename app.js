var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var redis = require("redis");
var bluebird = require("bluebird");
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', indexRouter);

testCache();
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function testCache() {

  // Connect to the Azure Cache for Redis over the SSL port using the key.
  var cacheConnection = redis.createClient(6380, 'booksearch-ardhi.redis.cache.windows.net', 
      {auth_pass: 'FmCINnaZhN5uh5hdpOyY7HYWAQApNTjK+yucr94trCQ=', tls: {servername: 'booksearch-ardhi.redis.cache.windows.net'}});
      
  // Perform cache operations using the cache connection object...

  // Simple PING command
  console.log("\nCache command: PING");
  console.log("Cache response : " + await cacheConnection.pingAsync());

  // Simple get and put of integral data types into the cache
  console.log("\nCache command: GET Message");
  console.log("Cache response : " + await cacheConnection.getAsync("Message"));    

  console.log("\nCache command: SET Message");
  console.log("Cache response : " + await cacheConnection.setAsync("Message",
      "Hello! The cache is working from Node.js!"));    

  // Demonstrate "SET Message" executed as expected...
  console.log("\nCache command: GET Message");
  console.log("Cache response : " + await cacheConnection.getAsync("Message"));    

  // Get the client list, useful to see if connection list is growing...
  console.log("\nCache command: CLIENT LIST");
  console.log("Cache response : " + await cacheConnection.clientAsync("LIST"));    
}

testCache();

module.exports = app;
