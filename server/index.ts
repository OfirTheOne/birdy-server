
import * as http from 'http';
import * as socket from 'socket.io';
import { Dictionary } from 'ts-essentials'

import { app } from './app'

const server = new http.Server(app)
const PORT = Number(process.env.PORT) || 8000


const io = socket(server)

server.listen(PORT, "0.0.0.0", undefined, () => console.log('Game server running on:', PORT))

const players: Dictionary<TransferredPlayer> = {}

io.on('connection', socket => {

  socket.on('new-player', state => {
    console.log('New player joined with state:', state)
    players[socket.id] = state
    // Emit the update-players method in the client side
    io.emit('update-players', players)
  })

  socket.on('disconnect', state => {
    console.log('Player left with ID:', socket.id)

    delete players[socket.id]
    io.emit('player-disconnect', {playerId: socket.id})
  })

  socket.on('change-player-state', data => {

    
    if (
          (players[socket.id] === undefined) ||  
          (!isStateChange(players[socket.id], data))
      ) {
      return;
    }
    players[socket.id] = data; 

    io.emit('update-players', players)
  })
})

export interface TransferredPlayer {

  x: number;
  y: number;
  moveForce: number;
  velocity: any;

  // isDownKeyDown: boolean;
  isPlayerOnGround: boolean;
  isLeftKeyDown: boolean;
  isRightKeyDown: boolean;
  isJumpKeyDown: boolean;

  name: string;
}

function isStateChange(currentState: Dictionary<any>, incomingState: Dictionary<any>) {

  const isChange = Object.keys(currentState).some(
    (key) => {
      if (typeof currentState[key] != 'object') {
        return currentState[key] != incomingState[key]
      } else {
        isStateChange(currentState[key], incomingState[key])
      }
    }
  );
  return isChange;
}