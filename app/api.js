const Models  = require('./models');
const jwt = require('jsonwebtoken');
const fs = require('fs');
module.exports = function(router){
	//add user
router.post('/addUser', (req,res,next)=>{
if (req.body.fname==''||req.body.fname==null||req.body.lname==''||req.body.lname==null||req.body.email==''||req.body.email==null||req.body.password==''||req.body.password ==null||req.body.role==''||req.body.role ==null) res.json({success: false, message:'Ensure First name, Last name, Email, password and role are provided'})
	else {
	var user = new Models.users();
	user.fname = req.body.fname;
	user.lname = req.body.lname;
	user.simNu = req.body.simNu;
	user.email = req.body.email;
	user.password = req.body.password;
	user.role = req.body.role;
	user.save((err)=> {
	if(err)	res.json({success:false,message:'Email already exists' +err});
	else res.json({success:true, message:'User created'});
	});
		}
});
//list users
router.post('/usersList', (req,res,next)=>{
	Models.users.find({}, '_id fname lname simNu email role createdAt', function (err, data){
	if(err || data.length < 1) res.json({success:false,message:'No existing users'});
	else    				   res.json({success:true, message:'Users\' list created', data:data});
	});
});
// find user
router.post('/findUser',(req,res)=>{
	Models.users.findById(req.body.id,function(err,data){
	if(err ||!data||data.length < 1) res.json({success:false,message:'No existing user'});
	else							 res.json({success:true, message:'User\'s data loaded', data:data});
	});
});
// update user
router.post('/updateUser',(req,res)=>{
	Models.users.findById(req.body.id,function(err,user){
	if(err ||!user||user.length < 1) res.json({success:false,message:'No existing user'});
	else{
	user.fname = req.body.fname;
	user.lname = req.body.lname;
	user.simNu = req.body.simNu;
	user.email = req.body.email;
	user.password = req.body.password;
	user.role = req.body.role;
	user.save((err)=> {
	if(err)	res.json({success:false,message:'Failed to update user\'s data' +err});
	else res.json({success:true, message:'User data updated'});
	});
	}
	});
});
// delete user
router.post('/deleteUser',(req,res)=>{
	Models.users.findByIdAndRemove(req.body.id).exec();
	res.json({success:true, message:'User data deleted'});
	});
// auth
router.post('/auth',(req,res)=>{
	Models.users.findOne({email: req.body.email}).exec(function(err,user){
	if (err) res.json({success: false, message:'Error' + err})
	if (!user) res.json({success: false, message:'Could not authenticate user'})
		else if (user){
		if (req.body.password){ var validPassword = user.comparePassword(req.body.password)
		}else{res.json({success: false, message:'No password provided'})}
	
		if(!validPassword){res.json({success: false, message:'Could not authenticate password'})
		}else{
			var token = jwt.sign({fname:user.fname, lname:user.lname, role:user.role}, process.env.JWT_SECRET,{expiresIn: '24h'});
			res.json({success: true, message:'Authentication success', token:token})}
		}
	});
	});
	
	
	
	
//verify and decoded token middleware that will be used with /current usr route
router.use(function(req,res,next){
	var token = req.body.token||req.body.query||req.headers['x-access-token'];
	if (token){
		jwt.verify(token,process.env.JWT_SECRET, function(err,decoded){
			if (err) {
				
				res.json({success: false, message:'Invalid token'});
			}else{
				req.decoded = decoded;
				next();
			}
		});
	}else{
		res.json({success: false, message:'Need login credentials'});
	}
});




//current user
router.post('/currentusr',(req,res)=>{
	res.send(req.decoded);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Sensors routes
//load sensors list
router.get('/snrslst', (req,res)=>{
	Models.sensordb.find({}, function (err, data){
	if(err || data.length < 1) res.json({success:false,message:'No existing sensors '+err});
	else    				   res.json({success:true, message:'Sensors\' list created', data:data});
	}).sort('_id');
});







//Add sensors
router.post('/addsnrs', (req,res,next)=>{
if (req.body.lat==''||req.body.lat==null||req.body.lng==''||req.body.lng==null||req.body.simNu==''||req.body.simNu==null||req.body.loc==''||req.body.loc ==null){
	res.json({success: false, message:'Ensure all required information are provided'})
	return;
	}else{
	var snr = new Models.sensordb();
	snr.lat = req.body.lat;
	snr.lng = req.body.lng;
	snr.simNu = req.body.simNu;
	snr.loc = req.body.loc;
	snr.save((err)=> {
	if(err){
	res.json({success:false,message:'Sensor already exists ' +err});
	return;
	}
	else{
//create a sensor database and add initial chrage data
	var sim = req.body.simNu.slice(8);
	var filename = 'S'.concat(sim);
	Models.indSnr(filename,res);
	//res.json({success:true,message:'Sensor record added and ind snr db created'});
	}
	});
	}
});










// find sensor
router.post('/findsnr',(req,res)=>{
	Models.sensordb.findById(req.body.id,function(err,data){
	if(err ||!data||data.length < 1) res.json({success:false,message:'No existing sensor'});
	else							 res.json({success:true, message:'sensor\'s data loaded', data:data});
	});
});
// update sensor
router.post('/updatesnr',(req,res)=>{
	Models.sensordb.findById(req.body.id,function(err,snr){
	if(err ||!snr||snr.length < 1) res.json({success:false,message:'No existing sensor'});
	else{
		//rename individual sensor db if simNu is modified
		if(snr.simNu !== req.body.simNu){
		var a = snr.simNu.slice(8);
		var oldname = 'S'.concat(a);
		var b = req.body.simNu.slice(8);
		var newname = 'S'.concat(b);
		Models.renamedb(oldname,newname);
		}
	snr.lat = req.body.lat;
	snr.lng = req.body.lng;
	snr.simNu = req.body.simNu;
	snr.loc = req.body.loc;
	snr.save(function (err){
	if(err)	res.json({success:false,message:'Failed to update sensor records ' +err});
	else res.json({success:true, message:'Sensor records updated'});
	});
	}
	});
});
// delete sensors from db
router.post('/deletesnr',(req,res)=>{
	var a = req.body.simNu.slice(8);
	var oldname = 'S'.concat(a);
	var b = req.body.simNu.slice(8);
	var newname = 'S'.concat(b)+'_deleted';
	Models.renamedb(oldname,newname,res);
	Models.sensordb.findByIdAndRemove(req.body.id).exec(function(err){
	if(err)	res.json({success:false,message:'Failed to delete sensor record ' +err});
	else res.json({success:true, message:'Sensor records deleted'});		
	});
	});

//find individual sensor db
router.post('/indSnrdb',(req,res)=>{
var c = req.body.simNu.slice(-5);
var snrdb = 'S'.concat(c);
Models.finddb(snrdb,res);
});

//Find and list warnings
router.get('/warnings',(req,res)=>{
Models.warningsdb.find({}, function (err, data){
	if(err || data.length < 1) res.json({success:false,message:'No warnings!'});
	else    				   res.json({success:true, message:'Warnings data listed', data:data});
	}).sort('_id');
});

//temp to add data to warningsdb
router.post('/addwarnings',function(req,res){
	var item = new Models.warningsdb();
	item.snr_id = req.body.snr_id;
	item.simNu = req.body.simNu;
	item.loc = req.body.loc;
	item.msg = req.body.msg;
	item.act = req.body.act;
	item.save((err)=> {
	if(err)	res.json({success:false,message:'Sensor already exists' +err});
	else    res.json({success:true,message:'Warning saved'});
});
});

//update warning status
router.post('/updatewarnings',function(req,res){
	Models.warningsdb.findOneAndUpdate({snr_id: req.body.snr_id, createdAt: req.body.createdAt},{$set: {act:req.body.stat}},{new:true},function(err,data){
	if (err) res.json({success: false, message:'Error' + err})
	else res.json({success: true, message:'status successfully update' + data})
	});
	});
//Update actions for individual warning
router.post('/action',function(req,res){
Models.actiondb(req,res);
});
//Find list of actions for individual warning
router.post('/indwarns',(req,res)=>{
Models.findwrnsdb(req.body.filename,res);
});

























//upload photo to db
router.post('/uploadphotos',function(req,res){
var item = new Models.photosdb();
item.url = req.body.url;
item.dir = req.body.dir;
item.simNu = req.body.simNu;
item.save(function (err){
if(err) res.json({success:false,message:'Photo not saved!' +err});
else    res.json({success:true,message:'Photo saved'});
});
});

//get photo data for warning page
router.post('/photoswrns',(req,res)=>{
	console.log(req.body.simNu);
	Models.photosdb.find({'simNu': req.body.simNu},function(err,data){
	if(err||data==null||data.length<1) res.json({success:false,message:'No photo found'});
	else                               res.json({success:true, message:'photos loaded', data:data});	
		}).sort('createdAt');
	
});


//get twilio
router.post('/twiliomsg',function(req,res){
	
	var msgFrom = req.body;
	var msgBody = req.body.Body;
	console.log(msgFrom);
	console.log(msgBody);
	
	
	
	res.json({success:true, message:'twilio message'});	
});





		
		
		
		
		
		
		
		
		
		
		
		
		

return router;
}








