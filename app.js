var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
var bodyParser=require('body-parser');
//var ss=require('socket.io-stream');
//var fs = require("fs");
var gpio = require('pigpio').Gpio;
server.listen(3000);

app.use(express.static('assets'));
app.use('/',function(req,res,next){
	console.log("Requested URL: "+req.url);
	next();
});
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/',function(req,res){
	res.sendFile('index.html');
});

app.post('/login',urlencodedParser,function(req,res){
	if((req.body.userName==='test')&&(req.body.password==='wehicle')){
		res.sendFile(__dirname+'/assets/controller.html');
	}
	else{
		res.send('Incorrect Credentials');
	}
});
io.sockets.on('connection',function(socket){
	ss(socket).on('watch',function(stream){
		fs.createReadStream(__dirname+'/..test.mp4').pipe(stream);
	});
	socket.on('up',function(data){
		if(data.state){
			forward();
			socket.emit('upResponse',{data:'up button is down now'});
		}
		else{
			stopMotor();
			socket.emit('upResponse',{data:'up button is up again'});
		}
	});
	socket.on('down',function(data){
		if(data.state){
			backward();
			socket.emit('downResponse',{data:'down button is down now'});
		}
		else{
			stopMotor();
			socket.emit('downResponse',{data:'down button is up again'});
		}
	});
	socket.on('right',function(data){
		if(data.state){
			turnRight();
			socket.emit('rightResponse',{data:'right button is down now'});
		}
		else{
			stopMotor();
			socket.emit('rightResponse',{data:'right button is up again'});
		}
	});
	socket.on('left',function(data){
		if(data.state){
			turnLeft();
			socket.emit('leftResponse',{data:'left button is down now'});
		}
		else{
			stopMotor();
			socket.emit('leftResponse',{data:'left button is up again'});
		}
	});
});

var PWMA=new gpio(24,{ mode: gpio.OUTPUT });
var PWMB=new gpio(22,{ mode: gpio.OUTPUT });
var PInA1=new gpio(23,{ mode: gpio.OUTPUT });
var PInA2=new gpio(18,{ mode: gpio.OUTPUT });
var PInB1=new gpio(27,{ mode: gpio.OUTPUT });
var PInB2=new gpio(17,{ mode: gpio.OUTPUT });

function initialize(){
	PWMA.digitalWrite(0);
	PWMB.digitalWrite(0);
	PInA1.digitalWrite(0);
	PInA2.digitalWrite(0);
	PInB1.digitalWrite(0);
	PInB2.digitalWrite(0);
}

console.log('-------------------Printing PIN statistics-------------------------');
console.log('\nPWMA range: '+PWMA.getPwmRange());
console.log('\nPWMA frequency: '+PWMA.getPwmFrequency());
console.log('\nPWMB range: '+PWMB.getPwmRange());
console.log('\nPWMB frequency: '+PWMB.getPwmFrequency());

function forward() {
    // ==== A ====
    PWMA.digitalWrite(1);
    PInA1.digitalWrite(1);
    PInA2.digitalWrite(0);

    // ==== B ====
    PWMB.digitalWrite(1);
    PInB1.digitalWrite(0);
    PInB2.digitalWrite(1);
}

function backward() {
    // ==== A ====
    PWMA.digitalWrite(1);
    PInA1.digitalWrite(0);
    PInA2.digitalWrite(1);

    // ==== B ====
    PWMB.digitalWrite(1);
    PInB1.digitalWrite(1);
    PInB2.digitalWrite(0);
}

function turnLeft() {
    // ==== A ====
    PWMA.digitalWrite(1);
    PInA1.digitalWrite(1);
    PInA2.digitalWrite(0);

    // ==== B ====
    PWMB.digitalWrite(1);
    PInB1.digitalWrite(1);
    PInB2.digitalWrite(0);
}

function turnRight() {
    // ==== A ====
    PWMA.digitalWrite(1);
    PInA1.digitalWrite(0);
    PInA2.digitalWrite(1);

    // ==== B ====
    PWMB.digitalWrite(1);
    PInB1.digitalWrite(0);
    PInB2.digitalWrite(1);
}

initialize();

function stopMotor(){
	PWMA.digitalWrite(0);
	PWMB.digitalWrite(0);
	PInA1.digitalWrite(0);
	PInA2.digitalWrite(0);
	PInB1.digitalWrite(0);
	PInB2.digitalWrite(0);
}