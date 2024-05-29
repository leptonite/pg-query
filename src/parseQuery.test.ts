import { describe, expect, test } from '@jest/globals'

import { asOptionalDate, asOptionalString, asSafeInteger, asString } from './ResultValueTaggingFunctions'
import { sql } from './Sql'
import { parseQuery } from './parseQuery'


describe('parseQuery', () => {

   test('no parameters and no result values', () => {
      const pq = parseQuery`
         VACUUM;
      `
      expect(pq.sql).toBe(`
         VACUUM;
      `)
      expect(pq.queryParams).toStrictEqual([])
      expect(pq.resultValueDescriptors.size).toBe(0)
   })

   test('parameters but no result values', () => {
      const pq = parseQuery`
         UPDATE
            public.user
         SET
            name = ${'Miles Dyson'},
            email = ${'dyson@cyberdyne.com'}
         WHERE
            id = ${800}
      `
      expect(pq.sql).toBe(`
         UPDATE
            public.user
         SET
            name = $1,
            email = $2
         WHERE
            id = $3
      `)
      expect(pq.queryParams).toStrictEqual([
         'Miles Dyson',
         'dyson@cyberdyne.com',
         800,
      ])
      expect(pq.resultValueDescriptors.size).toBe(0)
   })

   test('no parameters but result values', () => {
      const pq = parseQuery`
         SELECT
            id ${asSafeInteger('id')},
            name ${asString('name')},
            email ${asOptionalString('email')},
            lastlogin ${asOptionalDate('lastlogin')},
            ${sql`lastlogin ${asOptionalDate('lastLogin')}`}
         FROM
            public.user
      `
      expect(pq.sql).toBe(`
         SELECT
            id AS result_0,
            name AS result_1,
            email AS result_2,
            lastlogin AS result_3,
            lastlogin AS result_4
         FROM
            public.user
      `)
      expect(pq.queryParams).toStrictEqual([])
      expect(pq.resultValueDescriptors.size).toBe(5)
      expect(pq.resultValueDescriptors.get('result_0')?.propertyName).toBe('id')
      expect(pq.resultValueDescriptors.get('result_1')?.propertyName).toBe('name')
      expect(pq.resultValueDescriptors.get('result_2')?.propertyName).toBe('email')
      expect(pq.resultValueDescriptors.get('result_3')?.propertyName).toBe('lastlogin')
      expect(pq.resultValueDescriptors.get('result_4')?.propertyName).toBe('lastLogin')
   })

   test('double result value', () => {
      expect(() => {
         parseQuery`
            SELECT
               firstname ${asString('name')},
               lastname ${asString('name')}
            FROM
               public.user
         `
      }).toThrow()
   })

   test('throws on invalid params size', () => {
      expect(() => parseQuery([])).toThrow()
      expect(() => parseQuery(['SELECT * FROM foo WHERE id = '], 1)).toThrow()
   })

})
