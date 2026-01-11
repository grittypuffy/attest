import {t} from "elysia";

export const responseSchema = t.Object({
    data: t.Any(),
    status: t.Number(),
    message: t.String(),
    error: t.Optional(t.String())    
})
