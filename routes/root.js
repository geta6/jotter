
/*
 * GET home page.
 */

module.exports.index = function root_index(req, res){
  var db = module.parent.exports.set('db');
  db.serialize(function () {
    db.all('SELECT * FROM jots ORDER BY pinn DESC, date DESC', function (e, rows) {
      res.prender('block', {
        items: rows
      });
    });
  });
};
