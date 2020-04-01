// api/models/manga.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mangaSchema = new Schema({
	_id: mongoose.Schema.Types.ObjectId,
    id_manga: Number,
    name: String,
    cover: String,
    link: String,
    inCollection : Array,
    tag: Number
},
{
	collection : 'manga'
},
{
	versionKey: false 
});

module.exports = mongoose.model('Manga', mangaSchema);
