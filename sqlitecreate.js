var sqlite = require('sqlite3').verbose()
  , db = new sqlite.Database(__dirname + '/db/jotter');

db.serialize(function () {
  db.run('CREATE TABLE jots (id  INTEGER  PRIMARY KEY  AUTOINCREMENT, head TEXT, body TEXT, addr TEXT, view INTEGER, owns TEXT, type TEXT, date datetime, pinn INTEGER DEFAULT 1, CONSTRAINT ct_pinn CHECK (pinn IN (0, 1)))');
  db.run('CREATE INDEX owns ON jots(owns)');
  db.run('CREATE INDEX type ON jots(type)');
  db.run('CREATE INDEX pinn ON jots(pinn)');
  /*
  var stm = db.prepare('INSERT INTO team VALUES (?)');
  for (var i=0; i<10; i++)
    stm.run('Team Number '+i);
  stm.finalize();

  var stm = db.prepare("UPDATE team SET info = ? WHERE info = ?");
  for (var i = 0; i < 10; i+=3)
    stm.run("team 10" + i, "team " + i);
  stm.finalize();

  db.each('SELECT rowid AS id, info FROM team', function (e, row) {
    console.log(row.id + " : " + row.info);
  });
  */
});

db.close();
