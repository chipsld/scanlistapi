// api/models/user.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id_user : String,
    username: String,
    password: String,
    admin: Boolean,
    langage : String
},
{
	collection : 'user'
},
{
	versionKey: false 
});

module.exports = mongoose.model('User', userSchema);
