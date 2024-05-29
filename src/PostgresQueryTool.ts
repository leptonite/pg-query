import { type ClientBase } from 'pg'

import { type ResultTypeOf } from './ResultTypeOf'
import { createRowMapper } from './createRowMapper'
import { parseQuery, type RVDorQP } from './parseQuery'


export class PostgresQueryTool {

   constructor(
      readonly pgClient: ClientBase,
   ) {
   }

   async exec(sqlParts: TemplateStringsArray, ...params: ReadonlyArray<unknown>): Promise<number | null> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params)
      if (resultValueDescriptors.size > 0) {
         throw new Error('use query instead of exec to retrieve values from database')
      }

      const result = await this.pgClient.query(sql, queryParams)
      return result.rowCount
   }

   async query<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): Promise<Array<ResultTypeOf<P>>> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params)
      const result = await this.pgClient.query(sql, queryParams)
      const rowMapper = createRowMapper<ResultTypeOf<P>>(resultValueDescriptors)
      return result.rows.map(rowMapper)
   }

   async querySingle<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): Promise<ResultTypeOf<P>> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params)
      const result = await this.pgClient.query(sql, queryParams)

      if (result.rows.length !== 1) {
         throw new Error(`exactly one row expected but ${result.rows.length} rows received`)
      }

      const rowMapper = createRowMapper<ResultTypeOf<P>>(resultValueDescriptors)
      return rowMapper(result.rows[0])
   }

   async queryOptional<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): Promise<ResultTypeOf<P> | undefined> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params)
      const result = await this.pgClient.query(sql, queryParams)

      if (result.rows.length > 1) {
         throw new Error(`at most one row expected but ${result.rows.length} rows received`)
      }

      if (result.rows.length === 0) {
         return undefined
      }

      const rowMapper = createRowMapper<ResultTypeOf<P>>(resultValueDescriptors)
      return rowMapper(result.rows[0])
   }

}
