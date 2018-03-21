const express = require('express');
const app     = express();
const env	  = require('dotenv/config');
const morgan  = require('morgan');
const router  = express.Router();
const appRoutes  = require('./app/api')(router);
const bodyParser = require('body-parser');
const path       = require('path');
const port    = process.env.port || 8080;
const Models  = require('./app/models');

var twilio = require('twilio');
const client = twilio(process.env.accountSid,process.env.authToken);
 
//middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api',appRoutes);
//Connection to mongodb
const mongoose = require ('mongoose');
mongoose.connect('mongodb://localhost:27017/RMSdb',{ useMongoClient: true }, (err)=>{
if(err)console.log('Not connected to the database: ' + err);
else console.log('Successfully connected to MongoDB');});
mongoose.Promise = global.Promise;

app.get('*', function(req,res,next){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port,()=>{
	console.log('Running the server on port:' + port);
});

//--------------------TWILIO SERVICE----------------------//
app.post('/message',function(req,res){
	var msgFrom = req.body.From;
	var msgBody = req.body.Body;
	var tst = msgBody.indexOf('Alarm');
	console.log(req.body);
//Check if the message is from a registered user
Models.users.findOne({'simNu': msgFrom},function(err,doc){
	if(doc){
	if (msgBody === 'RMS out'){
	Models.users.findByIdAndRemove(doc._id).exec();
	res.send(`
	<Response>
	<Message>
	Hi ${doc.fname} ${doc.lname}, your contact number has been removed from RMS list.
	</Message>
	</Response>
	`);
	}else{
	var item ={
	simNu: msgFrom, 
	msgbody: msgBody};
	var data= new Models.ErrComm(item);
	data.save();
	res.send(`
	<Response>
	<Message>
	Hi ${doc.fname} ${doc.lname}. To opt out, please text 'RMS out'.
	</Message>
	</Response>
	`);
	}
	}
	});
// check if the message from a registered sensor
	Models.sensordb.findOne({'simNu': msgFrom},function(err,doc){
	//if the number not in the list then log the details into the Error Communication db
	if(err||doc == null){
	var item ={
	simNu: msgFrom, 
	msgbody: msgBody};
	var data= new Models.ErrComm(item);
	data.save();
		return
	}
	else if (tst !== -1){
// record the message into warningsdata
	console.log('Warning message');
	var item1 ={
	snr_id:doc._id,
	simNu:msgFrom,
	loc:doc.loc,
	msg:msgBody
	}
	var data1= new Models.warningsdb(item1);
	data1.save(function (err){
			if(err) console.log(err);
			});
// Send sms to all registered contacts
    Models.users.find({
		$or:[
		{'role': "Member"},
		{'role': "Admin"},
		],
	}, function(err, docs) {		
        if (err || docs.length == 0) console.log('This is users\'s sending messages error' + err);
        else{
        docs.forEach(function(contact) {
        client.messages.create({
		to: contact.simNu,
		from: process.env.Twilio_no,
		body: 'Hi '.concat(contact.fname)+'\xa0'.concat(contact.lname)+' Warning message from sensor # '.concat(doc._id)+' For more details, visit https://d82b4235.ngrok.io/rmsMonitoring/warnings'
		}, function(err, message) {
		if (err){
		console.log(err);
		}else{
		console.log(message.sid)
		}
		});
		});
		}
	});
	}else{ //health check info
	console.log('Health check message');	
	var sim = msgFrom.slice(8);
	var filename = 'S'.concat(sim);
	console.log(filename);
	Models.addDataIndSnr(filename,msgBody);
	}
	});
	
	
	
	
	
	
	
	
	
});













