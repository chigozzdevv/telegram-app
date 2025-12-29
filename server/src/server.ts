import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { userRoutes } from './routes/users.js'
import { zegoRoutes } from './routes/zego.js'
import { errorHandler } from './middleware/error-handler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use('/api/users', userRoutes)
app.use('/api/zego', zegoRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
