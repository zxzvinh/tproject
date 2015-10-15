exports.init = function(req, res){
	if (req.isAuthenticated()) {
    	res.redirect(req.user.defaultReturnUrl());
  	}
  	else {
    	res.render('forgotpassword/index');
  	}
};

exports.post = function(req,res){

	var  wf = req.app.util.workflow(req,res);

	wf.on('validate', function(){
		if(!req.body.email){
			wf.outcome.errfor.email = 'required';
			return wf.emit('response');
		}

		wf.emit('generateToken');
	});

	wf.on('generateToken', function(){
		var crypto = require('crypto');
		crypto.randomBytes(21,function(err, buf){
			if(err){ return next(err); }

			var token = buf.toString('hex');
			req.app.db.models.User.encryptPassword(token,function(err, hash){
				if(err){ return next(err); }
				wf.emit('updateUser',token,hash);
			});
		});
	});

	wf.on('updateUser',function(token,hash){
		var conditions = {email: req.body.email.toLowerCase()};
		var fieldsToSet = {
			resetPasswordToken: hash,
			resetPasswordExpires: Date.now() + 10000000
		};
		req.app.db.models.User.findOneAndUpdate(conditions, fieldsToSet, function(err,user){
			if(err){ return wf.emit('exception',err);}
			if(!user){ return wf.emit('response'); }
			wf.emit('sendEmail', token, user);
		});
	});

	wf.on('sendEmail',function(token,user){
		wf.outcome.errfor.email = 'okay';
            return wf.emit('response');
	});

	wf.emit('validate');
};