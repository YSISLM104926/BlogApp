import { AuthResolvers } from "./Auth";
import { PostResolvers } from "./Post";

export const Mutation = {  
    ...AuthResolvers,
    ...PostResolvers
}