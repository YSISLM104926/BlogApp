import bcrypt from 'bcrypt'
import config from '../../config'
import { JwtHelper } from '../../utils/jwt.helper'

interface UserInfo {
    name: string,
    email: string,
    password: string,
    bio?: string,
}

interface UserLogType {
    email: string,
    password: string
}

export const Mutation = {
    signup: async (parent: any, args: UserInfo, {prisma}: any) => {
        const isExist = await prisma.user.findFirst({
            where: {
                email: args.email
            }
        })
        if (isExist) {
            return {
                isError: "User already Exist",
                token: null
            }
        }
        const hashedPassword: string = await bcrypt.hash(args.password, 12)
        const newUser = await prisma.user.create({
            data: {
                name: args.name,
                email: args.email,
                password: hashedPassword
            }
        })
        if (args.bio) {
            await prisma.profile.create({
                data: {
                    bio: args.bio,
                    userId: newUser.id as any 
                }
            })
        }
        const token = await JwtHelper({ userId: newUser.id }, config.jwt.secret as string);
        return {
            userError: null,
            token
        }
    },
    signin: async (parent: any, args: UserLogType, {prisma}: any) => {
        const user = await prisma.user.findFirst({
            where: {
                email: args.email
            }
        })
        if (!user) {
            return {
                userError: "User not found!",
                token: null
            }
        }
        const isValidPassword = await bcrypt.compare(args.password, user.password);
        if (!isValidPassword) {
            return {
                userError: "Password is not valid!",
                token: null
            }
        }
        const token = await JwtHelper({ userId: user.id }, config.jwt.secret as string);
        return {
            userError: null,
            token
        }
    }
}