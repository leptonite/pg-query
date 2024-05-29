@leptonite/pg-query
===================

This is in an early development stage.

usage example:

```typescript
import { asBoolean, asSafeInteger, asString, PostgresService } from '@leptonite/pg-query';
import { PoolConfig } from 'pg';

async function pgQueryExample() {

   const config: PoolConfig = {
      host: 'localhost',
      user: 'postgres',
      password: 'topsecret',
   };

   const postgresService = new PostgresService(config);

   const transactionResult = await postgresService.withinTransaction(async tx => {

      const resultAll = await tx.query`
         SELECT
            id ${asSafeInteger('id')},
            firstname ${asString('firstName')},
            lastname ${asString('lastName')},
            enabled ${asBoolean('enabled')},
         FROM
            public.user
      `;
      // resultAll is of type Array<{ id: number; firstName: string; lastName: string; enabled: boolean; }>

      const id = 1;
      const resultSingle = await tx.querySingle`
         SELECT
            id ${asSafeInteger('id')},
            firstname ${asString('firstName')},
            lastname ${asString('lastName')},
            enabled ${asBoolean('enabled')},
         FROM
            public.user
         WHERE
            id = ${id} -- no sql injection here!
      `;
      // resultSingle is of type { id: number; firstName: string; lastName: string; enabled: boolean; }
      // throws Error if there’s no user with id 1

      const email = 'user@example.org'; // from untrusted source!
      const queryOptional = await tx.queryOptional`
         SELECT
            id ${asSafeInteger('id')},
            firstname ${asString('firstName')},
            lastname ${asString('lastName')},
            enabled ${asBoolean('enabled')},
         FROM
            public.user
         WHERE
            email = ${email} -- no sql injection here!
      `;
      // queryOptional is of type { id: number; firstName: string; lastName: string; enabled: boolean; } | undefined

      const resultExec = await tx.exec`
         UPDATE public.user SET email = ${email} WHERE id = ${id}
      `;
      // resultExec is of type number (number of affected rows)

      return resultSingle; // result of the entire transaction
   });

   await postgresService.close();
}
```
