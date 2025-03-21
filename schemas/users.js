import z from 'zod'

const userSchema = z.object({
    username: z.string().min(3, {message: 'User name must be at least 3 characters long'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'})

})


export function validateUser (user) {
    return userSchema.safeParse(user)
}