const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }));


mongoose.connect('mongodb://localhost:27017/Exercise').then(() => {console.log('connect to database')})

const userSchema = mongoose.Schema({
  username : {
    type : String,
    required : true
  }
})

const userModel = mongoose.model('User', userSchema )

app.post('/api/users',async (req,res) => {
    const {username} = req.body
    console.log(username)
    try{
      const user = await userModel.create({username: username})
      res.json({username: user.username, _id : user._id})
    }
    catch(err){
      console.log(err)
    }
});

app.get('/api/users',async (req,res) => {
  try{
    const user = await userModel.find()
    res.json(user)
  }catch(err){
    console.log(err)
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
