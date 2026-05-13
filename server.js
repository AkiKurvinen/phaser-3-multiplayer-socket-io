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

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateRandomLobbyName = (length = 4) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const randomPos = () => ({
  x: Math.floor(Math.random() * GAMESIZE.width) + 50,
  y: Math.floor(Math.random() * GAMESIZE.height) + 50,
})

// ─── Lobby / Game State ──────────────────────────────────────────────────────

/**
 * games = {
 *   [lobbyCode]: {
 *     code: string,
 *     players: { [socketId]: PlayerObject },
 *     star: { x, y },
 *     scores: { blue: number, red: number },
 *     lastTeam: 'blue' | 'red',
 *   }
 * }
 */
const games = {}

function createGame(code) {
  games[code] = {
    code,
    players: {},
    star: randomPos(),
    scores: { blue: 0, red: 0 },
    lastTeam: 'blue',
  };
  return games[code];
}

function getOrCreateGame(code) {
  return games[code] ?? createGame(code);
}

function removePlayerFromGame(game, socketId) {
  delete game.players[socketId];
  // Clean up empty lobbies
  if (Object.keys(game.players).length === 0) {
    delete games[game.code];
    console.log(`Lobby ${game.code} deleted (empty)`);
  }
}

// ─── HTTP Routes ─────────────────────────────────────────────────────────────

app.use(express.static(`${__dirname}/public`))
app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`))

/** Create a new lobby and return its code. */
app.get('/lobby/create', (req, res) => {
  let code;
  // Avoid accidental collisions with existing lobbies
  do { code = generateRandomLobbyName(4); } while (games[code]);
  createGame(code);
  console.log(`Lobby created: ${code}`);
  res.json({ lobby: code });
});

/** List all active lobbies with player counts. */
app.get('/lobby/list', (req, res) => {
  const list = Object.values(games).map(g => ({
    code: g.code,
    playerCount: Object.keys(g.players).length,
    scores: g.scores,
  }));
  res.json(list);
});

/** Stats for a specific lobby. */
app.get('/lobby/stats/:lobby', (req, res) => {
  const game = games[req.params.lobby];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json({
    code: game.code,
    players: Object.values(game.players),
    scores: game.scores,
    star: game.star,
  });
});

server.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`))

// ─── Socket.IO ───────────────────────────────────────────────────────────────

io.on('connection', socket => {
  console.log(`${socket.id} connected`);

  // Client must send { username, color, lobby } in the handshake query.
  const { username, color, lobby: lobbyCode } = socket.handshake.query;

  if (!lobbyCode) {
    console.log(`${socket.id} rejected: no lobby provided`);
    socket.emit('error', { message: 'No lobby code provided.' });
    socket.disconnect(true);
    return;
  }

  const game = getOrCreateGame(lobbyCode);

  // Assign team (alternate per join)
  const team = game.lastTeam === 'blue' ? 'red' : 'blue';
  game.lastTeam = team;

  const player = {
    rotation: 0,
    ...randomPos(),
    playerId: socket.id,
    team,
    username: username || 'Anonymous',
    color: color || '#ffffff',
    lobby: lobbyCode,
  };

  game.players[socket.id] = player;

  // Join the socket.io room for this lobby
  socket.join(lobbyCode);
  console.log(`${username} (${socket.id}) joined lobby ${lobbyCode} as ${team}`);

  // Bootstrap the joining player
  socket.emit('currentPlayers', game.players);
  socket.emit('starLocation', game.star);
  socket.emit('scoreUpdate', game.scores);

  // Notify everyone else in the lobby
  socket.to(lobbyCode).emit('newPlayer', player);

  // ── Disconnect ────────────────────────────────────────────────────────────

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected from lobby ${lobbyCode}`);
    removePlayerFromGame(game, socket.id);
    io.to(lobbyCode).emit('playerDisconnected', socket.id);
  });

  // ── Movement ──────────────────────────────────────────────────────────────

  socket.on('playerMovement', data => {
    const p = game.players[socket.id];
    if (!p) return;
    p.x = data.x;
    p.y = data.y;
    p.rotation = data.rotation;
    socket.to(lobbyCode).emit('playerMoved', p);
  });

  // ── Star Collection ───────────────────────────────────────────────────────

  socket.on('starCollected', () => {
    const p = game.players[socket.id];
    if (!p) return;
    console.log(`${p.team} collected star in lobby ${lobbyCode}`);
    game.scores[p.team] += 10;
    Object.assign(game.star, randomPos());
    io.to(lobbyCode).emit('starLocation', game.star);
    io.to(lobbyCode).emit('scoreUpdate', game.scores);
  });

  // ── Color Change ──────────────────────────────────────────────────────────

  socket.on('colorChange', data => {
    const p = game.players[socket.id];
    if (!p) return;
    p.color = data.color;
    socket.to(lobbyCode).emit('playerColorUpdate', {
      playerId: socket.id,
      color: data.color,
    });
  });
});