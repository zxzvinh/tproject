exports.init = function(req,res){
  res.render('admin/menu',{user:req.user});
};

exports.post = function(req,res){

	if(!req.body.action){
		console.log('end');
		return;
	}

	if(req.body.action == 'create'){
		createMenu(req,res);
	}



 // console.log(req.app.print.inspect(req.body, { showHidden: true, depth: null }));

};

exports.list = function(req, res){

  req.app.db.models.Menu.find({},function(err,menus){
	var menusMap = { "data" : [], "options": [], "files": [] };
	for(var i in menus){
		menusMap["data"][i] = menus[i];
	}

	res.send(menusMap);
  });

};


var createMenu = function(req,res){

	var workflow = req.app.util.workflow(req,res);
	var validator = require('validator');
	var errors = [];

	workflow.on('validate', function(){

		if(!req.body['data[0][mon]']){
			errors.push({ 'name':'mon', 'status':'This field is required'});
		}
		if(!req.body['data[0][phan_loai]']){
			errors.push({ 'name':'phan_loai', 'status':'This field is required'});
		}
		if(!req.body['data[0][gia]'] ){
			errors.push({ 'name':'gia', 'status':'This field is required'});
		}else{
			if(!validator.isNumeric(req.body['data[0][gia]'])){
				errors.push({ 'name':'gia', 'status':'This field is number'});
			}
		}

		if(errors.length > 0){
			return res.send({'fieldErrors':errors,'data':[]});
		}

	    workflow.emit('createUser');

	});

	workflow.on('createUser',function(){

		var fields = {
			mon : validator.escape(req.body['data[0][mon]']),
			phan_loai : validator.escape(req.body['data[0][phan_loai]']),
			gia : validator.escape(req.body['data[0][gia]']),
			gia_nhap : validator.escape(req.body['data[0][gia_nhap]'])
		};

		require('async').waterfall([
			function(next){
				req.app.db.models.Menu.findOne({'mon':fields.mon},'mon',function(err,mon){
					if(err){ errors.push({ 'name':'mon', 'status':'There some thing errors, please try again'}); }
					if(mon){
						errors.push({ 'name':'mon', 'status':'There is '+fields.mon+' in your db.'});
						next(true,{'fieldErrors':errors,'data':[]});
					}
					next(null);
				})
			},
			function(next){
				req.app.db.models.Menu.create(fields,function(err,menu){
					if(err){ errors.push({ 'name':'mon', 'status':'There some thing errors, please try again'}); }
					next(null, menu);
				});
			},
			function(menu,next){
				var arr = {};
				arr['DT_RowId'] = 'row_'+menu.monID;
				arr['mon'] = menu.mon;
				arr['phan_loai'] = menu.phan_loai;
				arr['gia'] = menu.gia;;
				arr['gia_nhap'] = menu.gia_nhap;
				var responseData = {'data':[ arr ]};
			 	next(null,responseData);
			}
		],function(err,results){
			//if(err){ res.send(err);}
			return res.send(results);
		});

	});

	workflow.emit('validate');

};