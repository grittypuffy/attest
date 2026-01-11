import { Collection, Db } from "mongodb";

export default interface AppState {
    db: Db,
    userCollection: Collection,
    jwtSecret: string
}