class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);

        //add an object to the scene, displayList, updateList
        scene.add.existing(this);
        this.isFiring = false;
        //add the sound from the scene that made this
        this.sfxRocket = scene.sound.add('sfx_rocket');
    }

    update(){
        //need moving, firing.
        if(!this.isFiring){
            if(keyLEFT.isDown && this.x >= 47){
                this.x -= 2;
            }
            else if(keyRIGHT.isDown && this.x <= 578){
                this.x += 2;
            }
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
        }
    }

    //runs after colliding with spaceship
    reset(){
        this.isFiring = false;
        this.y = 431;
    }
}