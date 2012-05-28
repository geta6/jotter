/*
 * POST create one jot from data.
 */

module.exports.index = function jots_index(req, res){
  console.log(req.body);
  res.render('block', { items: req.body, layout: false});
};
