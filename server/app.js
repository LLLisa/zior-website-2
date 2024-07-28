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
  console.log(jft)
  res.json({jft: jft.data})
})




module.exports = app;

