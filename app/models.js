const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require ('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
var bcrypt = require('bcryptjs');
/////////////////---------------Error communications records------------------///////////////
var ErrCommSchema = new mongoose.Schema({
  simNu: String,
  msgbody  : String
},{Collection:'ErrComm',timestamps: true});
ErrCommSchema.plugin(autoIncrement.plugin,{model:'ErrComm', startAt:1});
exports.ErrComm = mongoose.model('ErrComm',ErrCommSchema,'ErrComm');
////////////////---------- Users schema--------------//////////////////////
var UserSchema = new mongoose.Schema({
  fname   : {type: String, required: true},
  lname   : {type: String, required: true},
  simNu:{
        type: String,
        validate: {
          validator: function(v) {
            return /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/.test(v);
          },
          message: '{VALUE} is not a valid phone number!'
        },
        required: [true, 'User phone number required']
      },
  email   : {type: String, lowercase: true, unique: true, required: true},
  password: {type: String, required: true},
  role    : {type: String, enum: ['Client', 'Member', 'Admin'], default: 'Client'}
},{Collection:'users',timestamps: true});
// hashing password
UserSchema.pre('save', function(next) {
	if (this.isModified('password') || this.isNew) {
	bcrypt.hash(this.password, 10, (err, hash)=> {
        if (err) return next(err);
        else {this.password = hash; 
        next();}
	});
	}else{
    return next();
	}
});
// compare input to saved passwords
UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password,this.password);
	}
UserSchema.plugin(autoIncrement.plugin,{model:'users', startAt:1});
exports.users = mongoose.model('users',UserSchema,'users');
///////////////////////----------------Sensor list schema ------------------------///////////////
//sensors db schema
var snrDataSchema = new Schema({
	lat:Number,
	lng:Number,
	simNu:{
        type: String,
        validate: {
          validator: function(v) {
            return /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/.test(v);
          },
          message: '{VALUE} is not a valid phone number!'
        },
        required: [true, 'User phone number required']
      },
	loc:String
},{Collection:'sensordb',timestamps: true});
snrDataSchema.plugin(autoIncrement.plugin,{model:'sensordb', startAt:1});
exports.sensordb = mongoose.model('sensordb',snrDataSchema,'sensordb');
//////////////////////------------Health checking schema ------------------------////////////////////////








// Create individual sensor db schema
exports.indSnr = function(filename,res){
	let db = mongoose.connection.db;
	db.createCollection(filename, {charge:Number,sgn:Number},function(err){
		if(err) res.json({success:false,message:'Cannt create ind Snr db ' +err});
		else	res.json({success:true, message:'Ind Snr db created'});
	});
//var indSnrDataSchema = new Schema({
//	charge:Number,
//	sgn:Number
//},{timestamps: true, collection:filename});
//indSnrDataSchema.plugin(autoIncrement.plugin,{model:'indSnr', startAt:1});
//var indSnr = mongoose.model(filename,indSnrDataSchema,filename);
}

//Add data to individual sensor db
exports.addDataIndSnr = function(filename,msg){
var charge = msg.substring(msg.indexOf("BAT=")+4).split('%');
var sgn = msg.substring(msg.indexOf("GSM=")+4).split(';');
//var charge = parseInt(ch[0]);
//var sgn = parseInt(sg[0]);
if (charge !== null){
	
	//console.log('=====================================');
//console.log(filename);
console.log(charge[0]);
console.log(sgn[0]);
let db = mongoose.connection;
//db.on('error', function(err){ console.log('connection error: '+err)});
//db.on('connected', function() { console.log(' Connection success-------------')});
const collection = db.collection(filename);
collection.save({charge:charge[0],sgn:sgn[0]},function(err){
if (err) console.log('Error in saving charging data: '+err)
});

/*
collection.find({}).toArray(function(err,doc){
	if (err) console.log(err);
	else console.log(doc);
	
});
*/
//var dbname = "S88335";
//db[dbname].save({charge:charge[0],sgn:sgn[0]});
	
/*	
var item ={
	charge: charge,
	sgn: sgn
	};
	let db = mongoose.connection.db;
	var data = db.collection(filename);
	data.save(function (err){
	if(err) console.log('Error in creating sensor db' + err);
	else console.log('Sensor added and sensor db created');
	});
	*/
	/*
	let db = mongoose.connection.db;
	db.collection.find(filename).then(function(data){
	data.insertOne({
	charge: charge,
	sgn: sgn
	});
	});
	*/
}	
}








//rename ind snr when deleting records
exports.renamedb = function(oldname,newname){
  let db = mongoose.connection.db;
  var oldfile = db.collection(oldname);
  if (oldfile !== null){
  oldfile.rename(newname, function(err){
	if(err) console.log('Error in rename sensor db' +err);
	else console.log('Sensor db has successfully renamed');  
  });
  }else{console.log('oldname file not exist')}
}

//find db by name
exports.finddb = function(dbname,res){
  let db = mongoose.connection.db;
  db.collection(dbname).find({},{_id:1,charge:1,sgn:1}).toArray(function(err,data){
	if(err) res.json({success:false,message:'Error in reading sensor db' +err});
	else	res.json({success:true, message:'Sensor db has been found', results:data});
  });
}
///////////////////////------------WarningSchema-------------------------/////////////////////
//warnings db
var WarningSchema = new Schema({
	snr_id:Number,
	simNu:{
        type: String,
        validate: {
          validator: function(v) {
            return /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/.test(v);
          },
          message: '{VALUE} is not a valid phone number!'
        },
        required: [true, 'User phone number required']
      },
	loc:String,
	msg:String,
	act: {type: String, enum: ['Active','Inspection', 'Fixed'], default: 'Active'}
},{timestamps: true});
WarningSchema.plugin(autoIncrement.plugin,{model:'warningsdb', startAt:1});
exports.warningsdb = mongoose.model('warningsdb',WarningSchema,'warningsdb');

// find individual warning db by name
exports.findwrnsdb = function(dbname,res){
  let db = mongoose.connection.db;
  db.collection(dbname).find({}).toArray(function(err,data){
	if(err) res.json({success:false,message:'Error in reading sensor db' +err});
	else	res.json({success:true, message:'Sensor db has been found', results:data});
  });
}

//action db for each warning, filename:simNu.slice(-5)-createdAt
exports.actiondb = function(req,res){
var ActionSchema = new Schema({
	act:String,
	fname:String,
	lname:String,
	role:String
},{timestamps: true});
ActionSchema.plugin(autoIncrement.plugin,{model:'actiondb', startAt:1});
var actiondb = mongoose.model(req.body.filename,ActionSchema,req.body.filename);
var item ={
	act: req.body.msg,
	fname: req.body.fname,
	lname: req.body.lname,
	role: req.body.role
	};
	var data = new actiondb(item);
	data.save(function (err){
	if(err) res.json({success:false,message:'Error in creating sensor db' +err});
	else res.json({success:true, message:'Sensor added and sensor db created'});
	});
}
//////////////////////------------------photosSchema--------------------////////////////////
//photos db
var photosSchema = new Schema({
	url: String,
	dir:{type: String, enum: ['Front', 'Side'], default: 'Front'}, 
	simNu:{
        type: String,
        validate: {
          validator: function(v) {
            return /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/.test(v);
          },
          message: '{VALUE} is not a valid phone number!'
        },
        required: [true, 'User phone number required']
      } 
},{collection:'photosdb',timestamps: true});
photosSchema.plugin(autoIncrement.plugin,{model:'photosdb', startAt:1});
exports.photosdb = mongoose.model('photosdb',photosSchema,'photosdb');




