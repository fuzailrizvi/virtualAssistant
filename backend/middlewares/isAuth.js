import jwt from 'jsonwebtoken';

const isAuth = (req, res, next) => {
try {
    const token=req.cookies.token;
    if(!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const verifyToken=jwt.verify(token, process.env.JWT_SECRET);
    req.userId=verifyToken.id;
    next();
}
catch (error) {
    console.log('Error in isAuth middleware:', error);
    return res.status(500).json({ message: 'Server error' });
    
}
}


export default isAuth;