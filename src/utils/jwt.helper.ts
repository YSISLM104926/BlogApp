import jwt, { Secret } from 'jsonwebtoken'

export const JwtHelper = async(payload: {userId: number}, secret: Secret) => {
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
   return token;
}