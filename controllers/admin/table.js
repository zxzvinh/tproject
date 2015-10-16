exports.init = function(req,res){
  res.render('admin/table',{user:req.user});
};
