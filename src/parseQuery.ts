import { ResultValueDescriptor } from './ResultValueDescriptor';


export type QueryParameter = any;
export type RVDorQP = ResultValueDescriptor<string, any> | QueryParameter;

export interface ParsedQuery {
   sql: string;
   queryParams: Array<QueryParameter>;
   resultValueDescriptors: Map<string, ResultValueDescriptor<string, any>>;
}

export function parseQuery<P extends Array<RVDorQP>>(sqlParts: TemplateStringsArray, ...params: P): ParsedQuery {
   let sql = '';
   const queryParams: Array<QueryParameter> = [];
   const resultValueDescriptors = new Map<string, ResultValueDescriptor<string, any>>();

   for (let i = 0; i < params.length; i++) {
      sql += sqlParts[i];
      const param = params[i];
      if (param instanceof ResultValueDescriptor) {
         if (resultValueDescriptors.has(param.columnName)) {
            throw new Error(`column name ${param.columnName} occures multiple times in result`);
         }
         resultValueDescriptors.set(param.columnName, param);
         sql += `AS ${param.columnName}`;
      } else {
         queryParams.push(param);
         sql += `$${queryParams.length}`;
      }
   }
   if (sqlParts.length > params.length) {
      sql += sqlParts[params.length];
   }

   return { sql, queryParams, resultValueDescriptors };
}
