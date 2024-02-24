let users = []
let activeUsers = []

const isUserOnline = (name) => {
  return (activeUsers.filter(it => it.name === name).length === 1)
}

export const getAllUsers = () => {
  return users
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

export const getUserByName = async (name) => {
  try {
    const user = activeUsers.filter(it => it.name === name)[0]
    return Promise.resolve(user)
  } catch (error) {
    console.log(`Error getting UserByName: ${error}`)
  }
}

export const broadcast = async (message) => {
  try {
    activeUsers.map(it => it.ws.send(message))
  } catch (error) {
    console.log(`Error broadcasting message: ${error}`)
  }
}

export const registerUser = async (ws, user) => {
  // console.log(`WS: ${JSON.stringify(ws)}`)
  const { name, password } = user
  const index = users.length
  console.log(`registerUser userindex: ${index}, name: ${name}, password: ${password}`)
  // console.log(`registerUser activeUsers: ${JSON.stringify(activeUsers)}`)

  try {
    if (typeof name === 'string' && typeof password === 'string') {
      //check if user already registered
      const filteredUser = users.filter(it => it.name === name)[0]
      console.log(`filteredUser: ${JSON.stringify(filteredUser)}`)
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
        console.log(`users pushed, activeUsers: ${JSON.stringify(activeUsers.map(it => it.name))}`)
        return Promise.resolve(newUser)
      }
    } else Promise.reject('login and password should be strings')
  } catch {
    console.log(`error registering user: ${error}`)
  }
}
