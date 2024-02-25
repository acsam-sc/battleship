import { getRoomsLength, updateRoomMessage } from '../services/rooms.js'

let users = []
let activeUsers = []

const isUserOnline = (name) => {
  return (activeUsers.filter(it => it.name === name).length === 1)
}

export const deleteActiveUser = async (wsId) => {
  try {
    activeUsers = activeUsers.filter(it => it.ws.id !== wsId)
    console.log(`deleteActiveUser ${wsId} activeUsers: ${JSON.stringify(activeUsers.map(it => it.name))}`)
  } catch (error) {
    console.log(`Error deleting active user: ${error}`)
  }
}

export const getUserByWsId = async (wsId) => {
  try {
    const user = activeUsers.filter(it => it.ws.id === wsId)[0]
    const { index, name } = user
    return Promise.resolve({ index, name })
  } catch (error) {
    console.log(`Error getting UserByWsId: ${error}`)
  }
}

export const sendMessageToUser = async (userIndex, message) => {
  try {
    const user = activeUsers.filter(it => it.index === userIndex)[0]
    await user.ws.send(message)
  } catch (error) {
    console.log(`Error getting sending MessageToUser: ${error}`)
  }
}

export const broadcast = async (message) => {
  try {
    activeUsers.map(it => it.ws.send(message))
  } catch (error) {
    console.log(`Error broadcasting message: ${error}`)
  }
}

export const updateWinnersMessage = () => {
  const winnersList = users.map(it => {
    return { name: it.name, wins: it.wins }
  })
  const winnersMessage = JSON.stringify({
      type: "update_winners",
      data:
        JSON.stringify(winnersList),
      id: 0,
  })
  return winnersMessage
}

export const registerUser = async (ws, user) => {
  const { name, password } = user
  const index = users.length
  try {
    if (typeof name === 'string' && typeof password === 'string') {
      //check if user already registered
      const filteredUser = users.filter(it => it.name === name)[0]
      //check if password for registered user is correct
      if (filteredUser && filteredUser.password === password) {
        //check if user already online
        if (isUserOnline(name)) {
          return Promise.reject('User is already connected')
        } else {
          //authenticated sucessfully
          activeUsers.push({ index: filteredUser.index, name, ws })
          return Promise.resolve(filteredUser)
        }
      } else if (filteredUser && filteredUser.password !== password) {
        //wrong password for registered user
        return Promise.reject('Wrong password')
      } else {
        //creating new user
        const newUser = { index, name, password, wins: 0 }
        users.push(newUser)
        activeUsers.push({ index, name, ws })
        await sendRegMessage(ws, user, false, '')
        await broadcast(updateWinnersMessage())
        console.log(`getRoomsLength: ${getRoomsLength()}`)
        if (getRoomsLength() > 0) broadcast(updateRoomMessage())
        return Promise.resolve(newUser)
      }
    } else Promise.reject('login and password should be strings')
  } catch {
    console.log(`error registering user: ${error}`)
  }
}

export const sendRegMessage = async (ws, user, error, errorText) => {
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
  try {
    ws.send(message)
  } catch (error) {
    console.log(`Error sending Reg Message: ${error}`)
  }
}