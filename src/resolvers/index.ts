import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'
import { JwtHelper } from "../utils/jwt.helper";
import config from "../config";

interface UserInfo {
    name: string,
    email: string,
    password: string
}
interface UserLogType {
    email: string,
    password: string
}
export const resolvers = {
    Query: {
        users: async (parent: any, args: any, context: any) => {
            return await prisma.user.findMany();
        }
    },
    Mutation: {
        signup: async (parent: any, args: UserInfo, context: any) => {
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
            const token = await JwtHelper({ userId: newUser.id }, config.jwt.secret as string);
            return {
                userError: null,
                token
            }
        },
        signin: async (parent: any, args: UserLogType, context: any) => {
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
};
