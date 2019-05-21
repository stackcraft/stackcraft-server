import { ForbiddenError } from 'apollo-server-koa'
import { skip } from 'graphql-resolvers'

/**
 * Resolver for checking if user is authenticated. This resolver is used when
 * combined with another resolver.
 *
 * @example
 *
 * import { combineResolvers } from 'graphql-resolvers'
 *
 * const entities = combineResolvers(
 *   isAuthenticated,
 *   async () => {}
 * )
 */

const isAuthenticated = (parent, args, { currentUser }) => {
  if (currentUser) {
    return skip
  }
  throw new ForbiddenError('Not authenticated as user')
}

export default isAuthenticated
