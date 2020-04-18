class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);

        //add an object to the scene, displayList, updateList
        scene.add.existing(this);
        this.isFiring = false;
        //add the sound from the scene that made this
        this.sfxRocket = scene.sound.add('sfx_rocket');
        

        //Combo system, multipler starts at 1
        this.multiplier = 1;

        //Also need to track last ship hit, for efficiency do it by index
        // -1 means no last hit
        this.lastHit = -1;
    }

    update(){
        //need moving, firing.

        if(keyLEFT.isDown && this.x >= 47){
            if(this.isFiring)
                this.x -= 1;
            else
                this.x -= 2;
        }
        else if(keyRIGHT.isDown && this.x <= 578){
            if(this.isFiring)
                this.x += 1;
            else
                this.x += 2;
        }
        //firing
        if(Phaser.Input.Keyboard.JustDown(keyF) && !this.isFiring){
            this.isFiring = true;
            this.sfxRocket.play();
        }
        //move if firing
        if(this.isFiring && this.y >= 108){
            this.y -= 2;
        }
        //if we didn't hit, reset rocket if hit ceiling
        if(this.y <= 108){
            this.reset();
            this.lastHit = -1;
            this.multiplier = 1;
        }
    }

    //runs after colliding with spaceship
    reset(){
        this.isFiring = false;
        this.y = 431;
    }
}