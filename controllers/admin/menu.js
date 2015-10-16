exports.init = function(req,res){
  res.render('admin/menu',{user:req.user});
};

exports.post = function(req,res){

	if(!req.body.action){
		console.log('No action');
	}else{
		var action = ['create','edit'];
		if(action.indexOf(req.body.action) != -1){
			processMenu(req,res);
		}else if(req.body.action == 'remove'){
			require('async').waterfall([
				function(next){
					var fields = parseData(req,res);
					next(null,fields);
				},
				function(fields,next){
					req.app.db.models.Menu.remove({monID:fields.id},function(err){
						//if(err){ next(null,{'data':[]}); }
						next(null,{'data':[]});
					})
				}
				],function(err,results){
					res.send(results);
				}
			);
		}
	}
	return ;

 // console.log(req.app.print.inspect(req.body, { showHidden: true, depth: null }));

};

exports.list = function(req, res){

  req.app.db.models.Menu.find({},function(err,menus){
	var menusMap = [];
	for(var i in menus){
		menusMap.push({
			'DT_RowId' : "row_"+menus[i].monID,
			'mon' : menus[i].mon,
			'phan_loai' : menus[i].phan_loai,
			'gia' : menus[i].gia,
			'nhap' : menus[i].nhap,
		});

	}
	res.send({ "data" : menusMap, "options": [], "files": [] });
  });

};

var parseData = function(req,res){
	var data = {};
	for (var key in req.body) {
		if(key != 'action' && key != '[]'){
			var id  = key.replace( /\D+/g, '');
		}
		if(key.indexOf('mon') != -1){
			data['mon'] = req.body[key];

		}
		if(key.indexOf('phan_loai') != -1){
			data['phan_loai'] = req.body[key];
		}
		if(key.indexOf('gia') != -1){
			data['gia'] = req.body[key];
		}
		if(key.indexOf('nhap') != -1) {
			data['nhap'] = req.body[key] == '' ? 0 : req.body[key];
		}
	}
	var fields = {'data':data,'id':id};
	return fields;
}

var validate = function(data){
	var validator = require('validator');
	var errors = [];
	var isNumber   = ['gia','nhap'];
	for (var i in data){
		if(data[i] == '') {
			errors.push({ 'name': i , 'status':'This field is required'});
		}else{
			if(isNumber.indexOf(i) != -1){
				if(!validator.isNumeric(data[i])){
					errors.push({ 'name':i , 'status':'This field is number'});
				}
			}
		}
	}

	if(errors.length > 0){
		return {'fieldErrors':errors,'data':[]};
	}else{
		return false;
	}
}

var processMenu = function(req,res){
	require('async').waterfall([
		// parse data
		function(next){
			var fields = parseData(req,res);
			next(null,fields);
		},
		// validate data
		function(fields,next){
			var errors = validate(fields.data);
			if(!errors){
				next(null,fields);
			}else{
				next(true,errors);
			}
		},
		// check unique mon
		function(fields,next){
			var errors = [];
			req.app.db.models.Menu.findOne({'mon':fields.data.mon},'mon',function(err,mon){
				if(err){
					errors.push({ 'name':'mon', 'status':'There is some thing errors, please try again'});
					next(true,errors);
				}
				if(mon){
					errors.push({ 'name':'mon', 'status':'There is '+fields.data.mon+' in your db.'});
					next(true,{'fieldErrors':errors,'data':[]});
				}
				next(null,fields);
			})
		},
		// save db
		function(fields,next){
			// cehck action
			var errors = [];
			if(req.body.action == 'create'){
				req.app.db.models.Menu.create(fields.data,function(err,menu){
					if(err){
						errors.push({ 'name':'mon', 'status':'There some thing errors, please try again'});
						next(true,errors);
					}
					fields.data = menu;
					next(null, fields);
				});
			}else if(req.body.action == 'edit'){
				req.app.db.models.Menu.findOneAndUpdate(
					{ monID : fields.id },
					{ $set: fields.data } ,
					{ new : true },
					function(err,menu){
						if(err){
							errors.push({ 'name':'mon', 'status':'There some thing errors, please try again'});
							next(true,errors);
						}
						fields.data = menu;
						next(null,fields);
					}
				);
			}

		},
		// extract data for response
		function(fields,next){
			var results = extractResult(fields.data);
			next(null,results);
		},
	],function(err,results){
		return res.send(results);
	});
}

var extractResult = function(data){
	var arr = {};
	arr["DT_RowId"] = "row_"+data.monID;
	arr["mon"] = data.mon;
	arr["phan_loai"] = data.phan_loai;
	arr["gia"] = data.gia;;
	arr["nhap"] = data.nhap;
	var responseData = {"data":[ arr ]};
	return responseData;
}