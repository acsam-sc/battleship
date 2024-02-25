import { broadcast, sendMessageToUser } from '../services/users.js'

let rooms = []

export const getRoomsLength = () => rooms.length

export const createRoom = async (user) => {
  const roomId = rooms.length
  if (rooms.length === 0 || rooms.filter(it => it.roomUsers[0].name === user.name).length === 0) {
    rooms.push(
      {
        roomId,
        roomUsers: [user]
      }
    )
    await broadcast(updateRoomMessage())
    console.log(`Created new room with ID=${roomId}`)
    console.log(`Player "${user.name}" has been added to the Room ID=${roomId}`)
  }
}

const sendCreateGame = async (roomId) => {
  const createGameMessage = (idPlayer) => JSON.stringify({
    type: "create_game",
    data:
      JSON.stringify({
        idGame: roomId,  
        idPlayer
      }),
    id: 0,
})
try {
  rooms.map(it => {
    if (it.roomId === roomId) it.roomUsers.map(async it => {
      sendMessageToUser(it.index, createGameMessage(it.index))
    })
  })
  } catch (error) {
    console.log(`Error sending Create Game Message: ${error}`)
  }
}

const sendStartGame = (currentPlayerIndex, ships) => {
  const message = JSON.stringify({
    type: "start_game",
    data: JSON.stringify({ ships, currentPlayerIndex }),
    id: 0
  })
  sendMessageToUser(currentPlayerIndex, message)
}

export const addUserToRoom = async (roomId, user) => {
  const filteredRoom = rooms.filter(it => it.roomId === roomId)[0]
  try {
      if (filteredRoom.roomUsers[0].name !== user.name) {
        rooms = rooms.map(it => {
          if (it.roomId === roomId) {
            return { ...it, roomUsers: [ ...it.roomUsers, user ] }
          } else return it
        })
        await broadcast(updateRoomMessage())
        await sendCreateGame(roomId)
        console.log(`Player "${user.name}" has been added to the Room ID=${roomId}`)
      }
  } catch (error) {
    console.log(`Error adding user to room: ${error}`)
  }
}

export const updateRoomMessage = () => {
  const availableRooms = rooms.filter(it => it.roomUsers.length === 1)
  const message = JSON.stringify({
    type: "update_room",
    data: JSON.stringify(availableRooms),
    id: 0,
  })
  return message
}

export const addShipsToUser = (data) => {
  rooms = rooms.map(room => {
    if (room.roomId === data.gameId) {
      room.roomUsers.map(user => {
        if (user.index === data.indexPlayer) {
          const userWithShips = Object.assign(user, { ships: data.ships })
          console.log(`Ships for player "${user.name}" has been added to Game ID=${data.gameId}`)
          return { ...room, roomUsers: [ ...room.roomUsers, userWithShips] }
        }
      })
    }
    return room
  })
  const filteredRoom = rooms.filter(room => room.roomId === data.gameId)[0]
  const usersWithShipsCount = filteredRoom.roomUsers.reduce((acc, rec) => {
    if (Object.keys(rec).includes('ships')) return acc + 1
    return acc
  }, 0)
  if (usersWithShipsCount === 2) {
    filteredRoom.roomUsers.map(user => sendStartGame(user.index, user.ships))
    rooms = rooms.map(it => {
      if (it.roomId === data.gameId) return Object.assign(it, { usersTurn: data.indexPlayer } )
    })
    broadcast(turnMessage(data.indexPlayer))
  }
}

const turnMessage = (currentPlayer) => {
  const message = JSON.stringify({
    type: "turn",
    data:
        JSON.stringify({
            currentPlayer
        }),
    id: 0,
  })
  return message
}