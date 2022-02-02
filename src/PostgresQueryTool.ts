import { type ClientBase } from 'pg';
import { parseQuery, QueryParameter, RVDorQP } from './parseQuery';

import { ResultValueDescriptor } from './ResultValueDescriptor';


export type ResultTypeOf<T extends Array<RVDorQP>> = ResultTypeHelper<T, {}>;

type ResultTypeHelper<T extends Array<RVDorQP>, Acc> =
   T extends [infer T0, ...infer Tn]
   ?
   ResultTypeHelper<
      Tn,
      T0 extends ResultValueDescriptor<infer C, infer V>
      ? { [key in keyof Acc | C]: key extends keyof Acc ? Acc[key] : V }
      : Acc
   >
   :
   Acc;

function createRowMapper<T>(resultValueDescriptors: Map<string, ResultValueDescriptor<string, any>>): (row: any) => T {
   return row => {
      const obj: Record<string, any> = {};
      resultValueDescriptors.forEach(resultValueDescriptor => {
         const value = row[resultValueDescriptor.columnName];
         const converted = resultValueDescriptor.acceptNull && value === null ? undefined : resultValueDescriptor.converter(value);
         obj[resultValueDescriptor.propertyName] = converted;
      });
      return obj as T;
   };
}

export class PostgresQueryTool {

   public constructor(
      public readonly pgClient: ClientBase,
   ) {
   }

   public async exec<P extends Array<QueryParameter>>(sqlParts: TemplateStringsArray, ...params: P): Promise<number> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params);
      if (resultValueDescriptors.size > 0) {
         throw new Error('use query instead of exec to retrieve values from database');
      }
      const result = await this.pgClient.query(sql, queryParams);
      return result.rowCount;
   }

   public async query<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): Promise<Array<ResultTypeOf<P>>> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params);
      const result = await this.pgClient.query(sql, queryParams);
      const rowMapper = createRowMapper<ResultTypeOf<P>>(resultValueDescriptors);
      return result.rows.map(rowMapper);
   }

   public async querySingle<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): Promise<ResultTypeOf<P>> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params);

      const result = await this.pgClient.query(sql, queryParams);

      if (result.rowCount !== 1) {
         throw new Error(`exactly one row expected`);
      }

      const rowMapper = createRowMapper<ResultTypeOf<P>>(resultValueDescriptors);
      return rowMapper(result.rows[0]);
   }

   public async queryOptional<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): Promise<ResultTypeOf<P> | undefined> {
      const { sql, queryParams, resultValueDescriptors } = parseQuery(sqlParts, ...params);
      const result = await this.pgClient.query(sql, queryParams);

      if (result.rowCount > 1) {
         throw new Error(`at most one row expected`);
      }

      if (result.rowCount === 0) {
         return undefined;
      }

      const rowMapper = createRowMapper<ResultTypeOf<P>>(resultValueDescriptors);
      return rowMapper(result.rows[0]);
   }

}
