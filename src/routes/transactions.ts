import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { CheckSessionIdExists } from '../middlewares/check-session-id-exists'

export async function TransactionsRoutes(app: FastifyInstance) {
  const PREFIX = 'transactions'

  app.get(
    '/',
    {
      preHandler: [CheckSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const transactions = await knex(PREFIX)
        .where('session_id', sessionId)
        .select()

      return {
        transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [CheckSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const transactions = await knex(PREFIX)
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return {
        transactions,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [CheckSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex(PREFIX)
        .where('session_id', sessionId)
        .sum('amount', {
          as: 'amount',
        })
        .first()

      return {
        summary,
      }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7days
      })
    }

    await knex(PREFIX).insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
