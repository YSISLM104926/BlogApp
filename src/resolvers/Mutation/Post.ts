import { CheckUser } from "../../utils/CheckUser";

interface PostInput {
    title: string,
    content: string
}

export const PostResolvers = {
    addPost: async (parent: any, { post }: { post: PostInput }, { prisma, userInfo }: any) => {

        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            };
        }

        if (!post.title || !post.content) {
            return {
                userError: "Title and content is required!",
                post: null
            };
        }

        console.log("post", post);

        try {
            const newPost = await prisma.post.create({
                data: {
                    title: post.title,
                    content: post.content,
                    authorId: userInfo.userId // Ensure authorId is an integer if your schema expects it
                }
            });
            console.log("newPost", newPost)
            return {
                userError: null,
                post: newPost
            };
        } catch (error) {
            console.error('Error creating post:', error);
            return {
                userError: "An error occurred while creating the post",
                post: null
            };
        }
    },
    updatePost: async (parent: any, args: any, { prisma, userInfo }: any) => {
        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            };
        }
        const error = CheckUser(prisma, userInfo.userId, args.postId);
        if (error) {
            return error;
        }
        const updatedPost = await prisma.post.update({
            where: {
                id: Number(args.postId)
            },
            data: args.post
        });
        return {
            userError: null,
            post: updatedPost
        }

    },
    deletePost: async (parent: any, args: any, { prisma, userInfo }: any) => {
        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            };
        }
        const error = CheckUser(prisma, userInfo.userId, args.postId);
        if (error) {
            return error;
        }
        const deletedPost = await prisma.post.delete({
            where: {
                id: Number(args.postId)
            },
        });
        return {
            userError: null,
            post: deletedPost
        }

    },
    publishPost: async (parent: any, args: any, { prisma, userInfo }: any) => {
        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            };
        }
        const error = await CheckUser(prisma, userInfo.userId, args.postId);
        if (error) {
            return error;
        }
        const updatedPost = await prisma.post.update({
            where: {
                id: Number(args.postId)
            },
            data: {
                published: true
            }
        });
        return {
            userError: null,
            post: updatedPost
        }
    },


}