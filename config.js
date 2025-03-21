import dotenv from 'dotenv'

dotenv.config()

export const {
    PORT = 3000,
    SALT_ROUNDS = 10,
    SECRET_JWT_KEY
} = process.env