Array.prototype.remove=function(a,b){var c=this.slice((b||a)+1||this.length);this.length=a<0?this.length+a:a;return this.push.apply(this,c)};var fps=30;var container=document.getElementById("container");var board=document.getElementById("board");var wallNumber=15;var gumNumber=15;var boardWidth=800;var boardHeight=580;var level=1;var highScore=99.99;var unitHeight=30;var gums=[];var walls=[];var timer;var ballImg=new Image;var wallImg=new Image;var gumImg=new Image;ballImg.style.position="absolute";ballImg.className="ball";gumImg.style.position="absolute";gumImg.className="gum";wallImg.style.position="absolute";wallImg.className="wall";var setLevel=function(a){level=a;boule.speed=500+a*50;document.getElementById("level").innerHTML=level+1};var start=function(){container.className="";watch.start();if(!timer){timer=setInterval(function(){boule.animate();checkCollisions()},1e3/fps)}};var setDisplay=function(a,b){var c=document.getElementsByClassName(a);for(i=0;i<c.length;i++){c[i].style.display=b}};var showDialog=function(a){setDisplay("dialog","none");setDisplay("modal","block");document.getElementById(a).style.display="inline-block"};var win=function(){stop();var a=Math.round(watch.elapsed/10)/100;highScore=Math.min(highScore,a);document.getElementById("score").innerHTML=a;document.getElementById("high_score").innerHTML=highScore;showDialog("win");setLevel(level+1)};var lose=function(){stop();container.className="crash";setTimeout(function(){showDialog("lose")},1500);setLevel(0)};var stop=function(){watch.stop();if(timer){clearInterval(timer);timer=null}};var watch={start_time:0,elapsed:0,start:function(){this.start_time=(new Date).getTime()},stop:function(){this.elapsed=(new Date).getTime()-this.start_time}};var boule={x:0,y:0,w:unitHeight,h:unitHeight,speed:0,draw:function(){var a=this.dom.style;a.top=this.y+"px";a.left=this.x+"px"},animate:function(){this.x+=parseInt(this.speed/fps);if(this.x<=0){this.speed=-this.speed;this.x=0}else if(this.x>=boardWidth-this.w){this.speed=-this.speed;this.x=boardWidth-this.w}this.draw()},up:function(){if(this.y>=this.h){this.y=this.y-this.h}},down:function(){if(this.y<=boardHeight-2*this.h){this.y=this.y+this.h}}};var checkCollisions=function(){if(findCollision(boule.x,boule.y,boule.w,boule.h,walls)!==null){lose();return}var a=findCollision(boule.x,boule.y,boule.w,boule.h,gums);if(a!==null){var b=gums[a];b.dom.style.width="0";b.dom.style.marginLeft="15px";b.dom.style.marginTop="15px";gums.remove(a,a);if(gums.length==0){win()}boule.speed=-boule.speed}};var findCollision=function(a,b,c,d,e){for(var f=0;f<e.length;f++){var g=e[f];var h=a+c>g.x&&a<g.x+g.w;var i=b+d>g.y&&b<g.y+g.h;if(h&&i){return f}}return null};var ready=function(){container.className="ready"};var drawWall=function(a){var b=wallImg.cloneNode(true);b.style.left=walls[a].x+"px";b.style.top=walls[a].y+"px";board.appendChild(b);walls[a].dom=b;if(a<walls.length-1){setTimeout(function(){drawWall(a+1)},50)}else{setTimeout(function(){drawGum(0)},50)}};var drawGum=function(a){var b=gumImg.cloneNode(true);b.style.left=gums[a].x+"px";b.style.top=gums[a].y+"px";board.appendChild(b);gums[a].dom=b;if(a<gums.length-1){setTimeout(function(){drawGum(a+1)},50)}else{ready()}};var startDrawing=function(){drawWall(0)};var randomX=function(){return Math.floor(Math.random()*(boardWidth-unitHeight))};var randomY=function(){return Math.floor(Math.random()*((boardHeight-unitHeight)/unitHeight))*unitHeight};var reset=function(){container.className="";board.innerHTML="";var a=2*unitHeight;boule.x=randomX();boule.y=0;boule.targetY=boule.y;boule.dom=ballImg.cloneNode(true);board.appendChild(boule.dom);boule.draw();gums=[];for(var b=0;b<gumNumber;b++){var c;do{c={x:randomX(),y:randomY(),w:unitHeight,h:unitHeight}}while(findCollision(c.x-a,c.y-a,c.w+2*a,c.h+2*a,gums)!==null);gums[b]=c}walls=[];for(var b=0;b<wallNumber;b++){var d;do{d={x:randomX(),y:randomY(),w:unitHeight,h:unitHeight}}while(findCollision(d.x-a,d.y-a,d.w+2*a,d.h+2*a,gums)!==null||findCollision(d.x-a,d.y-a,d.w+2*a,d.h+2*a,walls)!==null||d.y<=boule.y+boule.h&&d.y+d.h>=boule.y);walls[b]=d}setTimeout(startDrawing,1e3)};var loadImages=function(a){var b=0;var c=function(){b++;if(b==3){a()}};ballImg.addEventListener("load",c,false);wallImg.addEventListener("load",c,false);gumImg.addEventListener("load",c,false);ballImg.src="ball.png";wallImg.src="wall.png";gumImg.src="smiley.png"};var init=function(){setLevel(0);document.addEventListener("keydown",function(a){if(a.keyCode==38){boule.up();return false}if(a.keyCode==40){boule.down();return false}if(a.keyCode==32&&container.className=="ready"){start();return false}},false);var a=document.getElementsByClassName("try_again");for(i=0;i<a.length;i++){a[i].addEventListener("click",function(){setDisplay("modal","none");reset();return false},false)}loadImages(reset)};init()