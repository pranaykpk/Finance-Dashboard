import jwt from "jsonwebtoken"

const userMiddleware = (req,res,next)=>{
    // Accept token from either Authorization header or custom token header
    let token = req.headers.authorization?.split(' ')[1] || req.headers.token;
    
    if(!token){
        return res.status(401).json({
            message: "Missing authentication token"
        })
    }

    jwt.verify(token, "secret123", (err, decoded)=>{
        if(err){
            return res.status(401).json({
                message: "Authentication failed",
                error: err.message
            })
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    })
}

const permissionMiddleware=(allowed=['admin'])=>{
    return (req,res,next)=>{
        if(allowed.includes(req.role)){
            next()
        } else {
            res.status(403).json({
              message: "Not authorized for this action",
            });
        }
    }
}

export {userMiddleware , permissionMiddleware}