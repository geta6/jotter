
/**
 * Module dependencies.
 */

var express = require('express')
  , app = module.exports = express.createServer()
  , sqlite3 = require('sqlite3').verbose()
  , db = new sqlite3.Database(__dirname + '/db/jotter')
  , io = require('socket.io').listen(app)
  , fs = require('fs');

// Module

var prender = function (req, res, next) {
  req.pjax = req.header('X-PJAX') ? true : false;
  res.prender = function (view, opts, fn) {
    if (req.pjax) {
      opts ?  opts.layout = false : opts = {layout:false};
    }
    res.render(view, opts, fn);
  };
  next();
};

with (express) {
  HTTPServer.prototype.routemap = HTTPSServer.prototype.routemap = function(map, dir) {
    var app = this;
    Object.keys(map).forEach(function (key) {
      var val = map[key];
      var _key = key.split(/\s+/);
      var _val = val.split(/:/);
      var type = _key[0].toLowerCase();
      var path = _key[1];
      var file = _val[0];
      var func = _val[1];
      var bind = require(dir + '/' + file);
      app[type](path, bind[func]);
    });
  };
}

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('db', db);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(prender);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.routemap({
  'GET  /'     : 'root:index',
  'POST /jots' : 'jots:index'
}, __dirname + '/routes');

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Socket

io.sockets.on('connection', function (socket) {

  socket.on('create', function (data) {
    db.serialize(function () {
      var stm = db.prepare('INSERT INTO jots (head,body,addr,view,owns,type,date,pinn) VALUES (?,?,?,?,?,?,?,?)');
      stm.run([ data.head, data.text, data.addr, 1, data.from, data.type, data.date, 1 ]);
      stm.finalize();

      db.all('SELECT * FROM jots WHERE owns = ? AND date = ? AND head = ?', [ data.from, data.date, data.head ], function (e, r) {
        io.sockets.emit('create', r[0]);
      });
    });
  });

  socket.on('unpin', function (id) {
    var stm = db.prepare('UPDATE jots SET pinn = "0" WHERE id = ?');
    stm.run([ id ]);
    stm.finalize();
    io.sockets.emit('unpin', id);
  });

  socket.on('remove', function (id) {
    var stm = db.prepare('DELETE FROM jots WHERE id = ?');
    stm.run([ id ]);
    stm.finalize();
    io.sockets.emit('remove', id);
  });

});
