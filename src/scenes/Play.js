class Play extends Phaser.Scene{
    constructor (){
        super ("playScene");
    }
    //this comment was added just so I could do a git pull

    preload(){
        //load images/tile sprite
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth:64, frameHeight:32,
             startFrame:0, endFrame:9});

        //load particle
        this.load.image('debris', './assets/particle.png');
        //Load other particle for exhaust
        this.load.image('exhaust', './assets/particle2.png')
    }

    create(){
        //if(typeof this.highScore === 'undefined')
        //    this.highScore = 0;
        //place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0,0);

        //Define the particles for explosions
        this.explodParticles = this.add.particles('debris');

        //Also for ship exhaust
        this.exhaust = this.add.particles('exhaust');

        //white rectangle borders
        this.add.rectangle(5, 5, 630, 32, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(5, 433, 630, 32, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(5, 5, 32, 455, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(603, 5, 32, 455, 0xFFFFFF).setOrigin(0,0);
        //green background
        this.add.rectangle(37,42,566,64,0x00FF00).setOrigin(0,0);

        //add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, 431, 'rocket').setScale(.5, .5);

        //add spaceships
        this.ships = [new Spaceship(this, game.config.width + 192, 132, 'spaceship', 0, 30).setOrigin(0,0), 
                      new Spaceship(this, game.config.width + 96, 196, 'spaceship', 0, 20).setOrigin(0,0),
                      new Spaceship(this, game.config.width, 260, 'spaceship', 0, 10).setOrigin(0,0)];
        
        //Establish standard emitter config for all spaceships
        let stdExhaust = {
            speed:20,
            lifespan: 250,
            gravityX: 100,
            quantity: 1,
            frequency: 3,
        }
        //then give the spaceships all exhausts
        this.ships.forEach((ship) => {
            ship.exhaust = this.exhaust.createEmitter(stdExhaust);
            ship.exhaust.startFollow(ship, 68, 16);
        })

        //define all the keyboard keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        //adds explosion to the scene
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {start:0, end:9, first:0}),
            frameRate: 30
        });

        //establish score.
        this.score = [0,0];
        //Sets the current index for which score to track
        this.scoreIndex = 0;
        //then set up the display
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        //this tells the game what to display and how to display it?
        this.scoreLeft = this.add.text(69, 54, this.score[this.scoreIndex], scoreConfig);

        //Also want to display the multiplier
        this.multi = this.add.text(220, 54, 1 + "x", scoreConfig);


        //And display the time remaining
        this.timeDisp = this.add.text(360, 54, game.settings.gameTimer/1000, scoreConfig);

        //Also high score somewhere
        this.hiDisplay = this.add.text(480, 54, "HS: " + highScore, scoreConfig);

        //game over flag
        this.gameOver = false;
        //Side done flag
        this.paused = false;
        //clock for the game
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, ()=>{
            this.midText1 = this.add.text(game.config.width/2, game.config.height/2, 'P1 Finished', scoreConfig).setOrigin(0.5);
            this.midText2 = this.add.text(game.config.width/2, game.config.height/2 + 64, 'P2 starts in 5 seconds', scoreConfig).setOrigin(0.5);
            this.paused = true;
            this.p1Rocket.multiplier = 1;
            this.multi.text = 1 + "x";

        }, null, this);

        //Clock timed to start 2nd player
        this.gapClock = this.time.delayedCall(game.settings.gameTimer + 5000, ()=>{
            this.paused = false;
            this.scoreIndex = 1;
            this.midText1.alpha = 0;
            this.midText2.alpha = 0;
            this.p1Rocket.x = game.config.width/2;
        }, null, this);

        //clock to run down for 2-player game
        this.globClock = this.time.delayedCall(game.settings.gameTimer * 2 + 5000, ()=>{
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, '(F)ire to Restart or ← for Menu', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 128,
                           'P1 score: '+ this.score[0] + ", P2 score: "+this.score[1], scoreConfig).setOrigin(0.5);
            this.gameOver = true;
            this.paused = true;
            highScore = Math.max(this.score[0], this.score[1]);
            this.hiDisplay.text = "HS: " + this.highScore;
        }, null, this);


    }

    update(currTime, dT){
        //handle post-game choices.
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyF)){
            this.scene.restart(this.score);
            this.scene.restart(this.multi);
            this.scene.restart(this.scoreIndex);
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
        //scroll starfield
        this.starfield.tilePositionX -= 4;
        //update rocket
        if(!this.paused){
            if(this.p1Rocket.update())
                this.multi.text = 1 + "x";
        }

        //update all the ships
        this.ships.forEach((ship, index) => {
            ship.update();
            if(this.checkCollision(this.p1Rocket, ship)){
                this.p1Rocket.reset();
                this.shipExplode(ship);

                //add the score
                this.score[this.scoreIndex] += ship.points * this.p1Rocket.multiplier;
                this.scoreLeft.text = this.score[this.scoreIndex];
                //Then figure out how multiplier should change.
                //If this is the first hit after a miss, or first ever, or same as prior, add 10% of the points
                if(this.p1Rocket.lastHit == -1 || this.ships[this.p1Rocket.lastHit] == ship)
                    this.p1Rocket.multiplier += ship.points/10;
                //If it's a new ship, add twice as much
                //Could be done without an else, but this is clearer
                else
                    this.p1Rocket.multiplier += ship.points/5;
                this.p1Rocket.lastHit = index;
                this.multi.text = this.p1Rocket.multiplier + "x";
            }
        });

        //Update the displayed time
        //If the game is over, should just show 0
        if(!this.paused){
            if(this.scoreIndex == 0)
                this.timeDisp.text = 1 + Math.floor((game.settings.gameTimer - this.clock.getElapsed())/1000);
            else
                this.timeDisp.text = 1 + Math.floor((game.settings.gameTimer * 2 + 5000 - this.globClock.getElapsed())/1000);
        }
        else
            this.timeDisp.text = "0";
    }

    checkCollision(rocket, ship){
        //Simple fake rectangle collision checking
        if(rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height&&
            rocket.height + rocket.y > ship.y){
            return true;
        }
        return false;
    }

    shipExplode(ship){
        //hide the ship since it's blowing up
        ship.alpha = 0;
        ship.exhaust.visible = 0;
        //make the explosion on the invisible ship
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0,0);
        //Make the explosion particles
        this.explodParticles.createEmitter({
            x: ship.x,
            y: ship.y,
            lifespan: 500,
            speed: {min: 20, max:100},
            gravityY: 300, 
            quantity: 3,
            frequency: 0,
        }).explode();
        boom.anims.play('explode'); //make the explosion happen
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha=1;
            //ship.exhaust.visible = 1;
            this.time.addEvent({
                delay: 250,
                callback: ()=>{
                    ship.exhaust.visible = 1;
                }
            })
            boom.destroy();
        });
        
        this.sound.play('sfx_explosion');
    }
}

