exports.init = function(req, res){
  if (req.isAuthenticated() && req.user.username == 'zinh') {
    res.render('register/index');
  }
  else {
    res.render('register/index');
  }
};

exports.register = function(req, res){
	 var workflow = req.app.util.workflow(req,res);

	 workflow.on('validate',function(){

      if(!req.body.username){
        workflow.outcome.errfor.username = 'required';
      }else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
        workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
      }else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if (!req.body.password) {
        workflow.outcome.errfor.password = 'required';
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('duplicateUsernameCheck');

	 });

  workflow.on('duplicateUsernameCheck', function(){
    req.app.db.models.User.findOne({ email:req.body.email.toLowerCase() }, function(err,user){
        if(err){
            return workflow.emit('exception',err);
        }
        if(user){
            workflow.outcome.errfor.email = 'Email already registered';
            return workflow.emit('response');
        }

        workflow.emit('createUser');

    })
  });

  workflow.on('createUser', function(){
      req.app.db.models.User.encryptPassword(req.body.password, function(err, hash){
          if(err){ return workflow.emit('exception',err); }

          var fields = {
              isActive: 'yes',
              username: req.body.username,
              email:req.body.email.toLowerCase(),
              password:hash,
              search:[
                req.body.username,
                req.body.email
              ],
              role: req.body.role || 'user'
          };

          req.app.db.models.User.create(fields, function (err,user){
              if(err){ return workflow.emit('exception',err); }
              workflow.user = user;
              workflow.emit('createMetaUser');
          });
      });

  });

  workflow.on('createMetaUser', function(){

    workflow.emit('sendWelcomeMail');


  });

  workflow.on('sendWelcomeMail',function(){
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
	//res.render(res.render('register/index');
	//res.end();
};