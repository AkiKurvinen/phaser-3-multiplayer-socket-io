# Phaser.js real time multiplayer with socket.io
- Basic Multiplayer Game in Phaser 3 with Socket.io
- Repo: phaser-3-multiplayer-socket-io (updated 2026)  
- [Phaser.min.js 3.90.0](https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js) 
- [Socket.io.min.js 4.8.3](https://cdn.socket.io/4.8.3/socket.io.min.js) 

## Install & run
```bash
npm install
npm run dev
```
See game running [http://localhost:8080](http://localhost:8080)  

## Player customization
- Start game via form [http://localhost:8080/start.html](http://localhost:8080/start.html)
- Form send URL params to index.html e.g. ?username=testname&color=%23ff0000&lobby=testlobby

## Lobby creation
Visit lobby creation endpoint to get new lobby id:   
- [http://localhost:8080/lobby/create](http://localhost:8080/lobby/create)
- Response: {"lobby":"ABCD"}

Visit lobby stats endpoint to show players in lobby:
- [http://localhost:8080/lobby/stats/default](http://localhost:8080/lobby/stats/default)
- Replace "default" with actual lobby id e.g. "ABCD"

## Controls
```
Arrow Keys:
Left Arrow: Rotate the ship counterclockwise.
Right Arrow: Rotate the ship clockwise.
Up Arrow: Accelerate the ship forward.
```

## Credits
- [GitHub Repository by 8ctopotamus](https://github.com/8ctopotamus/phaser3-multiplayer)  
- [Tutorial on GameDev Academy](https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/)
