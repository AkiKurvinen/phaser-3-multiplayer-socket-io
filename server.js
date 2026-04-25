const express = require('express')
const app = express()
const server = require('http').Server(app)
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const GAMESIZE = { width: 800, height: 450 }
const PORT = process.env.PORT || 8080

app.use(express.static(`${__dirname}/public`))

app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`))

server.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`))

const players = {}
const star = {
  x: Math.floor(Math.random() * GAMESIZE.width) + 50,
  y: Math.floor(Math.random() * GAMESIZE.height) + 50,
}
const scores = {
  blue: 0,
  red: 0
}
let lastTeam = 'blue';
io.on('connection', socket => {
  console.log(`${socket.id} connected`)
  const { username, color } = socket.handshake.query;
  console.log(`Player connected: ${username}, Color: ${color}`);
  const team = lastTeam === 'blue' ? 'red' : 'blue';
  lastTeam = team;
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * GAMESIZE.width) + 50,
    y: Math.floor(Math.random() * GAMESIZE.height) + 50,
    playerId: socket.id,
    team: team,
    username: username,
    color: color
  }
  // send players obj to the new player
  socket.emit('currentPlayers', players)
  // send the star object to the new player
  socket.emit('starLocation', star)
  // send the current scores
  socket.emit('scoreUpdate', scores)
  // update all other players with new player
  socket.broadcast.emit('newPlayer', players[socket.id])
  // disconnect
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`)
    delete players[socket.id]
    io.emit('playerDisconnected', socket.id)
  })
  // when a player moves, update the player data
  socket.on('playerMovement', data => {
    const p = players[socket.id]
    p.x = data.x
    p.y = data.y
    p.rotation = data.rotation
    // emit message to all player about the player that moved
    socket.broadcast.emit('playerMoved', p)
  })

  socket.on('starCollected', () => {
    console.log(players[socket.id].team + ' collected star')
    scores[players[socket.id].team] += 10
    star.x = Math.floor(Math.random() * GAMESIZE.width) + 50
    star.y = Math.floor(Math.random() * GAMESIZE.height) + 50
    io.emit('starLocation', star)
    io.emit('scoreUpdate', scores)
  })

  socket.on('colorChange', data => {
    // Update the player's color on the server
    if (players[socket.id]) {
      players[socket.id].color = data.color;

      // Broadcast the color update to all other players
      socket.broadcast.emit('playerColorUpdate', {
        playerId: socket.id,
        color: data.color
      });
    }
  });
})
