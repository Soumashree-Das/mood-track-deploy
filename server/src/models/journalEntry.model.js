import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  joyful: {
    type: String,
    enum: ["Ecstatic", "Elated", "Euphoric", "Overjoyed", "Radiant", "Triumphant", "Exuberant"]
  },
  happy: {
    type: String,
    enum: ["Content", "Cheerful", "Pleased", "Optimistic", "Playful", "Grateful", "Satisfied"]
  },
  calmAndContent: {
    type: String,
    enum: ["Serene", "Tranquil", "Centered", "Secure", "Grounded", "Composed", "Reflective"]
  },
  angry: {
    type: String,
    enum: ["Frustrated", "Annoyed", "Irritated", "Furious", "Resentful", "Agitated", "Enraged"]
  },
  anxious: {
    type: String,
    enum: ["Nervous", "Restless", "Apprehensive", "Uneasy", "Fearful", "Jittery", "Panicky"]
  },
  sad: {
    type: String,
    enum: ["Disappointed", "Melancholic", "Despondent", "Heartbroken", "Lonely", "Miserable", "Dismal"]
  },
  depressed: {
    type: String,
    enum: ["Hopeless", "Despairing", "Dejected", "Disheartened", "Desolate", "Gloomy", "Sorrowful", "Mourning"]
  }
});

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: moodSchema,
  grateful:{
    type:[String],
    default: [],
  },
  selfReflection:{
    type: String
  },
}, {
  timestamps: true
});

export const journalModel = mongoose.model("journalModel", journalEntrySchema);
