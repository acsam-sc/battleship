import {
  registerUser,
  getUserByWsId,
  broadcast,
  getAllUsers,
  sendMessageToUser
} from '../services/users.js'

let rooms = []

const sendRegMessage = async (ws, user, error, errorText) => {
  // console.log(`sendRegMessage data: ${JSON.stringify(user)}`)
  const { name, index } = user
  const message = JSON.stringify({
    type: "reg",
    data:
        JSON.stringify({
            name,
            index,
            error,
            errorText
        }),
    id: 0,
  })
  console.log(`sendRegMessage message: ${JSON.stringify(message)}`)
  try {
    ws.send(message)
  } catch (error) {
    console.log(`Error sending Reg Message: ${error}`)
  }
}

const createRoom = async (roomId, user) => {
  console.log(`createRoomFunc: roomId: ${roomId}, user: ${JSON.stringify(user)}`)
  if (rooms.length === 0 || rooms.filter(it => it.roomUsers[0].name === user.name).length === 0) {
    rooms.push(
      {
          roomId,
          roomUsers: [user]
      }
    )
    await broadcast(updateRoomMessage())
  console.log(`createRoom rooms after push: ${JSON.stringify(rooms)}`)
  }
}

const addUserToRoom = async (roomId, user) => {
  console.log(`addUserToRoom: roomId: ${roomId}, user: ${JSON.stringify(user)}`)
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
      }
  } catch (error) {
    console.log(`Error adding user to room: ${error}`)
  }

  console.log(`addUserToRoom: ${JSON.stringify(rooms)}`)
}

const updateRoomMessage = () => {
  const availableRooms = rooms.filter(it => it.roomUsers.length === 1)
  const message = JSON.stringify({
    type: "update_room",
    data: JSON.stringify(availableRooms),
    id: 0,
  })
  return message
}

const updateWinnersMessage = () => {
  const users = getAllUsers()
  const winnersList = users.map(it => {
    return { name: it.name, wins: it.wins }
  })
  const winnersMessage = JSON.stringify({
      type: "update_winners",
      data:
        JSON.stringify(winnersList),
      id: 0,
  })
  console.log(`sending winners: ${JSON.stringify(winnersMessage)}`)
  return winnersMessage
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

const addShipsToRoom = (data) => {
  rooms = rooms.map(room => {
    if (room.roomId === data.gameId) {
      room.roomUsers.map(user => {
        if (user.index === data.indexPlayer) {
          const userWithShips = Object.assign(user, { ships: data.ships })
          return { ...room, roomUsers: [ ...room.roomUsers, userWithShips] }
        }
      })
    }
    return room
  })
}

export const handleMessage = async (ws, message) => {
  try {
    if (message.type === 'reg') {
      const user = JSON.parse(message.data)
      await registerUser(ws, user)
      .then(async (user) => {
        await sendRegMessage(ws, user, false, '')
        await broadcast(updateWinnersMessage())
        if (rooms.length > 0) broadcast(updateRoomMessage())
      })
      .catch((error) => sendRegMessage(ws, user, true, error))
      // console.log(`newUser: ${JSON.stringify(newUser)}`)
      // await sendRegMessage(ws, newUser, false, '')
    } else if (message.type === 'create_room') {
      const roomIndex = rooms.length
      const user = await getUserByWsId(ws.id)
      // console.log(`userForCreateRoom: ${JSON.stringify(user)}`)
      await createRoom(roomIndex, user)
      // sendUpdateRoom(ws)
      // await broadcast(updateRoomMessage())
    } else if (message.type === 'add_user_to_room') {
      const roomIndex = JSON.parse(message.data).indexRoom
      const user = await getUserByWsId(ws.id)
      // console.log(`userForCreateRoom: ${JSON.stringify(user)}`)
      await addUserToRoom(roomIndex, user)
      // await broadcast(updateRoomMessage())
      // await sendCreateGame(roomIndex)
    } else if (message.type === 'add_ships') {
      const data = JSON.parse(message.data)
      addShipsToRoom(data)
      console.log(`rooms after adding ships: ${JSON.stringify(rooms)}`)
    }
  } catch (error) {
    console.log(`Error handling message: ${error}`)
  }
}