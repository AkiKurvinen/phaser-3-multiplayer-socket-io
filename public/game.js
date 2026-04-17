const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 450,
  scale: {
    mode: Phaser.Scale.FIT, // Ensures the game scales to fit the div
    autoCenter: Phaser.Scale.CENTER_BOTH // Centers the game in the div
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 },
    },
  },
  scene: {
    preload,
    create,
    update
  }
}

const game = new Phaser.Game(config)

function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png')
  this.load.image('otherPlayer', 'assets/enemyBlack5.png')
  this.load.image('star', 'assets/star_gold.png')
  this.load.image('keyArrow', 'assets/arrow_key.png')
  this.load.image('keyBall', 'assets/ball_key.png')
}

function create() {
  this.controls = this.input.keyboard.createCursorKeys()

  this.otherPlayers = this.physics.add.group()
  this.socket = io()

  this.socket.on('currentPlayers', players => {
    Object.keys(players).forEach(id => {
      players[id].playerId === this.socket.id
        ? addPlayer(this, players[id])
        : addOtherPlayers(this, players[id])
    })
  })

  this.socket.on('newPlayer', player => addOtherPlayers(this, player))
  this.socket.on('disconnect', playerId => {
    this.otherPlayers.getChildren().forEach(oPlayer => {
      playerId === oPlayer.playerId
      oPlayer.destroy()
    })
  })

  this.socket.on('playerMoved', player => {
    this.otherPlayers.getChildren().forEach(oPlayer => {
      if (player.playerId === oPlayer.playerId) {
        oPlayer.setRotation(player.rotation)
        oPlayer.setPosition(player.x, player.y)
      }
    })
  })

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: 'blue' })
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: 'red' })

  this.socket.on('scoreUpdate', scores => {
    this.blueScoreText.setText(`Blue: ${scores.blue}`)
    this.redScoreText.setText(`Red: ${scores.red}`)
  })

  this.socket.on('starLocation', starLocation => {
    if (this.star) this.star.destroy()
    this.star = this.physics.add.image(starLocation.x, starLocation.y, 'star')
    this.physics.add.overlap(this.ship, this.star, () => {
      this.socket.emit('starCollected')
    }, null, this)
  })

  // Add touch buttons for mobile controls
  this.leftButton = this.add.image(50, 400, 'keyArrow').setInteractive();
  this.rightButton = this.add.image(150, 400, 'keyArrow').setInteractive();
  this.upButton = this.add.image(100, 350, 'keyArrow').setInteractive();

  // Rotate buttons for proper orientation
  this.leftButton.setRotation(-Math.PI / 2); // Point left
  this.rightButton.setRotation(Math.PI / 2); // Point right
  this.upButton.setRotation(0); // Point up

  // Scale buttons to be smaller
  this.leftButton.setScale(0.5);
  this.rightButton.setScale(0.5);
  this.upButton.setScale(0.5);

  // Adjust hitboxes to match the scaled button size
  this.leftButton.setSize(this.leftButton.width * this.leftButton.scaleX, this.leftButton.height * this.leftButton.scaleY);
  this.rightButton.setSize(this.rightButton.width * this.rightButton.scaleX, this.rightButton.height * this.rightButton.scaleY);
  this.upButton.setSize(this.upButton.width * this.upButton.scaleX, this.upButton.height * this.upButton.scaleY);

  // Add input listeners for touch controls
  this.leftButton.on('pointerdown', () => {
    this.controls.left.isDown = true;
    this.leftButton.setAlpha(0.5);
  });
  this.leftButton.on('pointerup', () => {
    this.controls.left.isDown = false;
    this.leftButton.setAlpha(1);
  });
  this.leftButton.on('pointerout', () => {
    this.controls.left.isDown = false;
    this.leftButton.setAlpha(1);
  });

  this.rightButton.on('pointerdown', () => {
    this.controls.right.isDown = true;
    this.rightButton.setAlpha(0.5);
  });
  this.rightButton.on('pointerup', () => {
    this.controls.right.isDown = false;
    this.rightButton.setAlpha(1);
  });
  this.rightButton.on('pointerout', () => {
    this.controls.right.isDown = false;
    this.rightButton.setAlpha(1);
  });

  this.upButton.on('pointerdown', () => {
    this.controls.up.isDown = true;
    this.upButton.setAlpha(0.5);
  });
  this.upButton.on('pointerup', () => {
    this.controls.up.isDown = false;
    this.upButton.setAlpha(1);
  });
  this.upButton.on('pointerout', () => {
    this.controls.up.isDown = false;
    this.upButton.setAlpha(1);
  });

  // Display hit area size for debugging
  this.add.graphics()
    .lineStyle(2, 0xff0000)
    .strokeRectShape(new Phaser.Geom.Rectangle(
      this.leftButton.x - this.leftButton.displayWidth / 2,
      this.leftButton.y - this.leftButton.displayHeight / 2,
      this.leftButton.displayWidth,
      this.leftButton.displayHeight
    ));

  this.add.graphics()
    .lineStyle(2, 0x00ff00)
    .strokeRectShape(new Phaser.Geom.Rectangle(
      this.rightButton.x - this.rightButton.displayWidth / 2,
      this.rightButton.y - this.rightButton.displayHeight / 2,
      this.rightButton.displayWidth,
      this.rightButton.displayHeight
    ));

  this.add.graphics()
    .lineStyle(2, 0x0000ff)
    .strokeRectShape(new Phaser.Geom.Rectangle(
      this.upButton.x - this.upButton.displayWidth / 2,
      this.upButton.y - this.upButton.displayHeight / 2,
      this.upButton.displayWidth,
      this.upButton.displayHeight
    ));
}

function update() {
  if (this.ship) {
    if (this.controls.left.isDown) {
      this.ship.setAngularVelocity(-150)
    } else if (this.controls.right.isDown) {
      this.ship.setAngularVelocity(150)
    } else {
      this.ship.setAngularVelocity(0)
    }

    if (this.controls.up.isDown) {
      this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration)
    } else {
      this.ship.setAcceleration(0)
    }

    this.physics.world.wrap(this.ship, 5)

    const pos = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    }

    if (this.ship.oldPosition && (
      pos.x !== this.ship.oldPosition.x ||
      pos.y !== this.ship.oldPosition.y ||
      pos.rotation !== this.ship.oldPosition.rotation
    )) {
      this.socket.emit('playerMovement', pos)
    }

    // save old position data
    this.ship.oldPosition = pos
  }
}

function addPlayer(game, player) {
  game.ship = game.physics.add.image(player.x, player.y, 'ship')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40)
  player.team === 'blue'
    ? game.ship.setTint(0x0000ff)
    : game.ship.setTint(0xff0000)
  game.ship.setDrag(100)
  game.ship.setAngularDrag(100)
  game.ship.setMaxVelocity(200)
}

function addOtherPlayers(game, oPlayer) {
  const otherPlayer = game.add.sprite(oPlayer.x, oPlayer.y, 'otherPlayer')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40)
  oPlayer.team === 'blue'
    ? otherPlayer.setTint(0x0000ff)
    : otherPlayer.setTint(0xff0000)
  otherPlayer.playerId = oPlayer.playerId
  game.otherPlayers.add(otherPlayer)
}