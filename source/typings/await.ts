declare type Await<T> = T extends { then(onfulfilled?: (value: infer R) => unknown): unknown; } ? R : T;
