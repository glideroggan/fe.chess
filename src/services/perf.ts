import { FEN } from "./FEN"
import { Move } from "./rules"

export interface HashTable<T> {
    [key: string]: T
}
// const cache: HashTable<Move[]> = {}
export const getKey = (...args:string[]) => {
    return args.join(' ')
}