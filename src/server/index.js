import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/v1/memories/create', async (req, res) => {
  try {
    const memoryData = req.body
    // Here you would typically save to database
    // For now, just return the data
    res.json({
      success: true,
      memories: memoryData
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
