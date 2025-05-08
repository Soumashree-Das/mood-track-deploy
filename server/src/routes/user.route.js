import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile,
  displayAllEntries 
} from "../controllers/user.controller.js";
import { protect } from "../utils/jwt.token.js";

const router = Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.get("/allEntries/:userId", protect, displayAllEntries);

export default router;





// import {loginUser, logoutUser, registerUser} from "../controllers/user.controller.js";
// import { Router } from "express";
// import { protect } from "../utils/jwt.token.js";
// import { get } from "mongoose";

// const router = Router();

// router.post("/register",registerUser);
// router.post("/login",loginUser);
// router.post("/logout",logoutUser);
// // router.get("/allEntries/:userId",protect,getAllEntries);

// export default router;




// import { Router } from "express";
// import { registerUser, loginUser, logoutUser, displayAllEntries } from "../controllers/user.controller.js";
// import { protect } from "../utils/jwt.token.js";

// const router = Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);
// router.get("/allEntries/:userId", protect, displayAllEntries); // ✅ Uncommented and connected

// export default router;
