export class Sql<P extends ReadonlyArray<unknown>> {

   static readonly #classTypeTag = Symbol()

   readonly #typeTag = Sql.#classTypeTag
   readonly sqlParts: ReadonlyArray<string>
   readonly params: P

   constructor(sqlParts: ReadonlyArray<string>, ...params: P) {
      if (sqlParts.length !== params.length + 1) {
         throw new Error('invalid arguments')
      }
      this.sqlParts = sqlParts
      this.params = params
   }

}

export const sql = <P extends ReadonlyArray<unknown>>(sqlParts: TemplateStringsArray, ...params: P): Sql<P> => new Sql(sqlParts, ...params)

/**
 * Creates a raw SQL string that can be directly embedded in an SQL query.
 * This is potentially unsafe and may lead to SQL injection vulnerabilities!
 * Make sure you can trust the contents of `rawSqlString`.
 */
sql.raw = (rawSqlString: string) => new Sql([rawSqlString])
