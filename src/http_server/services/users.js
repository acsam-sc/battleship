let users = []
let activeUsers = []

const isUserOnline = (name) => {
  return (activeUsers.filter(it => it.name === name).length === 1)
}

export const deleteActiveUser = async (wsId) => {
  try {
    activeUsers = activeUsers.filter(it => it.ws !== wsId)
    console.log(`deleteActiveUser ${wsId} activeUsers: ${JSON.stringify(activeUsers)}`)
  } catch (error) {
    console.log(`Error deleting active user: ${error}`)
  }
}

export const registerUser = async (wsId, user) => {
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
          activeUsers.push({ name, ws: wsId })
          return Promise.resolve(filteredUser)
        }
      } else if (filteredUser && filteredUser.password !== password) {
        //wrong password for registered user
        return Promise.reject('Wrong password')
      } else {
        //creating new user
        const newUser = { index, name, password }
        users.push(newUser)
        activeUsers.push({ name, ws: wsId })
        console.log(`users pushed, activeUsers: ${JSON.stringify(activeUsers)}`)
        return Promise.resolve(newUser)
      }
    } else Promise.reject('login and password should be strings')
  } catch {
    console.log(`error registering user: ${error}`)
  }
}