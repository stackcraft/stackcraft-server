import { combineResolvers } from 'graphql-resolvers'

import isAuthenticated from '../../core/validators/is-authenticated'

/**
 * Get all registered users
 */

const users = combineResolvers(
  isAuthenticated,
  async (parent, args, { models: { User } }) => {
    const allUsers = await User.findAll({
      order: [['id', 'ASC']],
    })
    return allUsers
  },
)

export default users
