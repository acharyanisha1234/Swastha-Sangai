import express from "express"
import { isAuthenticated, login, logout, resetPassword, sendResetOtp, sendVerifyOtp, signup, verifyEmail } from "../controllers/auth.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post('/login',login);
authRouter.post('/signup',signup);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',checkAuth,sendVerifyOtp);
authRouter.post('/verify-email',checkAuth,verifyEmail);
authRouter.get('/is-auth',checkAuth,isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);

export default authRouter;