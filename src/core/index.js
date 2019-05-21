import currentUser from './queries/current-user'

import logIn from './mutations/log-in'
import logOut from './mutations/log-out'
import updateToken from './mutations/update-token'

const core = {
  name: 'core',
  models: {
    User: './core/models/user',
  },
  queries: {
    currentUser,
  },
  mutations: {
    logIn,
    logOut,
    updateToken,
  },
}

export default core
