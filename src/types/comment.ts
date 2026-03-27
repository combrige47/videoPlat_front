export interface CommentAuthor {
    id: number;
    userName: string;
    avatar?: string;
}

export interface Comment {
    id: number;
    rootId : number;
    content: string;
    likeCount: number;
    replyCount: number;
    createdTime: string;
    liked: boolean;

    author: {
        id: number;
        userName: string;
        avatar: string;
    };

    previewReply?: Comment[];
}

export interface CommentInfo {
    id: number;
    videoId: number;
    userId: number;

    parentId?: number;
    rootId?: number;

    content: string;

    likeCount: number;
    replyCount: number;

    status: number;
    createdTime: string;

    author: CommentAuthor;

    previewReply?: CommentInfo[];
}
export interface CreateCommentRequest {
    publicId: string;
    parentId?: number;
    rootId?: number;
    content: string;
}
export interface CommentPage {
    list: CommentInfo[];
    nextCursor?: number;
}