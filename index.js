// modules =================================================
var express        = require('express');
var app            = express();
var server         = require('http').createServer(app);
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var robot          = require('robotjs');
var io             = require('socket.io')(server);

console.log(robot.getScreenSize());
var ScreenWidth = robot.getScreenSize().width;
var ScreenHeight = robot.getScreenSize().height;

// set our port
var port = process.env.PORT || 8080;

// connect to our mongoDB database
// mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use('/public', express.static(__dirname + '/public'));

//Send frontend users to the index page
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load our public/index.html file
});

var connections = {};

//Socket.io
io.on('connection', function(socket) {
  console.log('Client connected...');
  console.log(socket.id);
  socket.on('get_id', function () {
    socket.emit('id', {id: socket.id});
  });
  socket.on('set_ratio', function (data) {
    console.log({ width: data.width, height: data.height});
    connections[data.id] = {};
    connections[data.id].xRatio = ScreenWidth / data.width;
    connections[data.id].yRatio = ScreenHeight / data.height;
    console.log("Ratios: "+connections[data.id].xRatio+", "+connections[data.id].yRatio);
    socket.emit('ratio_set');
  });
  socket.on('update_cursor', function(data) {
    robot.moveMouse(data.x * connections[data.id].xRatio, data.y * connections[data.id].yRatio);
    console.log(data.x * connections[data.id].xRatio + ', ' + data.y * connections[data.id].yRatio);
  });
  socket.on('click', function(data) {
    robot.mouseClick();
  });
  socket.on('right_click', function(data) {
    robot.mouseToggle('down', 'right');
  });
  socket.on('end_right_click', function(data) {
    robot.mouseToggle('up', 'right');
  });
});

// start app ===============================================
server.listen(port);

// shoutout to the user
console.log('Listening on ' + port);

// expose app
exports = module.exports = app;
