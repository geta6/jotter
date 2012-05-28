
/*
 * GET pins list.
 */

module.exports.index = function pin_index(req, res){
  var db = module.parent.exports.set('db');
  db.serialize(function () {
    db.all('SELECT * FROM jots WHERE pinn = "1" ORDER BY pinn DESC, date DESC', function (e, rows) {
      console.log(e);
      res.prender('block', {
        items: rows
      });
    });
  });
};
