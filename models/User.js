exports = module.exports = function(app, mongoose) {
  var userSchema = new mongoose.Schema({
    userID: {type:Number, autoIncrement:true},
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true },
    role: String,
    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twitter: {},
    github: {},
    facebook: {},
    google: {},
    tumblr: {},
    search: [String]
  });
  userSchema.plugin(app.autoNumber.plugin,'User');
  userSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.role == 'admin') {
      returnUrl = '/admin/';
    }

    // if (this.canPlayRoleOf('admin')) {
    //   returnUrl = '/admin/';
    // }

    return returnUrl;
  };
  userSchema.statics.encryptPassword = function(password, done) {
    var bcrypt = require('bcrypt');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return done(err);
      }

      bcrypt.hash(password, salt, function(err, hash) {
        done(err, hash);
      });
    });
  };
  userSchema.statics.validatePassword = function(password, hash, done) {
    var bcrypt = require('bcrypt');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };
  userSchema.plugin(require('./plugins/pagedFind'));
  userSchema.index({ username: 1 }, { unique: true });
  userSchema.index({ email: 1 }, { unique: true });
  userSchema.index({ timeCreated: 1 });
  userSchema.index({ 'twitter.id': 1 });
  userSchema.index({ 'github.id': 1 });
  userSchema.index({ 'facebook.id': 1 });
  userSchema.index({ 'google.id': 1 });
  userSchema.index({ search: 1 });
  userSchema.set('autoIndex', (app.get('env') === 'development'));  
  app.db.model('User', userSchema);
};
