import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import driveRoutes from './routes/driveRoutes.js'
import gmailRoutes from './routes/gmailRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Placify API is running',
  })
})

app.use('/api/drives', driveRoutes)
app.use('/api/gmail', gmailRoutes)

app.use(notFound)
app.use(errorHandler)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`)
    process.exit(1)
  })
