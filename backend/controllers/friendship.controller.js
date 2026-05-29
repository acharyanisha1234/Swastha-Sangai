import prisma from "../db/prisma.js"

// ─── In-memory location store (no DB) ───────────────────────────
const userLocations = new Map()

// Auto-clean locations older than 1 hour every 15 mins
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [userId, data] of userLocations.entries()) {
        if (data.updatedAt < oneHourAgo) userLocations.delete(userId)
    }
}, 15 * 60 * 1000)

// Haversine formula — returns distance in km
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// POST /api/user/update-location
export const updateLocation = (req, res) => {
    try {
        const userId = req.userId
        const { lat, lng } = req.body
        if (!lat || !lng) {
            return res.status(400).json({ message: "lat and lng are required" })
        }
        userLocations.set(userId, { lat, lng, updatedAt: Date.now() })
        return res.status(200).json({ message: "Location updated successfully" })
    } catch (error) {
        console.error("Error in updateLocation", error)
        return res.status(500).json({ message: "Internal Server error" })
    }
}

// GET /api/user/nearby-suggestions
export const getNearbySuggestions = async (req, res) => {
    try {
        const userId = req.userId
        const RADIUS_KM = 10

        const myLocation = userLocations.get(userId)
        if (!myLocation) {
            return res.status(400).json({ message: "Your location is not shared yet." })
        }

        const nearbyUserIds = []
        for (const [otherUserId, data] of userLocations.entries()) {
            if (otherUserId === userId) continue
            const dist = haversineDistance(myLocation.lat, myLocation.lng, data.lat, data.lng)
            if (dist <= RADIUS_KM) nearbyUserIds.push(otherUserId)
        }

        if (nearbyUserIds.length === 0) {
            return res.status(200).json({ message: "No nearby users found.", suggestions: [] })
        }

        const [friends, sentRequests] = await Promise.all([
            prisma.friend.findMany({ where: { userId } }),
            prisma.friendRequest.findMany({ where: { senderId: userId, status: "PENDING" } })
        ])

        const friendIds = friends.map(f => f.friendId)
        const sentRequestIds = sentRequests.map(r => r.receiverId)
        const excludeIds = [...friendIds, ...sentRequestIds, userId]

        const suggestions = await prisma.user.findMany({
            where: {
                id: {
                    in: nearbyUserIds.filter(id => !excludeIds.includes(id))
                }
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                profileImage: true,
                goal: true,
            }
        })

        return res.status(200).json({ message: "Nearby suggestions fetched", suggestions })
    } catch (error) {
        console.error("Error in getNearbySuggestions", error)
        return res.status(500).json({ message: "Internal Server error" })
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.userId;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        if (receiverId === senderId) {
            return res.status(400).json({ message: "Cannot send friend request to yourself." });
        }

        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
        });

        if (!receiver) {
            return res.status(400).json({ message: "Receiver not found." });
        }

        const newRequest = await prisma.friendRequest.create({
            data: {
                senderId,
                receiverId
            }
        });
        res.status(200).json({ message: "Friend request sent successfully", request: newRequest });
    } catch (error) {
        console.error("Error in sendFriendRequest controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const receiverId = req.userId;
        const { senderId } = req.body;

        if (!senderId) {
            return res.status(400).json({ message: "Sender ID is required" });
        }

        const friendRequest = await prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId,
                    receiverId,
                },
            },
        });

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friendRequest.status !== "PENDING") {
            return res.status(400).json({ message: "Friend request already handled" });
        }

        await prisma.$transaction([
            prisma.friendRequest.update({
                where: {
                    senderId_receiverId: {
                        senderId,
                        receiverId,
                    },
                },
                data: {
                    status: "ACCEPTED",
                    respondedAt: new Date(),
                },
            }),

            prisma.friend.createMany({
                data: [
                    { userId: senderId, friendId: receiverId },
                    { userId: receiverId, friendId: senderId },
                ],
                skipDuplicates: true,
            }),
        ]);

        res.status(200).json({ message: "Friend request accepted successfully" });
    } catch (error) {
        console.error("Error in acceptFriendRequest controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

export const getPendingSentRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const sentRequests = await prisma.friendRequest.findMany({
            where: { senderId: userId },
            include: {
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        if (sentRequests.length === 0) {
            return res.status(200).json({ message: "No sent friend requests found.", sentRequests: [] });
        }

        const pendingRequests = sentRequests.filter(request => request.status === 'PENDING');

        if (pendingRequests.length === 0) {
            return res.status(200).json({ message: "No pending friend requests found.", sentRequests: [] });
        }

        res.status(200).json({ message: "Sent friend requests retrieved successfully", sentRequests: pendingRequests });
    } catch (error) {
        console.error("Error in getAllPendingSentRequests controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const getPendingReceivedRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const receivedRequests = await prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: "PENDING"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        if (receivedRequests.length === 0) {
            return res.status(200).json({ message: "No pending received friend requests found.", receivedRequests: [] });
        }

        const pendingRequests = receivedRequests.filter(request => request.status === 'PENDING');

        if (pendingRequests.length === 0) {
            return res.status(200).json({ message: "No pending received friend requests found.", receivedRequests: [] });
        }

        res.status(200).json({ message: "Received pending friend requests retrieved successfully", receivedRequests: pendingRequests });
    } catch (error) {
        console.error("Error in getPendingReceivedRequests controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export const getAllSentRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const sentRequests = await prisma.friendRequest.findMany({
            where: { senderId: userId },
            include: {
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true
                    }
                }
            }
        });

        if (sentRequests.length === 0) {
            return res.status(200).json({ message: "No sent friend requests found.", sentRequests: [] });
        }

        res.status(200).json({ message: "Sent friend requests retrieved successfully", sentRequests: sentRequests });
    } catch (error) {
        console.error("Error in getAllSentRequests controller", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
}