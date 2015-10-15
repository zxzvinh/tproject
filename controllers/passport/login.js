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
    res.redirect('/');
  }
  else {
    res.render('login/index', {
      oauthMessage: '',
      oauthTwitter: !!req.app.config.oauth.twitter.key,
      oauthGitHub: !!req.app.config.oauth.github.key,
      oauthFacebook: !!req.app.config.oauth.facebook.key,
      oauthGoogle: !!req.app.config.oauth.google.key,
      oauthTumblr: !!req.app.config.oauth.tumblr.key
    });
  }
};

exports.login = function(req,res){
  var workflow = req.app.util.workflow(req,res);

  workflow.on('validate',function(){
      if(!req.body.username){
        workflow.outcome.errfor.username = 'required';
      }

      if(!req.body.password){
        workflow.outcome.errfor.password = 'required';
      }

      if(workflow.hasErrors()){
        return workflow.emit('response');
      }

      workflow.emit('loginUser');

  });

   workflow.on('loginUser',function(){
    req._passport.instance.authenticate('local', function(err, user, info){

        if(err){ return workflow.emit('exception', err); }

        if(!user){
          workflow.outcome.errors.push('Login failed. PLease try again');
          return workflow.emit('response');
        }else{
          req.login(user, function(err){
              if(err){ return workflow.emit('exception', err); }
              workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
              workflow.emit('response');
          });
        }

    })(req,res);

  });

  workflow.emit('validate');
};