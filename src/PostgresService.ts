import { Pool, type PoolConfig } from 'pg'

import { Log, nullLog } from './Log'
import { PostgresQueryTool } from './PostgresQueryTool'


export class PostgresService {

   readonly #log: Log
   readonly #pool: Pool

   constructor(
      config: PoolConfig,
      log?: Log,
   ) {
      this.#log = log ?? nullLog
      this.#pool = new Pool(config)
      this.#pool.on('error', error => this.#log.error(`postgres pool error: ${error}`))
   }

   async withConnection<T>(dbTask: (db: PostgresQueryTool) => Promise<T>): Promise<T> {
      this.#log.debug(`acquiring postgres client from connection pool (idle=${this.#pool.idleCount}, total=${this.#pool.totalCount}, waiting=${this.#pool.waitingCount})`)
      const pgClient = await this.#pool.connect()
      this.#log.debug(`acquired postgres client from connection pool (idle=${this.#pool.idleCount}, total=${this.#pool.totalCount}, waiting=${this.#pool.waitingCount})`)
      try {
         const db = new PostgresQueryTool(pgClient)
         return await dbTask(db)
      } finally {
         this.#log.debug(`releasing postgres client to connection pool (idle=${this.#pool.idleCount}, total=${this.#pool.totalCount}, waiting=${this.#pool.waitingCount})`)
         pgClient.release()
         this.#log.debug(`released postgres client to connection pool (idle=${this.#pool.idleCount}, total=${this.#pool.totalCount}, waiting=${this.#pool.waitingCount})`)
      }
   }

   async withinTransaction<T>(dbTask: (db: PostgresQueryTool) => Promise<T>): Promise<T> {
      return await this.withConnection(async db => {
         this.#log.debug(`starting transaction`)
         await db.exec`BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE`
         this.#log.debug(`started transaction`)
         try {
            const result = await dbTask(db)
            this.#log.debug(`committing transaction`)
            await db.exec`COMMIT`
            this.#log.debug(`committed transaction`)
            return result
         } catch (e) {
            this.#log.debug(`rolling back transaction`)
            await db.exec`ROLLBACK`
            this.#log.debug(`rolled back transaction`)
            throw e
         }
      })
   }

   async close(): Promise<void> {
      await this.#pool.end()
   }

}
