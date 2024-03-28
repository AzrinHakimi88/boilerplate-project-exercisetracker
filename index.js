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

// Define MongoDB Schemas
const userSchema = new mongoose.Schema({
  username: String,
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: { type: Date }
});

// Define MongoDB Models
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Routes
// Create a new user
app.post('/api/users', async (req, res) => {
  try {
      const { username } = req.body;
      const user = new User({ username });
      await user.save();
      res.json({ username: user.username, _id: user._id });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
      const users = await User.find();
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Add exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
      let { description, duration, date } = req.body;
      if(!date){
        date = new Date(Date.now()).toDateString();
        
      }
      const userId = req.params._id;
      const exercise = new Exercise({ userId, description, duration, date });
      
      await exercise.save();
      res.json({ 
          username: (await User.findById(userId)).username, 
          description: exercise.description, 
          duration: exercise.duration, 
          date: exercise.date.toDateString() ,
          _id: userId, 
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get full exercise log of a user
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
      const userId = req.params._id;
      let { from, to, limit } = req.query;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      let query = { userId };

      if (from || to) {
          query.date = {};
          if (from) {
              query.date.$gte = new Date(from);
          }
          if (to) {
              query.date.$lte = new Date(to);
          }
      }

      let exercisesQuery = Exercise.find(query).limit(limit ? parseInt(limit) : undefined);
      const exercises = await exercisesQuery.exec();

      const log = exercises.map((exercise) =>(
             { description: exercise.description,
              duration: exercise.duration,
              date: exercise.date.toDateString().toString()}
      )) 

      res.json({ 
          
          username: user.username, 
          count: exercises.length, 
          _id: user._id, 
          log: log
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
