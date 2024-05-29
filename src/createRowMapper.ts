import { ResultValueDescriptor } from './ResultValueDescriptor'


export type RowMapper<T> = (row: any) => T

export const createRowMapper = <T>(resultValueDescriptors: Map<string, ResultValueDescriptor<string, unknown>>): RowMapper<T> => {
   return row => {
      const obj: Record<string, any> = {}
      resultValueDescriptors.forEach((resultValueDescriptor, alias) => {
         obj[resultValueDescriptor.propertyName] = resultValueDescriptor.converter(row[alias])
      })
      return obj as T
   }
}
