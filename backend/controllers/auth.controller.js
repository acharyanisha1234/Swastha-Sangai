import prisma from "../db/prisma.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import transporter from "../config/nodemailer.js";

const createToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || "secret123",
        { expiresIn: "7d" }
    );
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        if (!user) {
            res.status(400).json({ message: "Either your email or password is incorrect." })
        }
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Either your email or password is incorrect." })

        }

        const token = createToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Logged In successfully",
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error in signup controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await prisma.user.findUnique({
            where: { email: email },
        });

        if (userExists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
            },
        });

        const token = createToken(newUser.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // true only in prod
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Swastha_Sangai",
            text: `Welcome to Swastha_Sangai . Your account has been created with email id ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                fullName: newUser.fullName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error in signup controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
           secure: process.env.NODE_ENV === 'production',  // true only in prod
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })

        return res.status(200).json({ message: "Logged out successfully." })
    } catch (error) {
        console.error("Error in logout controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (user.isAccountVerified) {
            return res.status(400).json({ message: "The account is already verified." })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                verifyOtp: otp,
                verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
            },
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp} . Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Verification OTP sent on email." })

    } catch (error) {
        console.error("Error in sendVerifyOTP controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const userId = req.userId;
        const { otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ message: "Missing Details" })
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(400).json({ message: "User not found." })
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." })
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ message: "OTP Expired." })
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isAccountVerified: true,
                verifyOtp: '',
                verifyOtpExpireAt: 0,
            },
        });

        res.status(200).json({ message: "Email verified successfully." })
    } catch (error) {
        console.error("Error in verifyEmail controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" })
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.status(400).json({ message: "User not found." })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                resetOtp: otp,
                resetOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
            },
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for resetting password is ${otp} . Use this OTP to proceed resetting your password.`
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Password reset OTP sent successfully." })

    } catch (error) {
        console.error("Error in sendResetOTP controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email,OTP and newPassword are required." })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.status(400).json({ message: "User not found." })
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." })
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ message: "OTP has been expired." })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                password: hashedPassword,
                resetOtp: '',
                resetOtpExpireAt: 0,
            },
        });

        return res.status(200).json({ message: "Your password has been reset successfully." })


    } catch (error) {
        console.error("Error in resetPassword controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({ message: "User is authenticated." })
    } catch (error) {
        console.error("Error in isAuthenticated controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}