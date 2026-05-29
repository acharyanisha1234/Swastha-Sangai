import express from "express"
import { checkAuth } from "../middlewares/auth.middleware.js";
import { getAllUsers, getUserData, updateFitnessProfile } from "../controllers/user.controller.js";
import { updateLocation, getNearbySuggestions } from "../controllers/friendship.controller.js";
import uploadFactory from "../middlewares/uploadFactory.js";

const userRouter = express.Router();
const uploadProfilePic = uploadFactory("profile-pics");

userRouter.get('/user-data', checkAuth, getUserData);
userRouter.put('/update-fitness-profile', checkAuth, uploadProfilePic.single('profileImage'), updateFitnessProfile);
userRouter.get('/getAllUsers', checkAuth, getAllUsers);
userRouter.post('/update-location', checkAuth, updateLocation);
userRouter.get('/nearby-suggestions', checkAuth, getNearbySuggestions);

export default userRouter;