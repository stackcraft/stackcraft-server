import { ForbiddenError } from 'apollo-server-koa'
import { combineResolvers } from 'graphql-resolvers'

import isAuthenticated from '../../core/validators/is-authenticated'
import pubsub from '../../core/utils/pub-sub'

import { USER_DELETED } from '../constants'

/**
 * Delete user if it is not current user or super user
 */

const deleteUser = combineResolvers(
  isAuthenticated,
  async (parent, { id }, { models: { User }, currentUser }) => {
    const user = await User.findOne({
      where: {
        id,
      },
    })

    if (user.super) {
      throw new ForbiddenError('Cannot remove Super user')
    }

    if (id === currentUser.id) {
      throw new ForbiddenError('Cannot remove current user')
    }

    pubsub.publish(USER_DELETED, {
      user,
    })

    user.destroy()
    return user
  },
)

export default deleteUser
