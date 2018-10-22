const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const unigueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  username : { type: String, required: true, unigue: true},
  passwordHash: {type: String, required: true}
});

UserSchema.plugin(unigueValidator);

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

UserSchema.virtual('password').set(function(value){
  this.passwordHash = bcrypt.hashSync(value, 12);
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
