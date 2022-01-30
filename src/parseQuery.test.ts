import { asOptionalDate, asOptionalString, asSafeInteger, asString } from './ResultValueTaggingFunctions';
import { parseQuery } from './parseQuery';


describe('parseQuery', () => {

   test('no parameters and no result values', () => {
      const pq = parseQuery`
         VACUUM;
      `;
      expect(pq.sql).toBe(`
         VACUUM;
      `);
      expect(pq.queryParams).toStrictEqual([]);
      expect(pq.resultValueDescriptors.size).toBe(0);
   });

   test('parameters but no result values', () => {
      const pq = parseQuery`
         UPDATE
            public.user
         SET
            name = ${'Miles Dyson'},
            email = ${'dyson@cyberdyne.com'}
         WHERE
            id = ${800}
      `;
      expect(pq.sql).toBe(`
         UPDATE
            public.user
         SET
            name = $1,
            email = $2
         WHERE
            id = $3
      `);
      expect(pq.queryParams).toStrictEqual([
         'Miles Dyson',
         'dyson@cyberdyne.com',
         800,
      ]);
      expect(pq.resultValueDescriptors.size).toBe(0);
   });

   test('no parameters but result values', () => {
      const pq = parseQuery`
         SELECT
            id ${asSafeInteger('id')},
            name ${asString('name')},
            email ${asOptionalString('email')},
            lastlogin ${asOptionalDate('lastLogin')}
         FROM
            public.user
      `;
      expect(pq.sql).toBe(`
         SELECT
            id AS id,
            name AS name,
            email AS email,
            lastlogin AS lastlogin
         FROM
            public.user
      `);
      expect(pq.queryParams).toStrictEqual([]);
      expect(pq.resultValueDescriptors.size).toBe(4);

      expect(pq.resultValueDescriptors.get('id')?.propertyName).toBe('id');
      expect(pq.resultValueDescriptors.get('id')?.columnName).toBe('id');

      expect(pq.resultValueDescriptors.get('name')?.propertyName).toBe('name');
      expect(pq.resultValueDescriptors.get('name')?.columnName).toBe('name');

      expect(pq.resultValueDescriptors.get('email')?.propertyName).toBe('email');
      expect(pq.resultValueDescriptors.get('email')?.columnName).toBe('email');

      expect(pq.resultValueDescriptors.get('lastlogin')?.propertyName).toBe('lastLogin');
      expect(pq.resultValueDescriptors.get('lastlogin')?.columnName).toBe('lastlogin');
   });

   test('double result value', () => {
      expect(() => {
         const pq = parseQuery`
            SELECT
               lastlogin ${asOptionalDate('lastlogin')},
               lastlogin ${asOptionalDate('lastLogin')}
            FROM
               public.user
         `;
      }).toThrow();
   });

});
