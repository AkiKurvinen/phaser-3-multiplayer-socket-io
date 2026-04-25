const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 450,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
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

const default_usernames = ['StarBlazer', 'CosmoCruiser', 'NebulaRider', 'GalaxyHawk', 'VoidRunner']
const default_colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#c000c0']

// Extract query parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username') || default_usernames[Math.floor(Math.random() * default_usernames.length)];
let color = urlParams.get('color') || default_colors[Math.floor(Math.random() * default_colors.length)];

function create() {
  this.controls = this.input.keyboard.createCursorKeys()

  this.otherPlayers = this.physics.add.group()

  // Pass extracted parameters to the socket connection
  this.socket = io('http://localhost:8080', {
    query: {
      username,
      color
    }
  });
  setupSocketActions(this)
  setupUserInterface(this)
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
