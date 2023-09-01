export type ElementType<T extends Iterable<unknown>> =
  T extends Iterable<infer E> ? E : never;
