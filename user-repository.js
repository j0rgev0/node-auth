import { neon } from '@neondatabase/serverless'
import { validateUser } from './schemas/users.js'
import dotenv from 'dotenv'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'

dotenv.config()
const sql = neon(process.env.DATABASE_URL);

export class UserRepository {
  static async create ({ username, password }) {

    try {
        const result = validateUser({ username, password })
        if (!result.success) throw new Error(result.error.errors.map(err => err.message).join(','))

        const userCheck = await sql`SELECT * FROM users WHERE username = ${username}`
        if (userCheck.length > 0) throw new Error('Username already exists')

        const saltRounds = SALT_ROUNDS
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const id = crypto.randomUUID()
        await sql`INSERT INTO users (id, username, password) VALUES (${id}, ${username}, ${hashedPassword});`

        return {id}
    }catch (e) {
        throw new Error(e.message);
      }
    
  }
  static async login ({ username, password }) {
    
    try{
        const result = validateUser({username, password})
        if (!result.success) throw new Error(result.error.errors.map(err => err.message).join(','))

        const user = await sql`SElECT * FROM users WHERE username = ${username}`
        if (user.length === 0) throw new Error('Username does not exist')

        const isValid = await bcrypt.compare(password, user[0].password)
        if (!isValid) throw new Error('Incorrect password')

        const { password :_, ...publicUser } = user[0]
        
        return publicUser
    }catch(e){
        throw new Error(e.message);
    }

  }
}