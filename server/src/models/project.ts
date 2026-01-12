import {t} from "elysia";

export const CreateProjectRequest = t.Object({
    project_name: t.String(),
    description: t.String()
})
