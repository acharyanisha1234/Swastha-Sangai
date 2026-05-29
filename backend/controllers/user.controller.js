
import prisma from "../db/prisma.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: true
            }
        });
        console.log(user.profileImage);

        if (!user) {
            return res.status(400).json({ message: "User not found." })
        }

        res.status(200).json({
            userData: {
                id: user.id,
                fullName: user.fullName,
                isAccountVerified: user.isAccountVerified,
                email: user.email,
                age: user.age,
                weight: user.weight,
                height: user.height,
                goal: user.goal,
                profileImage: user.profileImage,
                friends: user.friends,
            }
        })
    } catch (error) {
        console.error("Error in getUserData controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const updateFitnessProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { age, weight, height, goal } = req.body;

        const updateData = {
            age: age,
            weight: weight,
            height: height,
            goal: goal
        };


        if (req.file) {
            updateData.profileImage = req.file.filename;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        res.status(200).json({
            message: "Fitness profile updated successfully",
            userData: {
                age: updatedUser.age,
                weight: updatedUser.weight,
                height: updatedUser.height,
                goal: updatedUser.goal,
                profileImage: updatedUser.profileImage,
            }
        });
    } catch (error) {
        console.error("Error in updateFitnessProfile controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                profileImage: true,
            }
        });
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error in getAllUsers controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

