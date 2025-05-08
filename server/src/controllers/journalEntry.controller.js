import { journalModel } from '../models/journalEntry.model.js';
import { userModel } from '../models/user.model.js';

/**
 * Add a new journal entry for a user
 */
export const createJournalEntry = async (req, res) => {
  const { title, content, mood, grateful, selfReflection } = req.body;
  const userId = req.user.id; // comes from auth middleware

  try {
    const newEntry = new journalModel({ 
      title, 
      content, 
      mood, 
      grateful, 
      selfReflection, 
      user: userId 
    });
    
    await newEntry.save();
    
    return res.status(201).json({
      message: 'Journal entry added successfully',
      entry: newEntry
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    return res.status(500).json({ message: 'Server error while adding entry' });
  }
};

/**
 * Get all journal entries for a user
 */
export const getAllJournalEntries = async (req, res) => {
  const userId = req.user.id;

  try {
    const entries = await journalModel.find({ user: userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      message: `All entries retrieved successfully`,
      entries
    });
  } catch (error) {
    console.error('Error retrieving entries:', error);
    return res.status(500).json({ message: 'Server error while retrieving entries' });
  }
};

/**
 * Edit a journal entry by ID
 */
export const editEntry = async (req, res) => {
  const entryId = req.params.id;
  const { title, content, mood, grateful, selfReflection } = req.body;
  const userId = req.user.id;

  try {
    // First check if the entry belongs to this user
    const entry = await journalModel.findOne({ _id: entryId, user: userId });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found or not authorized' });
    }

    const updatedEntry = await journalModel.findByIdAndUpdate(
      entryId,
      { title, content, mood, grateful, selfReflection },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Entry updated successfully',
      entry: updatedEntry
    });
  } catch (error) {
    console.error('Error updating entry:', error);
    return res.status(500).json({ message: 'Server error while updating entry' });
  }
};

/**
 * Delete a journal entry by ID
 */
export const deleteEntry = async (req, res) => {
  const entryId = req.params.id;
  const userId = req.user.id;

  try {
    // First check if the entry belongs to this user
    const entry = await journalModel.findOne({ _id: entryId, user: userId });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found or not authorized' });
    }

    await journalModel.findByIdAndDelete(entryId);
    
    return res.status(200).json({ 
      message: 'Entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return res.status(500).json({ message: 'Server error while deleting entry' });
  }
};
// MoodMapper.js - A utility for mapping mood objects to scores and labels

/**
 * Maps mood objects from the backend to standardized mood categories
 * @param {Object} moodObject - The mood object from the backend
 * @returns {String} The standardized mood category
 */
export const getMoodCategory = (moodObject) => {
  if (!moodObject || typeof moodObject !== 'object') return 'Neutral';
  
  // Get the first key from the mood object (the primary emotion type)
  const moodKey = Object.keys(moodObject)[0];
  if (!moodKey) return 'Neutral';
  
  // Map emotional category keys to standardized categories
  const moodMap = {
    'joyful': 'Joyful',
    'happy': 'Happy', 
    'calmAndContent': 'Calm',
    'anxious': 'Anxious',
    'angry': 'Angry',
    'sad': 'Sad',
    'depressed': 'Depressed'
  };
  
  return moodMap[moodKey] || 'Neutral';
};

/**
 * Maps mood objects to numerical scores for visualization and calculation
 * @param {Object} moodObject - The mood object from the backend
 * @returns {Number} A score from 1-7 representing the mood
 */
export const getMoodScore = (moodObject) => {
  const category = getMoodCategory(moodObject);
  
  // Map categories to numerical scores
  const moodScores = {
    'Joyful': 7,
    'Happy': 6,
    'Calm': 5, 
    'Neutral': 4,
    'Anxious': 3,
    'Angry': 2,
    'Sad': 2,
    'Depressed': 1
  };
  
  return moodScores[category] || 4; // Default to Neutral (4) if not found
};

/**
 * Gets a display label from the mood object that includes the specific emotion
 * @param {Object} moodObject - The mood object from the backend
 * @returns {String} A user-friendly display label
 */
export const getMoodLabel = (moodObject) => {
  if (!moodObject || typeof moodObject !== 'object') return 'Neutral';
  
  const moodKey = Object.keys(moodObject)[0];
  if (!moodKey) return 'Neutral';
  
  // Get the specific emotion value (like "Grateful", "Radiant", etc.)
  const specificEmotion = moodObject[moodKey];
  
  // If it's a string value, use that as the specific descriptor
  if (typeof specificEmotion === 'string') {
    return specificEmotion;
  }
  
  // Otherwise just use the category with proper capitalization
  return moodKey.charAt(0).toUpperCase() + moodKey.slice(1);
};

/**
 * Processes an array of journal entries with mood data
 * @param {Array} entries - Journal entries from the backend
 * @returns {Array} Processed entries with mood scores and labels
 */
export const processMoodEntries = (entries) => {
  if (!Array.isArray(entries)) return [];
  
  return entries.map(entry => {
    // Handle entries that might not have mood data
    if (!entry.mood) {
      return {
        ...entry,
        score: 4,
        moodLabel: 'Neutral',
        moodCategory: 'Neutral'
      };
    }
    
    const moodCategory = getMoodCategory(entry.mood);
    const score = getMoodScore(entry.mood);
    const moodLabel = getMoodLabel(entry.mood);
    
    return {
      ...entry,
      score,
      moodLabel,
      moodCategory
    };
  });
};

/**
 * Calculates mood frequency from an array of processed entries
 * @param {Array} processedEntries - Entries that have been run through processMoodEntries
 * @returns {Object} Frequency count of each mood category
 */
export const calculateMoodFrequency = (processedEntries) => {
  const frequency = {
    'Joyful': 0,
    'Happy': 0,
    'Calm': 0,
    'Neutral': 0,
    'Anxious': 0,
    'Angry': 0,
    'Sad': 0,
    'Depressed': 0
  };
  
  processedEntries.forEach(entry => {
    if (entry.moodCategory && frequency[entry.moodCategory] !== undefined) {
      frequency[entry.moodCategory]++;
    }
  });
  
  return frequency;
};

/**
 * Calculates mood statistics from processed entries
 * @param {Array} processedEntries - Entries that have been run through processMoodEntries
 * @param {Object} moodFrequency - Result from calculateMoodFrequency
 * @returns {Object} Mood statistics
 */
export const calculateMoodStats = (processedEntries, moodFrequency) => {
  // Most common mood
  let mostCommonMood = { mood: 'Neutral', count: 0 };
  
  Object.entries(moodFrequency).forEach(([mood, count]) => {
    if (count > mostCommonMood.count) {
      mostCommonMood = { mood, count };
    }
  });
  
  // Calculate average mood score
  const totalEntries = processedEntries.length;
  let totalScore = 0;
  
  processedEntries.forEach(entry => {
    totalScore += entry.score || 4;
  });
  
  const averageScore = totalEntries > 0 ? (totalScore / totalEntries).toFixed(2) : '4.00';
  
  // Get most recent mood
  const recentMood = totalEntries > 0 ? 
    processedEntries[totalEntries - 1].moodLabel : 'Neutral';
  
  return {
    mostCommon: mostCommonMood,
    average: averageScore,
    recent: recentMood,
    total: totalEntries
  };
};

/**
 * Demonstration function to show the conversion in action
 */
export const demonstrateMoodConversion = (moodObject) => {
  const category = getMoodCategory(moodObject);
  const score = getMoodScore(moodObject);
  const label = getMoodLabel(moodObject);
  
  console.log(`Converting mood ${JSON.stringify(moodObject)} to score ${score} and label ${label} (category: ${category})`);
  
  return {
    category,
    score,
    label
  };
};

export const getMoodData = async (req, res) => {
  const userId = req.user.id;

  try {
    const entries = await journalModel.find({ user: userId }).sort({ createdAt: 1 }); // ascending for recent last
    const processed = processMoodEntries(entries);
    const frequency = calculateMoodFrequency(processed);
    const stats = calculateMoodStats(processed, frequency);

    return res.status(200).json({
      message: 'Mood data calculated successfully',
      moodStats: stats,
    });
  } catch (error) {
    console.error('Error processing mood data:', error);
    return res.status(500).json({ message: 'Server error while processing mood data' });
  }
};

/**
 * Returns frequency of each mood category
 */
export const getMoodFrequency = async (req, res) => {
  const userId = req.user.id;

  try {
    const entries = await journalModel.find({ user: userId });
    const processed = processMoodEntries(entries);
    const frequency = calculateMoodFrequency(processed);

    return res.status(200).json({
      message: 'Mood frequency retrieved successfully',
      moodFrequency: frequency
    });
  } catch (error) {
    console.error('Error retrieving mood frequency:', error);
    return res.status(500).json({ message: 'Server error while retrieving mood frequency' });
  }
};

// /**
//  * Helper function to convert mood to numerical score
//  */
// const getMoodScore = (mood) => {
//   if (!mood) return 4; // Default to neutral
  
//   const moodMap = {
//     'joyful': 7,
//     'happy': 6,
//     'calm': 5,
//     'neutral': 4,
//     'angry': 3,
//     'anxious': 2,
//     'sad': 2,
//     'depressed': 1
//   };
  
//   // Find which mood value is true
//   const moodKey = Object.keys(mood).find(key => mood[key] === true);
//   return moodMap[moodKey] || 4;
// };

// /**
//  * Helper function to get mood label
//  */
// const getMoodLabel = (mood) => {
//   if (!mood) return 'Neutral';
  
//   // Find which mood value is true
//   const moodKey = Object.keys(mood).find(key => mood[key] === true);
//   return moodKey ? moodKey.charAt(0).toUpperCase() + moodKey.slice(1) : 'Neutral';
// };

// /**
//  * Get mood data for charts by date range
//  */
// export const getMoodData = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const range = req.query.range || '7days';
//     const days = range === '7days' ? 7 : 30;
    
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
    
//     const entries = await journalModel.find({
//       user: userId,
//       createdAt: { $gte: startDate }
//     }).sort({ createdAt: 1 }).lean();
    
//     const moodData = entries.map(entry => ({
//       date: entry.createdAt.toISOString().split('T')[0],
//       score: getMoodScore(entry.mood),
//       moodLabel: getMoodLabel(entry.mood)
//     }));
    
//     res.status(200).json(moodData);
//   } catch (error) {
//     console.error('Error fetching mood data:', error);
//     res.status(500).json({ message: 'Failed to fetch mood data' });
//   }
// };

// /**
//  * Get mood frequency data for pie chart
//  */
// export const getMoodFrequency = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const entries = await journalModel.find({ user: userId }).lean();
    
//     // Initialize mood frequency object
//     const moodFrequency = {
//       'Joyful': 0,
//       'Happy': 0,
//       'Calm': 0,
//       'Neutral': 0,
//       'Angry': 0, 
//       'Anxious': 0,
//       'Sad': 0,
//       'Depressed': 0
//     };
    
//     // Count frequency of each mood
//     entries.forEach(entry => {
//       const moodLabel = getMoodLabel(entry.mood);
//       if (moodLabel) {
//         moodFrequency[moodLabel] = (moodFrequency[moodLabel] || 0) + 1;
//       }
//     });
    
//     // Remove moods with zero count
//     Object.keys(moodFrequency).forEach(key => {
//       if (moodFrequency[key] === 0) {
//         delete moodFrequency[key];
//       }
//     });
    
//     res.status(200).json(moodFrequency);
//   } catch (error) {
//     console.error('Error fetching mood frequency:', error);
//     res.status(500).json({ message: 'Failed to fetch mood frequency data' });
//   }
// };





// import { journalModel } from "../models/journalEntry.model.js";

// export const entryJournal = async (req, res) => {
//     const { title, note, moodCategory, specificMood, date, grateful, reflection } = req.body;

//     try {
//         const newEntry = new journalModel({
//             title,
//             note,
//             moodCategory,
//             specificMood,
//             date,
//             grateful: grateful || [], // default empty array
//             reflection,
//             user: req.userId
//         });
//         // const newEntry = new journalModel({
//         //     title,
//         //     note,
//         //     mood,
//         //     date,
//         //     user: req.userId
//         // });

//         await newEntry.save();

//         res.status(200).json({ message: "Journal Entry Created Successfully", newEntry });
//     } catch (e) {
//         console.log(e);
//         return res.status(500).json({ message: e });
//     }

// }

// export const deleteEntry = async (req, res) => {
//     const { id } = req.params;

//     try {
//         await journalModel.findByIdAndDelete(id);
//         return res.status(200).json({ messgae: "entry was deleted!" });
//     } catch (e) {
//         console.log(e);
//         return res.staus(500).json({ message: e });
//     }
// }

// import { journalModel } from '../models/journalEntry.model.js'; // 🆕 Import JournalEntry model
// import { userModel } from '../models/user.model.js';// 🆕 Import User model

// // 🆕 Add new journal entry for a user
// export const addEntry = async (req, res) => {
//   const { title, content, mood, grateful, selfReflection } = req.body;
// //   const userId = req.userId; // comes from auth middleware
//   const userId = req.user.id; // comes from auth middleware

//   try {
//     const newEntry = new journalModel({ title, content, mood,grateful, selfReflection , user: userId });
//     await newEntry.save();

//     return res.status(201).json({
//       message: 'Journal entry added successfully',
//       entry: newEntry
//     });
//   } catch (error) {
//     console.error('Error adding entry:', error);
//     return res.status(500).json({ message: 'Server error while adding entry' });
//   }
// };

// // 🆕 Get all entries by username
// export const getEntriesByUsername = async (req, res) => {
//   const userId  = req.user.id;

//   try {
//     const user = await userModel.find({ userId: userId });

//     console.log(user);
//     console.log(userId);
//     // console.log(user);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const entries = await journalModel.find({ user: user._id }).sort({ createdAt: -1 });

//     return res.status(200).json({
//       message: `All entries for ${user.email}`,
//       entries
//     });
//   } catch (error) {
//     console.error('Error retrieving entries:', error);
//     return res.status(500).json({ message: 'Server error while retrieving entries' });
//   }
// };

// // 🆕 Edit a journal entry by ID
// export const editEntry = async (req, res) => {
//   const entryId = req.params.id;
//   const { title, content, mood,grateful, selfReflection  } = req.body;

//   try {
//     const updatedEntry = await journalModel.findByIdAndUpdate(
//       entryId,
//       { title, content, mood , grateful, selfReflection },
//       { new: true }
//     );

//     console.log(updatedEntry);

//     if (!updatedEntry) {
//       return res.status(404).json({ message: 'Entry not found' });
//     }

//     return res.status(200).json({
//       message: 'Entry updated successfully',
//       updatedEntry
//     });
//   } catch (error) {
//     console.error('Error updating entry:', error);
//     return res.status(500).json({ message: 'Server error while updating entry' });
//   }
// };

// // 🆕 Delete a journal entry by ID
// export const deleteEntry = async (req, res) => {
//   const entryId = req.params.id;

//   try {
//     const deleted = await journalModel.findByIdAndDelete(entryId);

//     if (!deleted) {
//       return res.status(404).json({ message: 'Entry not found' });
//     }

//     return res.status(200).json({ message: 'Entry deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting entry:', error);
//     return res.status(500).json({ message: 'Server error while deleting entry' });
//   }
// };


// // Mood data endpoint (NEW)
// export const getMoodData = async (req, res) => {
//   try {
//     const { userId, range } = req.query;
//     const days = range === '7days' ? 7 : 30;
//     const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

//     const entries = await journalModel.find({
//       user: userId,
//       createdAt: { $gte: startDate }
//     }).sort({ createdAt: 1 }).lean();

//     const moodData = entries.map(entry => ({
//       date: entry.createdAt.toISOString().split('T')[0],
//       score: getMoodScore(entry.mood),
//       moodLabel: getMoodLabel(entry.mood) // Optional for tooltips
//     }));

//     res.status(200).json(moodData);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch mood data" });
//   }
// };

// // Helper for tooltip labels (optional)
// const getMoodLabel = (mood) => {
//   if (!mood) return 'No mood';
//   const category = Object.keys(mood).find(k => mood[k]);
//   return mood[category] || 'No mood';
// };





