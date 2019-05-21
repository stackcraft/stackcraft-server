import user from './queries/user'
import users from './queries/users'

import addUser from './mutations/add-user'
import deleteUser from './mutations/delete-user'

import userAdded from './subscriptions/user-added'
import userDeleted from './subscriptions/user-deleted'

const security = {
  name: 'security',
  queries: {
    user,
    users,
  },
  mutations: {
    addUser,
    deleteUser,
  },
  subscriptions: {
    userAdded,
    userDeleted,
  },
}

export default security
