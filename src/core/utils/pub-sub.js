import { PubSub } from 'apollo-server-koa'

/**
 * Create a PubSub instance which is responsible for managing all subscriptions
 * on the server. PubSub is a class that exposes a publish and a subscribe API
 */

const pubsub = new PubSub()

export default pubsub
