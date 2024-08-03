const express = require('express')
const path = require('path')
const cors = require('cors')
const volleyball = require('volleyball')
const app = express()
const axios = require('axios')

// static middleware
app.use(express.static(path.join(__dirname, '..','public')))

app.use(cors())
app.use(volleyball)

//this is where some things should go
app.get('/jft', async (req, res) => {
  const jft = await axios.get('https://www.jftna.org/jft/')
  res.send(jft.data)
})

app.get('/slides/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'slides', req.params.id))
})

app.get('/zoomQrCode', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'zoomQrCode.png'))
})

app.get('/dailyScript', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'scripts', 'currentDailyScript.pdf'))
})

app.get('/anniversaryScript', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'scripts', 'currentAnniversaryScript.pdf'))
})

module.exports = app;

