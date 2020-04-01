const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: true , useUnifiedTopology: true }));
app.use(bodyParser.json());


mongoose.connect('mongodb://heroku_v4x7p4lz:1314bunbbq90pdver9ptituji4@ds263295.mlab.com:63295/heroku_v4x7p4lz\n',{keepAlive: true, useNewUrlParser: true }).then(
	() => { console.log("Connexion en cours...")},
	() => { console.log(connected)});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 

const Manga = require('./models/manga.js');
const User = require('./models/user.js');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let port = process.env.PORT || 8081;
let router = express.Router();


router.use(function(req, res, next) {
    next();
});

// all of our routes will be prefixed with /scanlist
app.use('/scanlist', router);
app.listen(port);


// test route (accessed at GET http://localhost:8081/api)
router.get('/', function(req, res) {
    res.json({ message: 'Accueil API scanlibrary' });
});


// GET ALL MANGAS IN THE DATABASE 

router.get('/manga', function(req,res) {

	Manga.find().sort('name')
	.exec()
	.then(docs => {
		res.status(200).json(docs);
	})
	.catch(err => {
		// console.log(err);
		res.status(500).json({
			error: err
		})
	})
});

// GET COLLECTION OF A USER 

router.post('/collection', function(req,res) {

	let userid = req.body.userid;
	let query = Manga.where({'inCollection' : { $elemMatch : { id_user : userid }}});
	query.find().sort('name')
	.exec()
	.then(docs => {
		res.status(200).json(docs);
		// console.log(docs);
	})
	.catch(err => {
		res.status(500).json({
			error: err
		})
	})
});



router.post('/userCollection', function(req,res) {

	let userid = req.body.userid;
	let mangaid = req.body.mangaid;
	
	var collection = { id_user: userid, read: 0 };

	let query = Manga.findOneAndUpdate({ _id : mangaid },{ $push: { inCollection : collection}});
	query
	.exec()
	.then(docs => {
		res.status(200).json(docs);
		console.log(docs);
	})
	.catch(err => {
		res.status(500).json({
			error: err
		});
		console.log(err);
	})
});




// POST A MANGA IN THE DATABASE

router.post('/manga', function(req, res, next){

	const manga = new Manga({
		_id: new mongoose.Types.ObjectId(),
		id_manga: req.body.id_manga,
	    name: req.body.name,
	    cover: req.body.cover,
		link: req.body.link,
		inCollection : [],
		tag: req.body.tag
	});

	manga
	.save()
	.then(result => {
		console.log("Creation reussie");
	})
	.catch(err => console.log(err));


});

// GET A USER 

router.post('/user',function(req,res) {

	let user = req.body.username;
	let pwd = req.body.password;

	let query = User.where({username: user},{password: pwd});

	query.findOne()
	.exec()
	.then(docs => {
		res.status(200).json(docs);
	})
	.catch(err => console.log(err));
})

// GET A USERID

router.post('/userid',function(req,res)
{
	let user = req.body._id;

	User.find({_id:user})
	.exec()
	.then(docs => {
		res.status(200).json(docs);
	})
	.catch(err => console.log(err));
})



/**
 * Création d'un manga dans la base de données.
 * @param {model} Manga - Se référer au model manga
 */

router.post('/manga', function(req, res, next){

	const manga = new Manga({
		_id: new mongoose.Types.ObjectId(),
		id_manga: req.body.id_manga,
	    name: req.body.name,
	    nbchap: req.body.nbchap,
	    cover: req.body.cover,
	    read: req.body.read,
	    link: req.body.link
	});

	manga
	.save()
	.then(result => {
		console.log("Creation reussie");
	})
	.catch(err => console.log(err));

});





/**
 * Diminue le nombre de chapitre lu pour un manga dans 
 * la collection d'un utilisateur.
 * @param {number} userid - Numéro de l'utilisateur
 * @param {number} mangaid - Numéro du manga
 */

router.post('/add' , function (req,res) {

	let userid = req.body.userid;
	let mangaid = req.body.mangaid;

	Manga.findOneAndUpdate({ _id : mangaid , 'inCollection' : { $elemMatch : { id_user : userid }}},
									   { $inc : { "inCollection.$.read" : 1}}, {new : true}, (err, newread) => {
										if (err) return res.status(500).send(err);
										res.send(newread);
									});



});

/**
 * Augmente le nombre de chapitre lu pour un manga dans 
 * la collection d'un utilisateur.
 * @param {number} userid - Numéro de l'utilisateur
 * @param {number} mangaid - Numéro du manga
 */

router.post('/remove' , function (req,res) {

	let userid = req.body.userid;
	let mangaid = req.body.mangaid;

	Manga.findOneAndUpdate({ _id : mangaid , 'inCollection' : { $elemMatch : { id_user : userid }}},
						   { $inc : { "inCollection.$.read" : -1}}, {new : true}, (err, newread) => {
								if (err) return res.status(500).send(err);
								res.send(newread);
							});
});

/**
 * Modification d'un profil utilisateur.
 * @param {number} userid - Numéro de l'utilisateur
 */

router.post('/profil', function(req,res) {

	let userid = req.body.userid;
	let query = User.where({ _id: userid });

	query.update({ langage : req.body.langage , username : req.body.username , password : req.body.password })
	.exec()
	.then(docs => {
		res.status(200).json(docs);
	})
	.catch(err => console.log(err));
});

/**
 * Récupération d'un profil utilisateur.
  * @param {number} userid - Numéro de l'utilisateur connecté
 */

router.get('/profil', function(req,res) {
	
	let userid = req.body.userid;
	let query = User.where({ _id: userid });

	query.findOne()
	.exec()
	.then(docs => {
		res.status(200).json(docs);
	})
	.catch(err => console.log(err));

});



