import { Router } from "express";
import { protect } from "../utils/jwt.token.js";
import { 
  createJournalEntry, 
  getAllJournalEntries,
  editEntry,
  deleteEntry,
  getMoodData,
  getMoodFrequency
} from "../controllers/journalEntry.controller.js";

const router = Router();

// Create a new journal entry
router.post("/create", protect, createJournalEntry);

// Get all journal entries for the logged-in user
router.get("/entries", protect, getAllJournalEntries);

// Edit a journal entry
router.put("/entry/:id", protect, editEntry);

// Delete a journal entry
router.delete("/entry/:id", protect, deleteEntry);

// Get mood data for charts
router.get("/mood-data", protect, getMoodData);

// Get mood frequency data
router.get("/mood-frequency", protect, getMoodFrequency);


export default router;









// import { deleteEntry, entryJournal } from "../controllers/journalEntry.controller.js";
// // import Router from "express";
// // import { displayAllEntries } from "../controllers/user.controller.js";
// // import { protect } from "../utils/jwt.token.js";
// // import { verifyToken } from "../middleware/auth.middleware.js";

// // const router = Router();

// // router.post('/entry',verifyToken,entryJournal);
// // router.delete('/delete/:id',verifyToken,deleteEntry)
// // router.get('/allEntries/:userId',protect,displayAllEntries);

// // export default router; 


// import express from 'express';
// import { protect } from '../utils/jwt.token.js';
// import { deleteEntry,editEntry,getEntriesByUsername,addEntry,getMoodData,
//     // getStreak,
//     // getJournaledDates,
//     // getRecentEntries,
//  } from '../controllers/journalEntry.controller.js';

// import { Router } from 'express';

// const router = Router();
// // Secure all journal routes
// router.get('/getAllJournals', protect, getEntriesByUsername);
// router.post('/addJournal', protect, addEntry);
// router.patch('/updateJournal/:id', protect, editEntry);
// router.delete('/deleteJournal/:id', protect, deleteEntry);
// router.get('/mood-data', protect,getMoodData);

// // Streak counter
// // router.get('/streak', protect,getStreak);

// // Calendar highlights
// // router.get('/journal-dates',protect, getJournaledDates);

// // Recent entries
// // router.get('/recent-entries', protect,getRecentEntries);

// export default router;

