import jwt from "jsonwebtoken";

export const checkAuth = async (req, res, next) => {
    let token = null;
    
    // Check Authorization header
    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.headers.authorization;
        }
    }
    
    // If not in header, check cookies
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }
    
    // If token is "null" string or empty, reject
    if (!token || token === 'null' || token === 'undefined') {
        console.log('Invalid token:', token);
        return res.status(401).json({ 
            success: false,
            message: "Please login first" 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified for user ID:', decoded.id);

        if (decoded.id) {
            req.userId = decoded.id;
        } else {
            return res.status(400).json({ 
                success: false,
                message: "Invalid token format" 
            });
        }
        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again." 
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: "Authentication error" 
        });
    }
};