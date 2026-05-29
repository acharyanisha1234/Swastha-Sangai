import prisma from '../db/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StreakService {
  async getUserStreak(userId) {
    try {
      const workoutLogs = await prisma.workoutLog.findMany({
        where: { userId: userId },
        orderBy: { workoutDate: 'desc' },
        select: { workoutDate: true }
      });
      
      if (workoutLogs.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastWorkoutDate: null
        };
      }
      
      const workoutDates = [...new Set(workoutLogs.map(log => 
        new Date(log.workoutDate).toISOString().split('T')[0]
      ))].sort();
      
      const today = new Date().toISOString().split('T')[0];
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      for (let i = workoutDates.length - 1; i >= 0; i--) {
        const dateStr = workoutDates[i];
        const expectedDateStr = checkDate.toISOString().split('T')[0];
        
        if (dateStr === expectedDateStr) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      let longestStreak = 0;
      let tempStreak = 1;
      
      if (workoutDates.length > 0) {
        for (let i = 1; i < workoutDates.length; i++) {
          const prevDate = new Date(workoutDates[i - 1]);
          const currDate = new Date(workoutDates[i]);
          const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
      
      return {
        currentStreak,
        longestStreak,
        lastWorkoutDate: workoutLogs[0]?.workoutDate || null
      };
    } catch (error) {
      console.error('Error getting user streak:', error);
      throw error;
    }
  }

  async logWorkout(userId, verificationData = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingWorkout = await prisma.workoutLog.findFirst({
        where: {
          userId: userId,
          workoutDate: {
            gte: today,
            lt: tomorrow
          }
        }
      });
      
      if (existingWorkout) {
        const error = new Error('WORKOUT_ALREADY_LOGGED_TODAY');
        error.alreadyLogged = true;
        throw error;
      }
      
      await prisma.workoutLog.create({
        data: {
          userId: userId,
          workoutDate: today,
          verified: verificationData ? true : false,
          verificationType: verificationData?.method || null,
          workoutDuration: verificationData?.duration ? parseInt(verificationData.duration) : null,
          workoutType: verificationData?.type || null,
          verifiedAt: verificationData ? new Date() : null
        }
      });
      
      const updatedStreak = await this.getUserStreak(userId);
      const previousLongest = updatedStreak.longestStreak;
      const newRecord = updatedStreak.currentStreak > previousLongest;
      
      return {
        streak: updatedStreak,
        newRecord,
        verified: !!verificationData
      };
    } catch (error) {
      console.error('Error logging workout:', error);
      throw error;
    }
  }

  async logWorkoutWithPhoto(userId, photoFile, note = '', duration = null, workoutType = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingWorkout = await prisma.workoutLog.findFirst({
        where: {
          userId: userId,
          workoutDate: {
            gte: today,
            lt: tomorrow
          }
        }
      });
      
      if (existingWorkout) {
        const error = new Error('WORKOUT_ALREADY_LOGGED_TODAY');
        error.alreadyLogged = true;
        throw error;
      }
      
      let photoUrl = null;
      if (photoFile) {
        const uploadDir = path.join(__dirname, '../uploads/workouts');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const filename = `workout_${userId}_${timestamp}.jpg`;
        const filepath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filepath, photoFile.buffer);
        photoUrl = `/uploads/workouts/${filename}`;
      }
      
      await prisma.workoutLog.create({
        data: {
          userId: userId,
          workoutDate: today,
          verified: true,
          verificationType: 'photo',
          photoUrl: photoUrl,
          workoutNote: note,
          workoutDuration: duration ? parseInt(duration) : null,
          workoutType: workoutType || null,
          verifiedAt: new Date()
        }
      });
      
      const updatedStreak = await this.getUserStreak(userId);
      const previousLongest = updatedStreak.longestStreak;
      const newRecord = updatedStreak.currentStreak > previousLongest;
      
      return {
        streak: updatedStreak,
        newRecord,
        verified: true,
        photoUrl
      };
    } catch (error) {
      console.error('Error logging workout with photo:', error);
      throw error;
    }
  }

  async resetStreak(userId) {
    try {
      const streak = await this.getUserStreak(userId);
      
      return {
        currentStreak: 0,
        longestStreak: streak.longestStreak,
        lastWorkoutDate: null
      };
    } catch (error) {
      console.error('Error resetting streak:', error);
      throw error;
    }
  }

  async getWorkoutHistory(userId, days = 30, startDate = null, endDate = null) {
    try {
      let whereClause = { userId: userId };
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        whereClause.workoutDate = {
          gte: start,
          lte: end
        };
      } else {
        const startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - days);
        startDateCalc.setHours(0, 0, 0, 0);
        
        whereClause.workoutDate = {
          gte: startDateCalc
        };
      }
      
      const workouts = await prisma.workoutLog.findMany({
        where: whereClause,
        orderBy: {
          workoutDate: 'desc'
        },
        select: {
          workoutDate: true,
          id: true,
          verified: true,
          verificationType: true,
          photoUrl: true,
          workoutNote: true
        }
      });
      
      const workoutMap = {};
      workouts.forEach(workout => {
        const dateStr = workout.workoutDate.toISOString().split('T')[0];
        workoutMap[dateStr] = {
          workedOut: true,
          verified: workout.verified,
          verificationType: workout.verificationType,
          photoUrl: workout.photoUrl,
          note: workout.workoutNote
        };
      });
      
      const history = [];
      
      if (startDate && endDate) {
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        
        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split('T')[0];
          history.push({
            date: dateStr,
            workedOut: !!workoutMap[dateStr],
            verified: workoutMap[dateStr]?.verified || false,
            verificationType: workoutMap[dateStr]?.verificationType || null
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const dateStr = date.toISOString().split('T')[0];
          
          history.push({
            date: dateStr,
            workedOut: !!workoutMap[dateStr],
            verified: workoutMap[dateStr]?.verified || false,
            verificationType: workoutMap[dateStr]?.verificationType || null
          });
        }
      }
      
      return history;
    } catch (error) {
      console.error('Error getting workout history:', error);
      throw error;
    }
  }

  async getStreakStats(userId) {
    try {
      const totalWorkouts = await prisma.workoutLog.count({
        where: { userId: userId }
      });
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const monthlyWorkouts = await prisma.workoutLog.count({
        where: {
          userId: userId,
          workoutDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });
      
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const weeklyWorkouts = await prisma.workoutLog.count({
        where: {
          userId: userId,
          workoutDate: {
            gte: startOfWeek
          }
        }
      });
      
      const streak = await this.getUserStreak(userId);
      
      return {
        totalWorkouts,
        monthlyWorkouts,
        weeklyWorkouts,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastWorkoutDate: streak.lastWorkoutDate
      };
    } catch (error) {
      console.error('Error getting streak stats:', error);
      throw error;
    }
  }

  async checkSuspiciousActivity(userId) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentWorkouts = await prisma.workoutLog.findMany({
        where: {
          userId: userId,
          workoutDate: {
            gte: sevenDaysAgo
          }
        },
        orderBy: {
          workoutDate: 'desc'
        }
      });
      
      let suspicious = false;
      
      if (recentWorkouts.length > 5) {
        const verifiedCount = recentWorkouts.filter(w => w.verified).length;
        if (verifiedCount === 0) {
          suspicious = true;
        }
      }
      
      return { suspicious };
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return { suspicious: false };
    }
  }
}

export default new StreakService();