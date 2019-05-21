import Koa from 'koa'
import serve from 'koa-static-server'

import chalk from 'chalk'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import jwt from 'jsonwebtoken'
import path from 'path'

import { ApolloServer, AuthenticationError } from 'apollo-server-koa'
import { GraphQLScalarType } from 'graphql'
import { GraphQLUpload as File } from 'graphql-upload'
import { GraphQLJSONObject as Json } from 'graphql-type-json'
import { Kind } from 'graphql/language'
import { importSchema } from 'graphql-import'

import Sequelize from 'sequelize'
import sequelizeNoUpdateAttributes from 'sequelize-noupdate-attributes'

import assign from 'lodash/assign'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
import merge from 'lodash/merge'
import reduce from 'lodash/reduce'

import core from './core'
import security from './security'

/**
 * Get access to .env variables
 */

dotenv.config()

const app = new Koa()

/**
 * This project consists of independent modules. Each module of the project,
 * except of the module with the name "core", is able to participate in the work
 * of the project or not. All other modules are optional
 *
 * The module describes certain entities and logic of working with them
 *
 * The structure of a module looks like this:
 *
 * @example
 *
 * import entities from './queries/entities'
 *
 * import addEntity from './mutations/add-entity'
 *
 * import entityAdded from './subscriptions/entity-added'
 *
 * const module = {
 *   // Module name
 *   name: 'moduleName',
 *
 *   // Sequelize models. Should use routes because of sequelize.import
 *   // TODO: replace with require
 *   models: {
 *     Entity: './module-name/models/entity'
 *   },
 *
 *   // List of Apollo queries
 *   queries: {
 *     entities,
 *   }
 *
 *   // List of Apollo mutations
 *   mutations: {
 *     addEntity,
 *   }
 *
 *   // List of Apollo subscriptions
 *   subscriptions: {
 *     entityAdded,
 *   }
 * }
 */

const modules = [core, security]

/**
 * Database
 */

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    logging: false,
  },
)

/**
 * Add Sequelize plugin which adds "no update" attributes support
 *
 * Useful tool to control "created" field:
 * @link https://github.com/diosney/node-sequelize-noupdate-attributes
 *
 * @example
 *
 *  const Entity = (sequelize, DataTypes) => sequelize.define('user', {
 *    created: {
 *      type: DataTypes.DATE,
 *      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
 *      allowNull: false,
 *      noUpdate: {
 *        readOnly: true,
 *      },
 *    },
 *  }
 */

sequelizeNoUpdateAttributes(sequelize)

/**
 * Apollo
 */

const getCurrentUser = async request => {
  const { authorization: token } = request.header
  if (token) {
    try {
      const currentUser = await jwt.verify(token, process.env.SECRET, {
        algorithms: ['HS256'],
      })
      return currentUser
    } catch (e) {
      throw new AuthenticationError('Session expired')
    }
  }
  return null
}

const getModuleResolver = resolverName =>
  reduce(
    modules,
    (resolver, module) => merge(resolver, get(module, resolverName)),
    {},
  )

/**
 * Add Timestamp as GraphQL scalar type. The timestamp format stores the date
 * and returns date in timestamp format
 */

const Timestamp = new GraphQLScalarType({
  name: 'Timestamp',
  serialize(date) {
    return date instanceof Date ? date.getTime() : null
  },
  parseValue(value) {
    try {
      return new Date(value)
    } catch (error) {
      return null
    }
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.INT:
        return new Date(parseInt(ast.value, 10))
      case Kind.STRING:
        return this.parseValue(ast.value)
      default:
        return null
    }
  },
})

const server = new ApolloServer({
  typeDefs: importSchema(path.join(__dirname, '/type-defs.graphql')),
  resolvers: {
    Query: getModuleResolver('queries'),
    Mutation: getModuleResolver('mutations'),
    Subscription: getModuleResolver('subscriptions'),
    File, // File GraphQL scalar type
    Json,
    Timestamp,
  },
  context: async ({ ctx, connection }) => {
    /**
     * Return connection context if type of request is subscription
     */
    if (connection) {
      return connection.context
    }
    const { request } = ctx
    const currentUser = await getCurrentUser(request)
    return {
      currentUser,
      models: forEach(getModuleResolver('models'), (model, key, obj) => {
        assign(obj, {
          [key]: sequelize.import(path.join(__dirname, model)),
        })
      }),
      secret: process.env.SECRET,
    }
  },
})

/**
 * Use "files" folder at the root of the project as file storage. This folder
 * contains the files uploaded by the user, as well as user avatars
 */

app.use(serve({ rootDir: 'files', rootPath: '/files' }))

server.applyMiddleware({
  app,
})

const httpServer = http.createServer(app.callback())
server.installSubscriptionHandlers(httpServer)

/**
 * Cors
 */

app.use(
  cors({
    origin: `http://localhost:${process.env.CLIENT_PORT}`,
    credentials: true,
  }),
)

/**
 * Init
 */

sequelize.sync().then(async () => {
  const defaultServerPort = 3000
  const port = process.env.SERVER_PORT || defaultServerPort
  httpServer.listen(port, () => {
    console.log(
      chalk.bold(
        `Server is up and running on: ${chalk.yellow(
          `http://localhost:${process.env.SERVER_PORT}`,
        )}`,
      ),
    )
  })
})
