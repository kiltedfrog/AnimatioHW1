
function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, angle) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(this.frameWidth * this.scale, this.frameHeight * this.scale);
    var xOffset = 0;
    var yOffset = 0;

    if ((this.frameWidth * this.scale) > (this.frameHeight * this.scale)){
      yOffset = (this.frameWidth * this.scale) - (this.frameHeight * this.scale);
    } else if ((this.frameWidth*this.scale) < (this.frameHeight * this.scale)) {
      xOffset = (this.frameHeight * this.scale) - (this.frameWidth * this.scale);
    }

    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');

    var thirdCanvas = document.createElement('canvas');
    thirdCanvas.width = size;
    thirdCanvas.height = size;
    var thirdCtx = thirdCanvas.getContext('2d');

    thirdCtx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 0, 0,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(thirdCanvas, -(this.frameWidth*this.scale / 2), -(this.frameHeight*this.scale / 2));
    offscreenCtx.restore();
    thirdCtx.clearRect(0,0, size, size);
    ctx.drawImage(offscreenCanvas, x-(xOffset/2), y- (yOffset/2));


}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/* ========================================================================================================== */
// Background
/* ========================================================================================================== */
function Background(game, spritesheet) {

  this.animation = new Animation(spritesheet, 1920, 1080, 1920, 1, 1, true, 1);
  this.speed = 0;
  this.x = 0;
  this.y = 0;
  this.game = game;
  this.ctx = game.ctx;
  this.removeFromWorld = false;



};

Background.prototype.draw = function () {
  this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, this.angle);
  //Entity.prototype.draw.call(this);;
};

Background.prototype.update = function () {

    this.angle += 1.0;

};


/* ========================================================================================================== */
// Boss 1
/* ========================================================================================================== */
function Boss1(game, spritesheet){
  this.animation = new Animation(spritesheet, 200, 450, 1200, 0.175, 6, true, 1);
  this.x = 300;
  this.y = 175;
  this.speed = 0;
  this.angle = 0;
  this.game = game;
  this.ctx = game.ctx;
  this.removeFromWorld = false;
}
Boss1.prototype = new Entity();
Boss1.prototype.constructor = Boss1;

Boss1.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -230;
    //this.angle += .005

    Entity.prototype.update.call(this);
}

Boss1.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, this.angle);
    //Entity.prototype.draw.call(this);
}

function BossTurret(game, spritesheet, x, y){
  this.pWidth = 32;
  this.pHeight = 32;
  this.scale = 1.5;

  this.animation = new Animation(spritesheet, this.pWidth, this.pHeight, 675, 0.2, 21, true, this.scale);
  this.x = x;
  this.y = y;

  this.xMid = this.x + (this.pWidth * this.scale) / 2;
  this.yMid = this.y + (this.pHeight * this.scale) / 2;
  this.hitRadius = 16;
  this.speed = 0;
  this.angle = 0;
  this.game = game;
  this.ctx = game.ctx;
  this.removeFromWorld = false;
  this.health = 200;

}
BossTurret.prototype = new Entity();
BossTurret.prototype.constructor = Boss1;

BossTurret.prototype.update = function () {

    if(this.health < 1){
      this.removeFromWorld = true;
    }

    //this.x += this.game.clockTick * this.speed;
    //if (this.x > 800) this.x = -230;
    var dx = this.game.mousex - this.xMid-1;
    var dy = (this.yMid - this.game.mousey)-1;
    // this should be the angle in radians
    this.angle = -Math.atan2(dy,dx);
    //if we want it in degrees
    //this.angle *= 180 / Math.PI;


    if (this.game.wasclicked){
    //  console.log("the x of the turret: " + this.x  + " and the y: " + this.y);
      this.game.addEntity(new LaserBlast(this.game, AM.getAsset("./img/LaserBlast.png"),
                          this.xMid-(this.pWidth/2), this.yMid- (this.pHeight)/2, dx, dy, this.angle - Math.PI/2));

    }


    Entity.prototype.update.call(this);
}

BossTurret.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, this.angle);

    //Entity.prototype.draw.call(this);
}
function LaserBlast(game, spritesheet, xIn, yIn, dx, dy, angle){
  this.animation = new Animation(spritesheet, 32, 32, 128, 0.15, 4, true, 1);
  this.game = game;
  this.speedX = 1;
  this.speedY = 1;
  this.dx = dx/this.speedX;
  this.dy = -dy/this.speedY;
  this.ctx = game.ctx;
  this.x = xIn; //this.game.mousex - 22;
  this.y = yIn; //this.game.mousey;
  this.lifetime = 600;
  this.removeFromWorld = false;
  this.angle = angle;
}
LaserBlast.prototype = new Entity();
LaserBlast.prototype.constructor = LaserBlast;

LaserBlast.prototype.update = function () {
    this.x += this.game.clockTick * this.dx;
    this.y += this.game.clockTick * this.dy;

    if (this.x > 800) this.x = -230;
    if (this.y > 800) this.y = -230;
    this.lifetime = this.lifetime - 1;
    if (this.lifetime < 0){
      this.removeFromWorld = true;
    }

    Entity.prototype.update.call(this);
}

LaserBlast.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, this.angle);
    Entity.prototype.draw.call(this);
}

/* ========================================================================================================== */
// The Ship
/* ========================================================================================================== */
function TheShip(game, spritesheet) {
    this.animation = new Animation(spritesheet, 128, 128, 256, 0.03, 2, true, 1);
    this.speed = 0;
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.removeFromWorld = false;
    Entity.call(this, game, this.x, this.y);
}

TheShip.prototype = new Entity();
TheShip.prototype.constructor = TheShip;

TheShip.prototype.update = function () {
	if (this.game.moveUp) {
		this.y -= 10;
	}

	if (this.game.moveLeft) {
		this.x -= 10;
	}

	if (this.game.moveDown) {
		this.y += 10;
	}

	if (this.game.moveRight) {
		this.x += 10;
	}
    Entity.prototype.update.call(this);
}

TheShip.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

/* ========================================================================================================== */
// Asset Manager
/* ========================================================================================================== */
var AM = new AssetManager();
AM.queueDownload("./img/smartBomb.png");
AM.queueDownload("./img/space1-1.png");
AM.queueDownload("./img/shipIdle.png");
AM.queueDownload("./img/Boss1.png");
AM.queueDownload("./img/BossTurret.png");
AM.queueDownload("./img/LaserBlast.png");

AM.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/space1-1.png")));
    // gameEngine.addEntity(new TheShip(gameEngine, AM.getAsset("./img/shipIdle.png")));
    gameEngine.addEntity(new Boss1(gameEngine, AM.getAsset("./img/Boss1.png"), 0, 0));
    gameEngine.addEntity(new Boss1(gameEngine, AM.getAsset("./img/Boss1.png")));
    gameEngine.addEntity(new BossTurret(gameEngine, AM.getAsset("./img/BossTurret.png"), 375, 380));
    gameEngine.addEntity(new BossTurret(gameEngine, AM.getAsset("./img/BossTurret.png"), 310, 520));
    gameEngine.addEntity(new BossTurret(gameEngine, AM.getAsset("./img/BossTurret.png"), 375, 325));
    gameEngine.addEntity(new BossTurret(gameEngine, AM.getAsset("./img/BossTurret.png"), 435, 520));

    console.log("All Done!");
});
