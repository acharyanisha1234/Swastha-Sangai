import streakService from "../Service/streakService.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

class StreakController {
  async getStreak(req, res) {
    try {
      const userId = req.userId;
      console.log('Get streak for user:', userId);
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      const streak = await streakService.getUserStreak(userId);
      res.json({ success: true, data: streak });
    } catch (error) {
      console.error('Get streak error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch streak data' });
    }
  }

  async logWorkout(req, res) {
    try {
      const userId = req.userId;
      console.log('Log workout for user:', userId);
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      const verificationData = req.body;
      const result = await streakService.logWorkout(userId, verificationData);
      
      if (req.io) {
        req.io.to(`user-${userId}`).emit('streak-updated', {
          streak: result.streak,
          newRecord: result.newRecord
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Workout logged successfully', 
        data: result 
      });
    } catch (error) {
      console.error('Log workout error:', error);
      
      if (error.message === 'WORKOUT_ALREADY_LOGGED_TODAY' || error.alreadyLogged) {
        return res.status(400).json({ 
          success: false, 
          error: 'Workout already logged for today', 
          alreadyLogged: true 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to log workout' 
      });
    }
  }

  async logWorkoutWithPhoto(req, res) {
    try {
      const userId = req.userId;
      console.log('Log workout with photo for user:', userId);
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Photo is required to verify workout' 
        });
      }
      
      const note = req.body.note || '';
      const duration = req.body.duration || null;
      const workoutType = req.body.type || null;
      
      const result = await streakService.logWorkoutWithPhoto(userId, req.file, note, duration, workoutType);
      
      if (req.io) {
        req.io.to(`user-${userId}`).emit('streak-updated', {
          streak: result.streak,
          newRecord: result.newRecord,
          verified: true
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Workout logged successfully with photo verification', 
        data: result 
      });
    } catch (error) {
      console.error('Log workout with photo error:', error);
      
      if (error.message === 'WORKOUT_ALREADY_LOGGED_TODAY' || error.alreadyLogged) {
        return res.status(400).json({ 
          success: false, 
          error: 'Workout already logged for today', 
          alreadyLogged: true 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to log workout with photo' 
      });
    }
  }

  async resetStreak(req, res) {
    try {
      const userId = req.userId;
      console.log('Reset streak for user:', userId);
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      const result = await streakService.resetStreak(userId);
      
      if (req.io) {
        req.io.to(`user-${userId}`).emit('streak-updated', {
          streak: result,
          newRecord: false
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Streak reset successfully', 
        data: result 
      });
    } catch (error) {
      console.error('Reset streak error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to reset streak' 
      });
    }
  }

  async getWorkoutHistory(req, res) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      const days = parseInt(req.query.days) || 30;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      
      const history = await streakService.getWorkoutHistory(userId, days, startDate, endDate);
      
      res.json({ 
        success: true, 
        data: history 
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch workout history' 
      });
    }
  }

  async getStreakStats(req, res) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      const stats = await streakService.getStreakStats(userId);
      
      res.json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch streak statistics' 
      });
    }
  }

  async verifyActivity(req, res) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
      }
      
      const result = await streakService.checkSuspiciousActivity(userId);
      
      res.json({ 
        success: true, 
        ...result 
      });
    } catch (error) {
      console.error('Verify activity error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to verify activity' 
      });
    }
  }
}

export const workoutUpload = upload.single('photo');
export default new StreakController();