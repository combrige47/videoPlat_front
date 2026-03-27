export interface AuthorInfo {
    id: number;
    username: string;
    avatar?: string;
}

export interface VideoInfo {
    publicId: string;
    authorId: number;
    title: string;
    description?: string;
    coverUrl?: string;

    duration?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    favoriteCount: number;

    publishTime: string;

    author: AuthorInfo;
}
export interface PageResponse<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}