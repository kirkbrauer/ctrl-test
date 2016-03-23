function init() {
  LastX = 0;
  LastY = 0;
  var body = document.getElementById('body');
  w = document.getElementById('html').clientWidth;
  h = document.getElementById('html').clientHeight;
  socket = io(window.location.href);
  socket.on('connect', function(){
    console.log("Connected");
    socket.emit('get_id');
    socket.on('id', function(data) {
      console.log(data.id);
      socket_id = data.id;
      socket.emit('set_ratio', {id: data.id, width: w, height: h});
    });
  });

  var Touch = new Hammer.Manager(body);

  var Pan = new Hammer.Pan();
  var Tap = new Hammer.Tap({
  taps: 1
  });
  var DoubleTap = new Hammer.Tap({
  event: 'doubletap',
  taps: 2
  });

  Touch.add(Pan);
  Touch.add(DoubleTap);
  Touch.add(Tap);

  var endpoint  = {x: 0, y: 0};

  Pressure.set('#body', {
    startDeepPress: function(event) {
      socket.emit('right_click');
    },
    endDeepPress: function(event) {
      socket.emit('end_right_click');
    }
  });

  Touch.on('panstart', function(e) {
    socket.emit('begin_move', {id: socket_id, x: e.center.x, y: e.center.y});
  });

  Touch.on('panend', function(e) {
    socket.emit('save_pos', {id: socket_id, x: e.center.x, y: e.center.y});
  });

  Touch.on('panmove', function(e) {
    x  = e.center.x - endpoint.x;
    y  = e.center.y - endpoint.y;
    console.log(e.center.x + " " + e.center.y);
    socket.emit('update_cursor', {id: socket_id, x: e.center.x, y: e.center.y});
  });

  Touch.on('tap', function(e) {
    socket.emit('click');
  });

}
