// variables and constants
const c = document.getElementById('canvas');
c.width = window.innerWidth;
c.height = 400;
const ctx = c.getContext('2d');
const p = document.getElementById('p');
const modalBox = document.getElementsByClassName('modal')[0];
const leftBox = document.getElementsByClassName('left')[0];
const rightBox = document.getElementsByClassName('right')[0];

window.addEventListener('resize',()=>c.width = window.innerWidth);

if(typeof(localStorage.coins) == "undefined" || localStorage.coins == "NaN"){
	localStorage.setItem('coins',0);
}

//left, right, top, bottom of keybords
let keys = [37,39,38,40];


// physics of car
let acc = 0;
let speed = 0;
let position = 0;

// functions related to physics of ground.

let layer = [];
while(layer.length < 255){
	while(layer.includes(val = Math.floor(Math.random()*255)));
	layer.push(val);
}

let lerp = (a,b,t) => a+(b-a)*(1-Math.cos(t*Math.PI))/2;

const noise =(x)=>{
	x = x*0.005%255;
	return lerp(layer[Math.floor(x)],layer[Math.ceil(x)],x-Math.floor(x));
}

class modals {
	// constructor(){

	// }
	open(){
		modalBox.style.display='grid';
	}
	close(){
		modalBox.style.display='none';
	}
	gameloss(){
		modalBox.children[0].innerHTML = "Sorry You Lose <br> You have "+localStorage.coins+ " coins";
	}
}

const modal = new modals();

class thisGame{
	constructor(){
		this.state = 0;		
	}
	reset(){
		position=0;
		speed=0;
		acc=0;
		player.rot=0;
		coins.allCoins = [];
		objects.allObjects = [];
		player.rSpeed = 0;
		bg.coinCount=0;
		player.ySpeed = 0;
	}
	start(){
		this.state = 1;
		this.reset();
		modal.close();
		loop();
	}
}
const game = new thisGame();

// Background

class background{
	constructor(){
		this.image = new Image;
		this.image.src = 'img/tile.png';
		this.time = { // Timimg
			lastTime: 0,
			start: (currentTime)=>{
				this.deltaTime = currentTime - this.lastTime;
				position += speed,speed += acc;
			},
			end: (currentTime)=>{
				this.lastTime = currentTime;
			}
		};
		this.dashboard = { // Dashboard
			text: (color,text,x,y)=>{
			 	ctx.font="40px dashboard";
			 	ctx.fillStyle = color;
			 	ctx.fillText(text,x,y);
			},
			show: ()=>{
				this.dashboard.text('#ff4d4d',Math.round(position)+ ' m',50,50); // Distance
				this.dashboard.text('#ff4d4d',Math.round(Math.abs(speed))+' km/h',c.width-300,50); // Speed
				this.coinImg = new Image();
				this.coinImg.src = 'img/coin.png';
				ctx.drawImage(this.coinImg,50,70,30,30);
				this.dashboard.text('#fde318',localStorage.coins,100,100);
			},
			save: ()=>{
				localStorage.coins = ((parseInt(localStorage.coins))+1);
			}
		};
		this.sky = {// Sky
			draw: ()=>{
				ctx.fillStyle = '#19f';
				ctx.fillRect(0,0,c.width,c.height);
			}}

		this.tile = {//Ground 
			draw: ()=>{
				ctx.drawImage(this.image,0,0,0,c.height,0,0,0,c.height);
					for(let i = 0;i < c.width;i++) ctx.drawImage(this.image,i,(c.height-noise(i+position)*0.25));		
			}}
	}
}

const bg = new background();

// Car related physics
class play{
	constructor(){
		this.ySpeed = 0;
		this.position = {x:c.width/4, y: 0}
		this.width = 50;
		this.height = 30;
		this.rot = 0;
		this.image = new Image;
		this.image.src = 'img/Cars/car1.png';
		this.rSpeed = 0;
	}
	draw(){
		this.p1 = (c.height-noise(position+this.position.x)*0.25);
		this.p2 = (c.height-noise(position+5+this.position.x)*0.25);
		this.grounded = 0;
		const makeGrounded = () =>{
			this.ySpeed -= this.position.y -(this.p1-15); // bounce of car
			this.position.y = this.p1-15; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 1 : makeGrounded();

		this.angle = Math.atan2(this.p2-this.position.y-15,5);
		this.position.y += this.ySpeed;
		
		if(this.grounded){
			if (Math.abs(this.rot)<=Math.PI/2){
				this.rot -= (this.rot-this.angle)/2;
				this.rSpeed -= this.angle - this.rot;
			}else if (Math.abs(this.rot)<=Math.PI){
				this.rot= Math.PI;
				this.rSpeed = 0;
				speed=5;
				game.state=0;
				modal.open();
				modal.gameloss();
				// setTimeout(()=>document.exitFullscreen(),1000);
			}else{
				this.rot -= (this.rot-this.angle)/2;
				this.rSpeed -= this.angle - this.rot;
			}
		}
		this.rot -= this.rSpeed/3;
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.rotate(this.rot);
		ctx.drawImage(this.image,-15,-15,this.width,this.height);
		ctx.restore();
	}
}
let player = new play();

// coins 

class coin {
	constructor(xPos) {
		this.ySpeed = 0;
		this.position = {x:xPos,y:0};
		this.width = 34,this.height = 34;
		this.image = new Image;
		this.image.src = 'img/coin.png';
	}
	draw(){
		this.p1 = (c.height-noise(position+this.position.x)*0.25);
		this.p2 = (c.height-noise(position+5+this.position.x)*0.25);

		
		this.grounded = 0;
		const makeGrounded = () =>{
			this.position.y = this.p1-40; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 1 : makeGrounded();

		this.position.y += this.ySpeed;

		this.position.x -= speed;
		
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.drawImage(this.image,-30,-30,this.width,this.height);
		ctx.restore();
	}
}

var coins = {
	allCoins : [],
	add: ()=>{
		coins.allCoins.length < 200 ? coins.allCoins.push(new coin((coins.allCoins.length)*((Math.random()*1000)+100))) : console.dir(coins.allCoins.length);;
		coins.allCoins.forEach((item)=> item.draw());
	},
	collide: ()=>{
		coins.allCoins.forEach((item,index,arr)=>{
		if (item.position.x <= (player.position.x+player.width) && (item.position.x+item.width) >= player.position.x && item.position.y >= (player.position.y-player.height) && (item.position.y-item.height) <= player.position.y){
			bg.dashboard.save();
			arr.splice(index,1);
		}
	});
	}
};


// Objects
class Object {
	constructor(x){
		this.x = x;
		this.position = {x:this.x, y: 0}
		this.image = new Image;
		this.image.src = 'img/objects/'+Math.floor(Math.random()*10+1)+'.png';
	}

	draw(){
		this.p1 = (c.height-noise(this.x)*0.25);
		this.position.y = this.p1-this.image.height+15;
		this.position.x -= speed;

		ctx.save();
		ctx.drawImage(this.image,this.position.x,this.position.y);
		ctx.restore();

	}
}
var objects = {
	allObjects : [],
	add: ()=>{
		objects.allObjects.length < 100 ? objects.allObjects.push(new Object((objects.allObjects.length)*((Math.random()*1000)+200))): console.dir(objects.allObjects.length);
		objects.allObjects.forEach((item)=> item.draw());
	}
}

// functions of keyboard clicks

const keyDown =()=>{
	window.addEventListener('keydown', e => {
		switch(e.keyCode){
			case keys[1]: speed < 50 ? (acc = 1,player.rSpeed=(0.005*speed)) : acc=0;break;
			case keys[0]: position > 0 ? (speed > -10 ? (acc = -1,player.rSpeed=(-0.01*speed)) : acc=0): (acc = 0,speed=0,position=0);break;
		}
	});
}
window.addEventListener('keydown', e => {
		switch(e.keyCode){
// variables and constants
const c = document.getElementById('canvas');
c.width = window.innerWidth;
c.height = 400;
const ctx = c.getContext('2d');
const p = document.getElementById('p');
const modalBox = document.getElementsByClassName('modal')[0];
const leftBox = document.getElementsByClassName('left')[0];
const rightBox = document.getElementsByClassName('right')[0];

window.addEventListener('resize',()=>c.width = window.innerWidth);

if(typeof(localStorage.coins) == "undefined" || localStorage.coins == "NaN"){
	localStorage.setItem('coins',0);
}

//left, right, top, bottom of keybords
let keys = [37,39,38,40];


// physics of car
let acc = 0;
let speed = 0;
let position = 0;

// functions related to physics of ground.

let layer = [];
while(layer.length < 255){
	while(layer.includes(val = Math.floor(Math.random()*255)));
	layer.push(val);
}

let lerp = (a,b,t) => a+(b-a)*(1-Math.cos(t*Math.PI))/2;

const noise =(x)=>{
	x = x*0.005%255;
	return lerp(layer[Math.floor(x)],layer[Math.ceil(x)],x-Math.floor(x));
}

class modals {
	// constructor(){

	// }
	open(){
		modalBox.style.display='grid';
	}
	close(){
		modalBox.style.display='none';
	}
	gameloss(){
		modalBox.children[0].innerHTML = "Sorry You Lose <br> You have "+localStorage.coins+ " coins";
	}
}

const modal = new modals();

class thisGame{
	constructor(){
		this.state = 0;		
	}
	reset(){
		position=0;
		speed=0;
		acc=0;
		player.rot=0;
		coins.allCoins = [];
		objects.allObjects = [];
		player.rSpeed = 0;
		bg.coinCount=90909090900;
		player.ySpeed = 0;
	}
	start(){
		this.state = 1;
		this.reset();
		modal.close();
		loop();
	}
}
const game = new thisGame();

// Background

class background{
	constructor(){
		this.image = new Image;
		this.image.src = 'img/tile.png';
		this.time = { // Timimg
			lastTime: 0,
			start: (currentTime)=>{
				this.deltaTime = currentTime - this.lastTime;
				position += speed,speed += acc;
			},
			end: (currentTime)=>{
				this.lastTime = currentTime;
			}
		};
		this.dashboard = { // Dashboard
			text: (color,text,x,y)=>{
			 	ctx.font="40px dashboard";
			 	ctx.fillStyle = color;
			 	ctx.fillText(text,x,y);
			},
			show: ()=>{
				this.dashboard.text('#ff4d4d',Math.round(position)+ ' m',50,50); // Distance
				this.dashboard.text('#ff4d4d',Math.round(Math.abs(speed))+' km/h',c.width-300,50); // Speed
				this.coinImg = new Image();
				this.coinImg.src = 'img/coin.png';
				ctx.drawImage(this.coinImg,50,70,30,30);
				this.dashboard.text('#fde318',localStorage.coins,100,100);
			},
			save: ()=>{
				localStorage.coins = ((parseInt(localStorage.coins))+1);
			}
		};
		this.sky = {// Sky
			draw: ()=>{
				ctx.fillStyle = '#19f';
				ctx.fillRect(0,0,c.width,c.height);
			}}

		this.tile = {//Ground 
			draw: ()=>{
				ctx.drawImage(this.image,0,0,0,c.height,0,0,0,c.height);
					for(let i = 0;i < c.width;i++) ctx.drawImage(this.image,i,(c.height-noise(i+position)*0.25));		
			}}
	}
}

const bg = new background();

// Car related physics
class play{
	constructor(){
		this.ySpeed = 0;
		this.position = {x:c.width/4, y: 0}
		this.width = 50;
		this.height = 30;
		this.rot = 0;
		this.image = new Image;
		this.image.src = 'img/Cars/car1.png';
		this.rSpeed = 0;
	}
	draw(){
		this.p1 = (c.height-noise(position+this.position.x)*0.25);
		this.p2 = (c.height-noise(position+5+this.position.x)*0.25);
		this.grounded = 0;
		const makeGrounded = () =>{
			this.ySpeed -= this.position.y -(this.p1-15); // bounce of car
			this.position.y = this.p1-15; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 1 : makeGrounded();

		this.angle = Math.atan2(this.p2-this.position.y-15,5);
		this.position.y += this.ySpeed;
		
		if(this.grounded){
			if (Math.abs(this.rot)<=Math.PI/2){
				this.rot -= (this.rot-this.angle)/2;
				this.rSpeed -= this.angle - this.rot;
			}else if (Math.abs(this.rot)<=Math.PI){
				this.rot= Math.PI;
				this.rSpeed = 0;
				speed=5;
				game.state=0;
				modal.open();
				modal.gameloss();
				// setTimeout(()=>document.exitFullscreen(),1000);
			}else{
				this.rot -= (this.rot-this.angle)/2;
				this.rSpeed -= this.angle - this.rot;
			}
		}
		this.rot -= this.rSpeed/3;
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.rotate(this.rot);
		ctx.drawImage(this.image,-15,-15,this.width,this.height);
		ctx.restore();
	}
}
let player = new play();

// coins 

class coin {
	constructor(xPos) {
		this.ySpeed = 0;
		this.position = {x:xPos,y:0};
		this.width = 34,this.height = 34;
		this.image = new Image;
		this.image.src = 'img/coin.png';
	}
	draw(){
		this.p1 = (c.height-noise(position+this.position.x)*0.25);
		this.p2 = (c.height-noise(position+5+this.position.x)*0.25);

		
		this.grounded = 0;
		const makeGrounded = () =>{
			this.position.y = this.p1-40; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 1 : makeGrounded();

		this.position.y += this.ySpeed;

		this.position.x -= speed;
		
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.drawImage(this.image,-30,-30,this.width,this.height);
		ctx.restore();
	}
}

var coins = {
	allCoins : [],
	add: ()=>{
		coins.allCoins.length < 200 ? coins.allCoins.push(new coin((coins.allCoins.length)*((Math.random()*1000)+100))) : console.dir(coins.allCoins.length);;
		coins.allCoins.forEach((item)=> item.draw());
	},
	collide: ()=>{
		coins.allCoins.forEach((item,index,arr)=>{
		if (item.position.x <= (player.position.x+player.width) && (item.position.x+item.width) >= player.position.x && item.position.y >= (player.position.y-player.height) && (item.position.y-item.height) <= player.position.y){
			bg.dashboard.save();
			arr.splice(index,1);
		}
	});
	}
};


// Objects
class Object {
	constructor(x){
		this.x = x;
		this.position = {x:this.x, y: 0}
		this.image = new Image;
		this.image.src = 'img/objects/'+Math.floor(Math.random()*10+1)+'.png';
	}

	draw(){
		this.p1 = (c.height-noise(this.x)*0.25);
		this.position.y = this.p1-this.image.height+15;
		this.position.x -= speed;

		ctx.save();
		ctx.drawImage(this.image,this.position.x,this.position.y);
		ctx.restore();

	}
}
var objects = {
	allObjects : [],
	add: ()=>{
		objects.allObjects.length < 100 ? objects.allObjects.push(new Object((objects.allObjects.length)*((Math.random()*1000)+200))): console.dir(objects.allObjects.length);
		objects.allObjects.forEach((item)=> item.draw());
	}
}

// functions of keyboard clicks

const keyDown =()=>{
	window.addEventListener('keydown', e => {
		switch(e.keyCode){
			case keys[1]: speed < 50 ? (acc = 1,player.rSpeed=(0.005*speed)) : acc=0;break;
			case keys[0]: position > 0 ? (speed > -10 ? (acc = -1,player.rSpeed=(-0.01*speed)) : acc=0): (acc = 0,speed=0,position=0);break;
		}
	});
}
window.addEventListener('keydown', e => {
		switch(e.keyCode){
			case keys[1]: speed < 50 ? (acc = 1,player.rSpeed=(0.005*speed)) : acc=0;break;
			case keys[0]: position > 0 ? (speed > -10 ? (acc = -1,player.rSpeed=(-0.01*speed)) : acc=0): (acc = 0,speed=0,position=0);break;
		}
	});

window.addEventListener('keyup', e => {
	switch (e.keyCode){
		case keys[1]: {
					var interval1 = setInterval(()=>{
							window.addEventListener('keydown',()=> clearInterval(interval1),keyDown());
							speed !== 0 ? acc=Math.sign(-speed) : (acc= 0,speed = 0,clearInterval(interval1));
						},10);
					};break;
		case keys[0]: {
					var interval2 = setInterval(()=>{
							window.addEventListener('keydown',()=> clearInterval(interval2),keyDown());
							speed !== 0 ? acc = Math.sign(-speed) : (acc= 0,clearInterval(interval2));
						},10);
					};break;
		}
	});

// function of mobile touches

class leftclass{
	start(){
			clearInterval(this.interval2);
			this.interval1 = setInterval(()=>{
				window.addEventListener('keydown',()=> clearInterval(this.interval1),keyDown());
				position > 0 ? (speed > -10 ? (acc = -1,player.rSpeed=(-0.01*speed)) : acc=0) : (acc = 0,speed=0,position=0);
			});

		}
	end(){
		clearInterval(this.interval1);
		this.interval2 = setInterval(()=>{
			speed !== 0 ? acc = Math.sign(-speed) : (acc = 0,speed = 0,clearInterval(this.interval2));
		},50);
	}
}

class rightclass{
	start(){
		clearInterval(this.interval2);
			this.interval1 = setInterval(()=>{
				speed < 50 ? (acc = 1,player.rSpeed=(0.005*speed)) : acc=0;
			});

		}
	end(){
		clearInterval(this.interval1);
		this.interval2 = setInterval(()=>{
			speed !== 0 ? acc=Math.sign(-speed) : (acc= 0,speed = 0,clearInterval(this.interval2));
		},10);
	}
}
const leftTouch = new leftclass();
leftBox.addEventListener('touchstart',()=>leftTouch.start());
leftBox.addEventListener('touchend',(e)=>leftTouch.end());

const rightTouch = new rightclass();
rightBox.addEventListener('touchstart',()=>rightTouch.start());
rightBox.addEventListener('touchend',(e)=>rightTouch.end());


// motion of car  
const loop =(time)=>{
	bg.time.start(time);
	bg.sky.draw();
	objects.add();
	bg.tile.draw();
	bg.dashboard.show();
	player.draw();
	coins.add();
	coins.collide();
	game.state ? requestAnimationFrame(loop): cancelAnimationFrame(loop);
	bg.time.end(time);
}
loop();￼Enter			case keys[1]: speed < 50 ? (acc = 1,player.rSpeed=(0.005*speed)) : acc=0;break;
			case keys[0]: position > 0 ? (speed > -10 ? (acc = -1,player.rSpeed=(-0.01*speed)) : acc=0): (acc = 0,speed=0,position=0);break;
		}
	});

window.addEventListener('keyup', e => {
	switch (e.keyCode){
		case keys[1]: {
					var interval1 = setInterval(()=>{
							window.addEventListener('keydown',()=> clearInterval(interval1),keyDown());
							speed !== 0 ? acc=Math.sign(-speed) : (acc= 0,speed = 0,clearInterval(interval1));
						},10);
					};break;
		case keys[0]: {
					var interval2 = setInterval(()=>{
							window.addEventListener('keydown',()=> clearInterval(interval2),keyDown());
							speed !== 0 ? acc = Math.sign(-speed) : (acc= 0,clearInterval(interval2));
						},10);
					};break;
		}
	});

// function of mobile touches

class leftclass{
	start(){
arInterval(this.interval2);
			this.interval1 = setInterval(()=>{
				window.addEventListener('keydown',()=> clearInterval(this.interval1),keyDown());
				position > 0 ? (speed > -10 ? (acc = -1,player.rSpeed=(-0.01*speed)) : acc=0) : (acc = 0,speed=0,position=0);
			});

		}
	end(){
		clearInterval(this.interval1);
		this.interval2 = setInterval(()=>{
			speed !== 0 ? acc = Math.sign(-speed) : (acc = 0,speed = 0,clearInterval(this.interval2));
		},50);
	}
}

class rightclass{
	start(){
		clearInterval(this.interval2);
			this.interval1 = setInterval(()=>{
				speed < 50 ? (acc = 1,player.rSpeed=(0.005*speed)) : acc=0;
			});

		}
	end(){
		clearInterval(this.interval1);
		this.interval2 = setInterval(()=>{
