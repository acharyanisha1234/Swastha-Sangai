import express from 'express';
import { acceptFriendRequest, getAllSentRequests, getPendingReceivedRequests, getPendingSentRequests, sendFriendRequest } from '../controllers/friendship.controller.js';
import { checkAuth } from '../middlewares/auth.middleware.js';

const friendshipRouter = express.Router();

friendshipRouter.post('/send-request',checkAuth,sendFriendRequest);
friendshipRouter.get('/sent-pending-requests',checkAuth,getPendingSentRequests);
friendshipRouter.get('/received-pending-requests',checkAuth,getPendingReceivedRequests);
friendshipRouter.get('/sent-requests',checkAuth,getAllSentRequests);
friendshipRouter.post('/accept-request',checkAuth,acceptFriendRequest);

export default friendshipRouter;