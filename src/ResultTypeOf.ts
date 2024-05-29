import { ResultValueDescriptor } from './ResultValueDescriptor'
import { Sql } from './Sql'
import { RVDorQP } from './parseQuery'


export type ResultTypeOf<T extends ReadonlyArray<RVDorQP>> = ResultTypeHelper<T, {}>

/**
 * Add a property with name `K` and type `V` to type `T`.
 */
export type AddProp<K extends string, V, Acc> = K extends keyof Acc ? never : { [key in (keyof Acc | K)]: key extends keyof Acc ? Acc[key] : V }

export type AddParam<P, Acc> =
   P extends ResultValueDescriptor<infer N, infer T>
   ? AddProp<N, T, Acc>
   : Acc

type ResultTypeHelper<T extends ReadonlyArray<RVDorQP>, Acc> =
   T extends [infer T0, ...infer Tn]
   ?
   (
      T0 extends Sql<infer U>
      ?
      ResultTypeHelper<Tn, ResultTypeHelper<U, Acc>>
      :
      ResultTypeHelper<Tn, AddParam<T0, Acc>>
   )
   :
   Acc
