import { ResultValueDescriptor } from './ResultValueDescriptor'
import { Sql } from './Sql'


export type QueryParameter = unknown
export type RVDorQP = ResultValueDescriptor<string, any> | QueryParameter

export interface ParsedQuery {
   sql: string
   queryParams: Array<QueryParameter>
   resultValueDescriptors: Map<string, ResultValueDescriptor<string, any>>
}

export function parseQuery(sqlParts: ReadonlyArray<string>, ...params: ReadonlyArray<unknown>): ParsedQuery {
   if (sqlParts.length !== params.length + 1) {
      throw new Error('invalid arguments')
   }

   let sql = ''
   const queryParams: Array<QueryParameter> = []
   const resultValueDescriptors = new Map<string, ResultValueDescriptor<string, any>>()
   const propNames = new Set<string>()

   const addQuery = (sqlParts: ReadonlyArray<string>, params: ReadonlyArray<unknown>) => {
      for (let i = 0; i < params.length; i++) {
         sql += sqlParts[i]
         const param = params[i]
         if (param instanceof ResultValueDescriptor) {
            if (propNames.has(param.propertyName)) {
               throw new Error(`duplicate property name ${param.propertyName}`)
            }
            const columnAlias = `result_${resultValueDescriptors.size}`
            sql += `AS ${columnAlias}`
            resultValueDescriptors.set(columnAlias, param)
            propNames.add(param.propertyName)
         } else if (param instanceof Sql) {
            addQuery(param.sqlParts, param.params)
         } else {
            queryParams.push(param)
            sql += `$${queryParams.length}`
         }
      }
      sql += sqlParts[params.length]
   }

   addQuery(sqlParts, params)

   return { sql, queryParams, resultValueDescriptors }
}
