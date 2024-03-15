// eslint-disable-next-line
import 'knex'
declare module 'kenx/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: string
      created_at: string
      session_id?: string
    }
  }
}
