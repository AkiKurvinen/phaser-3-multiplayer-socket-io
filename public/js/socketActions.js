function setupSocketActions(game) {
    game.socket.on('currentPlayers', players => {
        Object.keys(players).forEach(id => {
            players[id].playerId === game.socket.id
                ? addPlayer(game, players[id])
                : addOtherPlayers(game, players[id]);
        });
    });

    game.socket.on('newPlayer', player => addOtherPlayers(game, player));

    game.socket.on('disconnect', playerId => {
        game.otherPlayers.getChildren().forEach(oPlayer => {
            if (playerId === oPlayer.playerId) {
                oPlayer.destroy();
            }
        });
    });

    game.socket.on('playerMoved', player => {
        game.otherPlayers.getChildren().forEach(oPlayer => {
            if (player.playerId === oPlayer.playerId) {
                oPlayer.setRotation(player.rotation);
                oPlayer.setPosition(player.x, player.y);
            }
        });
    });

    game.socket.on('scoreUpdate', scores => {
        game.blueScoreText.setText(`Blue: ${scores.blue}`);
        game.redScoreText.setText(`Red: ${scores.red}`);
    });

    game.socket.on('starLocation', starLocation => {
        if (game.star) game.star.destroy();
        game.star = game.physics.add.image(starLocation.x, starLocation.y, 'star');
        game.physics.add.overlap(game.ship, game.star, () => {
            game.socket.emit('starCollected');
        }, null, game);
    });

    game.socket.on('playerColorUpdate', data => {
        const player = game.otherPlayers.getChildren().find(p => p.playerId === data.playerId);
        if (player) {
            const glowColor = data.color;
            player.preFX.clear(); // Clear existing effects
            player.preFX.addGlow(glowColor, 4, 2, false); // Apply new glow
        }
    });
}

function addPlayer(game, player) {
    const glowColor = Phaser.Display.Color.HexStringToColor(player.color);
    game.ship = game.physics.add.image(player.x, player.y, 'ship')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);
    player.team === 'blue'
        ? game.ship.setTint(0x0000ff)
        : game.ship.setTint(0xff0000);
    game.ship.setDrag(100);
    game.ship.setAngularDrag(100);
    game.ship.setMaxVelocity(200);
    game.ship.preFX.addGlow(glowColor.color, 4, 2, false);
    game.socket.emit('colorChange', { color: glowColor.color });
    game.playerColorLabel.fillStyle(glowColor.color, 1);
    game.playerColorLabel.fillRect(292, 26, 50, 10);
    game.playerNameLabel.setText(player.username);
}

function addOtherPlayers(game, oPlayer) {
    const otherPlayer = game.add.sprite(oPlayer.x, oPlayer.y, 'otherPlayer')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);
    oPlayer.team === 'blue'
        ? otherPlayer.setTint(0x0000ff)
        : otherPlayer.setTint(0xff0000);
    otherPlayer.playerId = oPlayer.playerId;
    game.otherPlayers.add(otherPlayer);
    console.log("color: " + oPlayer.color);
    //const glowColor = Phaser.Display.Color.HexStringToColor(oPlayer.color);
    otherPlayer.preFX.addGlow(oPlayer.color, 4, 2, false);
}