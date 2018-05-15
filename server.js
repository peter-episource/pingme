const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bp = require('body-parser')
const session = require('express-session')
const cors = require('cors')

const PORT = process.env.PORT || 3000
const app = express()

mongoose.connect(process.env.DB_HOST);

app.use(cors())
app.use(bp.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))

app.use(bp.urlencoded({ extended: true }))

const userController = require('./controllers/userController')
const searchController = require('./controllers/searchController')

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'media')))

// post route middleware
app.use('/user', userController)
app.use('/search', searchController)

// media content route
app.use('/media', (req, res) => {
  res.sendFile(path.join(__dirname, `media${req.url}`))
})

// Base route
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}...`)
})
