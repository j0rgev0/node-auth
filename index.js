import express from "express"
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser"

import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from "./user-repository.js"

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
    const token = req.cookies.access_token
    req.session = { user: null }

    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        req.session.user = data
    } catch (e) {
    }

    next()
})

app.get('/', (req, res) => {
    const { user } = req.session
    res.render('index', user)
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await UserRepository.login({username, password})
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            SECRET_JWT_KEY, 
            {
                expiresIn: '1h'
            })
        res
        .cookie('access_token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60
        })
        .send({ user, token })
    }catch(e){
        res.status(401).send(e.message)
    }
})

app.post('/register', async (req, res) => {
    const { username, password} = req.body
    console.log( req.body)
    
    try {
        const id = await UserRepository.create({ username, password})
                const token = jwt.sign(
            { id, username }, 
            SECRET_JWT_KEY,
            {
                expiresIn: '1h'
            })
        res
        .cookie('access_token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60
        })
        .send({ id, token })
    }catch(e){
        res.status(400).send(e.message)
    }
})

app.post('/logout', (req, res) => {
    res.clearCookie('access_token').json({message : 'Logged out'})
})

app.get('/protected', (req, res) => {
    const { user } = req.session
    if (!user) return res.status(403).send('Access denied')

    res.render('protected', user)
})


app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`)
})