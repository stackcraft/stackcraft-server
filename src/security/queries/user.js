import { combineResolvers } from 'graphql-resolvers'

import isAuthenticated from '../../core/validators/is-authenticated'

/**
 * Get user by ID
 */

const user = combineResolvers(
  isAuthenticated,
  async (parent, { id }, { models: { User } }) => {
    const foundedUser = await User.findOne({
      where: {
        id,
      },
    })
    return foundedUser
  },
)

export default user
