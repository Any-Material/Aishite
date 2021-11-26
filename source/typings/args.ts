/** @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types */
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K; }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

declare type Args<T> = NonFunctionProperties<T>;
