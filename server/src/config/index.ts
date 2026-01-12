import type { Collection, Db } from "mongodb";

export default interface AppState {
    db: Db,
    userCollection: Collection,
    projectCollection: Collection,
    proposalCollection: Collection,
    jwtSecret: string
}