import { type ClientBase, Pool, type PoolConfig } from 'pg';

import { Log, nullLog } from './Log';


export class PostgresService {

   private readonly log: Log;
   private readonly pool: Pool;

   public constructor(
      config: PoolConfig,
      log?: Log,
   ) {
      this.log = log ?? nullLog;
      this.pool = new Pool(config);
      this.pool.on('error', error => this.log.error(`postgres pool error: ${error}`));
   }

   public async withConnection<T>(dbTask: (pgClient: ClientBase) => Promise<T>): Promise<T> {
      this.log.debug(`acquiring postgres client from connection pool (idle=${this.pool.idleCount}, total=${this.pool.totalCount}, waiting=${this.pool.waitingCount})`);
      const pgClient = await this.pool.connect();
      this.log.debug(`acquired postgres client from connection pool (idle=${this.pool.idleCount}, total=${this.pool.totalCount}, waiting=${this.pool.waitingCount})`);
      try {
         return await dbTask(pgClient);
      } finally {
         this.log.debug(`releasing postgres client to connection pool (idle=${this.pool.idleCount}, total=${this.pool.totalCount}, waiting=${this.pool.waitingCount})`);
         pgClient.release();
         this.log.debug(`released postgres client to connection pool (idle=${this.pool.idleCount}, total=${this.pool.totalCount}, waiting=${this.pool.waitingCount})`);
      }
   }

   public async withinTransaction<T>(dbTask: (pgClient: ClientBase) => Promise<T>): Promise<T> {
      return await this.withConnection(async pgClient => {
         this.log.debug(`starting transaction`);
         await pgClient.query('BEGIN TRANSACTION');
         this.log.debug(`started transaction`);
         try {
            const result = await dbTask(pgClient);
            this.log.debug(`committing transaction`);
            await pgClient.query('COMMIT');
            this.log.debug(`committed transaction`);
            return result;
         } catch (e) {
            this.log.debug(`rolling back transaction`);
            await pgClient.query('ROLLBACK');
            this.log.debug(`rolled back transaction`);
            throw e;
         }
      });
   }

   public async close(): Promise<void> {
      await this.pool.end();
   }

}
