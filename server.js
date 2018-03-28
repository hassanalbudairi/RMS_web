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
const MessagingResponse = twilio.twiml.MessagingResponse;
 
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
	const twiml = new MessagingResponse();
	var knownSimNu = false;

//Check if the message is from a registered user
Models.users.findOne({'simNu': msgFrom},function(err,doc){
	knownSimNu = true;
	if(msgBody === 'RMS out'){
	Models.users.findByIdAndRemove(doc._id).exec();
	client.messages.create({
		to: msgFrom,
		from: process.env.Twilio_no,
		body: 'Hi '.concat(doc.fname)+'\xa0'.concat(doc.lname)+' your number is removed from RMS contact list'
		});
	}else{
	//send a message to the user to instruct on how to opt out
	client.messages.create({
		to: msgFrom,
		from: process.env.Twilio_no,
		body: 'Hi '.concat(doc.fname)+'\xa0'.concat(doc.lname)+' to opt-out, text: RMS out'
		});
	}
}).exec().then(function(){		
//check if this is a register sensor simNu
Models.sensordb.findOne({'simNu': msgFrom},function(err,results){
	knownSimNu = true;
	if (tst !== -1){
// record the message into warningsdata
	var item1 ={
	snr_id:results._id,
	simNu:msgFrom,
	loc:results.loc,
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
		body: 'Hi '.concat(contact.fname)+'\xa0'.concat(contact.lname)+' Warning message from sensor # '.concat(results._id)+' For more details, visit http://www.qtsrms.com/rmsMonitoring/warnings'
		});
		});
		}
		});
	}else{ 
	//health check info
	var sim = msgFrom.slice(8);
	var filename = 'S'.concat(sim);
	Models.addDataIndSnr(filename,msgBody);
	}
}).exec().then(function(){	
	if(knownSimNu == false){
	var item ={
	simNu: msgFrom, 
	msgbody: msgBody};
	var data= new Models.ErrComm(item);
	data.save();
	}
	});
	});
	res.writeHeader(200,{'Content-Type': 'text/xml'});
	res.end(twiml.toString());
	});