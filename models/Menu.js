exports = module.exports = function(app,mongoose){
	var menuSchema = new mongoose.Schema({
		monID:{type:Number,autoIncrement:true},
		mon:{type : String, unique: true },
		phan_loai:{type:String, default:"Drinks"},
		gia:Number,
		nhap:{type:Number,default:null},
		isActive:{type:String, default:"active"},
		created: { type: Date, default: Date.now },
		modified: { type: Date, default: Date.now }
	});
	menuSchema.plugin(app.autoNumber.plugin,'Menu');
	menuSchema.index({ mon:1 },{unique:true});
	menuSchema.index({ gia:1 });
	app.db.model('Menu',menuSchema);
};
