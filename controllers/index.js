var getReturnUrl = function(req) {
  var returnUrl = req.user.defaultReturnUrl();
  if (req.session.returnUrl) {
    returnUrl = req.session.returnUrl;
    delete req.session.returnUrl;
  }
  return returnUrl;
};
exports.init = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect('/admin/menu');
  }
  else {
    res.render('login/index');
  }
};
