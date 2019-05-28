const path= require('path');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const express=require('express');
const cors=require('cors');
const session=require('express-session');
const mysql=require('mysql');
const app=express();
const fs=require('fs');
const Cart=require('./public/data/cart');
const Car=require('./public/data/car');
const products=JSON.parse(fs.readFileSync('./public/data/products.json','utf8'));
const vehicules=JSON.parse(fs.readFileSync('./public/data/vehicules.json','utf8'));
const PORT=1994;




app.set('view engine','hbs');
app.set('views','./views');
app.set('views',path.join(__dirname,'views'));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use('/public',express.static(__dirname + '/public'));


app.use(session({
secret:'secret',
resave:true,
saveUninitialized: true
}));

//creation d'une connexion de base de donnée
const db=mysql.createConnection({
	host:"localhost",
	database:"garage",
	user:"root",
	password:"root",
	socketPath:"/Applications/MAMP/tmp/mysql/mysql.sock"

})
//connexion de la base de donnée
db.connect((err)=>{
	if (err){
		console.log(err.message);
	}
	else
	{
		console.log('vous êtes bien connecté à la base de bonnée :)');
	}

})

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

//creation des routes des pages 

app.get('/',(req,res)=>{
	res.status(200).render('index')
});
app.get('/acceuil',(req,res)=>{
	res.status(200).render('acceuil')
});
app.get('/admin',(req,res)=>{
	res.status(200).render('admin')
});

app.get('/adminconnexion',(req,res)=>{
	res.status(200).render('adminconnexion')
});
app.get('/connexion',(req,res)=>{
	res.status(200).render('connexion')
});
app.get('/inscription',(req,res)=>{
	res.status(200).render('inscription')
});

app.get('/rendezvous',(req,res)=>{
	res.status(200).render('rendezvous')
});
app.get('/realisation',(req,res)=>{
	res.status(200).render('realisation')
});
app.get('/realisation1',(req,res)=>{
res.status(200).render('realisation1')
});


//insciption user
app.post('/user',(req,res)=>{

	let data = {nom_user: req.body.nom,prenom_user: req.body.prenom,contact_user: req.body.contact, email_user: req.body.email, password_user:req.body.password};
	let sql = "INSERT INTO user SET ?";
	let query=db.query(sql,data,(err,results)=>{
		if(err)throw err;
		if (true) {
			console.log('vous avez bien ete enregister !!!');
		}
		res.redirect('/connexion');
	});
});

//login user
app.post('/login', (req, res)=>{
	var email= req.body.email;
	var password = req.body.password;
	db.query('SELECT * FROM user WHERE email_user = ?',[email],  (error, results, fields)=> {
	if (error) {
	  res.send({"code":400,"failed":"error ocurred"})
	}else{
			if(results.length >0){
					if(results[0].password_user == password){
						res.redirect('/acceuil')
					}else{
					console.log("l'email ou le mot de passe est n'existe pas");
					res.redirect('/connexion')
					}
				}else{
					console.log("l'email n'existe pas!!!");
					res.redirect('/connexion')
					}
		}
	});
});

//login admin
app.post('/loginadmin', (req, res)=>{
	var email= req.body.email;
	var password = req.body.password;
	db.query('SELECT * FROM admin WHERE email = ?',[email],  (error, results, fields)=> {
	if (error) {
	  res.send({"code":400,"failed":"error ocurred"})
	}else{
			if(results.length >0){
					if(results[0].password == password){
						res.redirect('/admin')
					}else{
					console.log("l'email ou le mot de passe est n'existe pas");
					res.redirect('/adminconnexion')
					}
				}else{
					console.log("l'email n'existe pas!!!");
					res.redirect('/adminconnexion')
					}
		}
	});
});

//enregistrer une reservation

app.post('/saverdv',(req,res)=>{
	let data={marque_rdv:req.body.marque_rdv,modele_rdv:req.body.modele_rdv,jour_rdv:req.body.jour_rdv,immatriculation_rdv:req.body.immatriculation_rdv,prestation_rdv:req.body.prestation_rdv};
	let sql="INSERT INTO rendezvous SET ?";
	let query=db.query(sql,data,(err,results)=>{
		if(err)throw err;
		if (true) {
			console.log("votre rendez-vous à bien été pris en compte");
		}
			res.redirect('/rendezvous');	
	});


});
//enregistrer une voiture
app.post('/saveparking',(req,res)=>{
	let data={nom:req.body.nom,contact:req.body.contact,marque:req.body.marque,immatriculation:req.body.immatriculation,heuredebut:req.body.heuredebut,heurefin:req.body.heurefin};
	let sql="INSERT INTO parking SET ?";
	let query=db.query(sql,data,(err,results)=>{
		if(err)throw err;
		if (true) {
			console.log("La voiture à bien été enregistrer");
		}
			res.redirect('/adminparkingauto');	
	});
});

//shopping cart
app.get('/achat',(req,res,next)=>{
	var productId = products && products[0].id;
	res.status(200).render('achat',{
			products:products
	});
});

app.get('/add/:id', function(req, res, next) {

	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	var product = products.filter(function(item) {
	  return item.id == productId;
	});
	cart.add(product[0], productId);
	req.session.cart = cart;
	res.redirect('/achat');
	
  });

  app.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});
  
	cart.remove(productId);
	req.session.cart = cart;
	res.redirect('/mescommandes');
  });
//afficher mes commandes
  app.get('/mescommandes', function(req, res, next) {

  if (!req.session.cart) {
    return res.render('mescommandes', {
      products: null
    });
  }
  var cart = new Cart(req.session.cart);
  res.render('mescommandes', {
    products: cart.getItems(),
		totalPrice: cart.totalPrice,
		
  });
});
//afficher commande dans admin
  app.get('/admincommande', function(req, res, next) {

	
  if (!req.session.cart) {
    return res.render('admincommande', {
      products: null
    });
  }
  var cart = new Cart(req.session.cart);
  res.render('admincommande', {
    products: cart.getItems(),
		totalPrice: cart.totalPrice,
		
  });
}); 
//afficher 
app.get('/adminlocation', function(req, res, next) {

	
  if (!req.session.car) {
    return res.render('adminlocation', {
      vehicules: null
    });
  }
  var car = new Car(req.session.car);
  res.render('adminlocation', {
    vehicules: car.getItems(),
		totalPrice: car.totalPrice,
		
  });
});  

//Afficher location
app.get('/location',(req,res,next)=>{
	var vehiculesId = vehicules && vehicules[0].idl;
	res.status(200).render('location',{
			vehicules:vehicules
	});
});


//Ajouter mes locations
app.get('/addv/:idl', function(req, res, next) {

	var vehiculesId = req.params.idl;
	var car = new Car(req.session.car ? req.session.car : {});
	var vehicule= vehicules.filter(function(item) {
	  return item.idl == vehiculesId;
	});
	car.add(vehicule[0], vehiculesId);
	req.session.car = car;
	res.redirect('/location');
	
  });
//afficheer mes location
app.get('/meslocations', function(req, res, next) {

	
  if (!req.session.car) {
    return res.render('meslocations', {
      vehicules: null
    });
  }
  var car= new Car(req.session.car);
  res.render('meslocations', {
    vehicules: car.getItems(),
		totalPrice: car.totalPrice,
		
  });
}); 
//supprimer mes locations
app.get('/removev/:idl', function(req, res, next) {
	var vehiculesId = req.params.idl;
	var car = new Car(req.session.car ? req.session.car : {});
  
	car.remove(vehiculesId);
	req.session.car = car;
	res.redirect('/meslocations');
  });
//
app.get('/adminparkingauto',(req,res)=>{
let sql="SELECT * FROM parking";
let query=db.query(sql,(err,results)=>{
		if(err)throw err;
		res.render('adminparkingauto',{
			results:results
		});
	});	

});
app.post('/deleteparking',(req, res) => {
  let sql = "DELETE FROM parking WHERE idparking="+req.body.id+"";
  let query = db.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/adminparkingauto');
  });
});

app.get('/mesrendezvous',(req,res)=>{
let sql="SELECT * FROM rendezvous";
let query=db.query(sql,(err,results)=>{
		if(err)throw err;
		res.render('mesrendezvous',{
			results:results
		});
	});	

});
app.get('/adminrendezvous',(req,res)=>{
let sql="SELECT * FROM rendezvous JOIN user";
let query=db.query(sql,(err,results)=>{
		if(err)throw err;
		res.render('adminrendezvous',{
			results:results
		});
	});	

});

app.post('/delete',(req, res) => {
  let sql = "DELETE FROM rendezvous WHERE id_rdv="+req.body.id+"";
  let query = db.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/mesrendezvous');
  });
});



app.listen(PORT,()=>{
	console.log('le serveur est connecté sur le Port : ' +PORT);
})