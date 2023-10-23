export interface HashTable<T> {
    [key: string]: T
}
export const getKey = (...args:string[]) => {
    return args.join(' ')
}