function setupUserInterface(game) {
    game.blueScoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: 'blue' })
    game.redScoreText = game.add.text(584, 16, '', { fontSize: '32px', fill: 'red' })

    game.playerNameLabel = game.add.text(300, 24, 'dd', { fontSize: '18px', fill: 'white' })

    const color_label_graphics = game.add.graphics();
    color_label_graphics.fillRect(200, 26, 50, 10);
    game.playerColorLabel = color_label_graphics;

    // Add touch buttons for mobile controls
    game.leftButton = game.add.image(50, 400, 'keyArrow').setInteractive();
    game.rightButton = game.add.image(150, 400, 'keyArrow').setInteractive();
    game.upButton = game.add.image(100, 350, 'keyArrow').setInteractive();

    // Rotate buttons for proper orientation
    game.leftButton.setRotation(-Math.PI / 2); // Point left
    game.rightButton.setRotation(Math.PI / 2); // Point right
    game.upButton.setRotation(0); // Point up

    // Scale buttons to be smaller
    game.leftButton.setScale(0.5);
    game.rightButton.setScale(0.5);
    game.upButton.setScale(0.5);

    // Adjust hitboxes to match the scaled button size
    game.leftButton.setSize(game.leftButton.width * game.leftButton.scaleX, game.leftButton.height * game.leftButton.scaleY);
    game.rightButton.setSize(game.rightButton.width * game.rightButton.scaleX, game.rightButton.height * game.rightButton.scaleY);
    game.upButton.setSize(game.upButton.width * game.upButton.scaleX, game.upButton.height * game.upButton.scaleY);

    // Add input listeners for touch controls
    game.leftButton.on('pointerdown', () => {
        game.controls.left.isDown = true;
        game.leftButton.setAlpha(0.5);
    });
    game.leftButton.on('pointerup', () => {
        game.controls.left.isDown = false;
        game.leftButton.setAlpha(1);
    });
    game.leftButton.on('pointerout', () => {
        game.controls.left.isDown = false;
        game.leftButton.setAlpha(1);
    });

    game.rightButton.on('pointerdown', () => {
        game.controls.right.isDown = true;
        game.rightButton.setAlpha(0.5);
    });
    game.rightButton.on('pointerup', () => {
        game.controls.right.isDown = false;
        game.rightButton.setAlpha(1);
    });
    game.rightButton.on('pointerout', () => {
        game.controls.right.isDown = false;
        game.rightButton.setAlpha(1);
    });

    game.upButton.on('pointerdown', () => {
        game.controls.up.isDown = true;
        game.upButton.setAlpha(0.5);
    });
    game.upButton.on('pointerup', () => {
        game.controls.up.isDown = false;
        game.upButton.setAlpha(1);
    });
    game.upButton.on('pointerout', () => {
        game.controls.up.isDown = false;
        game.upButton.setAlpha(1);
    });

    // Display hit area size for debugging
    game.add.graphics()
        .lineStyle(2, 0xff0000)
        .strokeRectShape(new Phaser.Geom.Rectangle(
            game.leftButton.x - game.leftButton.displayWidth / 2,
            game.leftButton.y - game.leftButton.displayHeight / 2,
            game.leftButton.displayWidth,
            game.leftButton.displayHeight
        ));

    game.add.graphics()
        .lineStyle(2, 0x00ff00)
        .strokeRectShape(new Phaser.Geom.Rectangle(
            game.rightButton.x - game.rightButton.displayWidth / 2,
            game.rightButton.y - game.rightButton.displayHeight / 2,
            game.rightButton.displayWidth,
            game.rightButton.displayHeight
        ));

    game.add.graphics()
        .lineStyle(2, 0x0000ff)
        .strokeRectShape(new Phaser.Geom.Rectangle(
            game.upButton.x - game.upButton.displayWidth / 2,
            game.upButton.y - game.upButton.displayHeight / 2,
            game.upButton.displayWidth,
            game.upButton.displayHeight
        ));
}
