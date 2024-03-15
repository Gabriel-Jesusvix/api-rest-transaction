import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { TransactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)
app.register(TransactionsRoutes, {
  prefix: 'transactions',
})
