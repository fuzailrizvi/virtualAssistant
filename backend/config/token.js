import jwt from 'jsonwebtoken';
const getToken = async (userId) => {
    try {
        const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '10d' });
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
    }
}

export default getToken;