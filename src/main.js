let config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [Menu, Play],
};
let highScore = 0;
let game = new Phaser.Game(config);
game.settings = {
    spaceshipSpeed: 3,
    gameTimer: 60000
}
//keyboard variables
let keyF, keyLEFT, keyRIGHT;