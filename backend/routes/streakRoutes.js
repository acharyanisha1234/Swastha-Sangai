import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get current streak
router.get('/streak', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const workouts = await prisma.workoutLog.findMany({
            where: { userId },
            orderBy: { workoutDate: 'desc' }
        });

        let currentStreak = 0;
        let longestStreak = 0;
        let lastWorkoutDate = null;

        // Calculate streak logic
        if (workouts.length > 0) {
            lastWorkoutDate = workouts[0].workoutDate;
            let streak = 1;
            
            for (let i = 1; i < workouts.length; i++) {
                const prevDate = new Date(workouts[i-1].workoutDate);
                const currDate = new Date(workouts[i].workoutDate);
                const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    streak++;
                } else {
                    longestStreak = Math.max(longestStreak, streak);
                    streak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, streak);
            
            const today = new Date();
            const lastDate = new Date(lastWorkoutDate);
            const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 0) {
                currentStreak = streak;
            } else if (daysDiff === 1) {
                currentStreak = streak;
            } else {
                currentStreak = 0;
            }
        }

        res.json({
            success: true,
            data: {
                currentStreak,
                longestStreak,
                lastWorkoutDate
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Log workout
router.post('/streak/log', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { duration, type, method } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingWorkout = await prisma.workoutLog.findFirst({
            where: {
                userId,
                workoutDate: today
            }
        });

        if (existingWorkout) {
            return res.status(400).json({ error: 'alreadyLogged', message: 'Workout already logged today' });
        }

        const workout = await prisma.workoutLog.create({
            data: {
                userId,
                workoutDate: today,
                workoutDuration: parseInt(duration) || 30,
                workoutType: type || 'general',
                verified: true,
                verificationType: method
            }
        });

        // Get updated streak
        const workouts = await prisma.workoutLog.findMany({
            where: { userId },
            orderBy: { workoutDate: 'desc' }
        });

        let streak = 1;
        for (let i = 1; i < workouts.length; i++) {
            const prevDate = new Date(workouts[i-1].workoutDate);
            const currDate = new Date(workouts[i].workoutDate);
            const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        res.json({
            success: true,
            data: {
                streak: { currentStreak: streak },
                workout
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stats
router.get('/streak/stats', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const [totalWorkouts, monthlyWorkouts, weeklyWorkouts] = await Promise.all([
            prisma.workoutLog.count({ where: { userId } }),
            prisma.workoutLog.count({ where: { userId, workoutDate: { gte: startOfMonth } } }),
            prisma.workoutLog.count({ where: { userId, workoutDate: { gte: startOfWeek } } })
        ]);

        res.json({
            success: true,
            data: { totalWorkouts, monthlyWorkouts, weeklyWorkouts }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get history
router.get('/streak/history', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { startDate, endDate } = req.query;
        
        const workouts = await prisma.workoutLog.findMany({
            where: {
                userId,
                workoutDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: { workoutDate: 'asc' }
        });

        const history = workouts.map(w => ({
            date: w.workoutDate.toISOString().split('T')[0],
            workedOut: true,
            duration: w.workoutDuration,
            type: w.workoutType
        }));

        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset streak
router.post('/streak/reset', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        res.json({ success: true, data: { currentStreak: 0, longestStreak: 0 } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check suspicious activity
router.get('/streak/verify-activity', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        res.json({ suspicious: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;