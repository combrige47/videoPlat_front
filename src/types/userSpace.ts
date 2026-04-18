import type {VideoInfo} from "./video.ts";

export interface SpaceVideoInfo{
    publicId: string;
    title: string;
    coverUrl : string;
    duration: number;
    viewCount: number;
    likeCount: number;
    favoriteCount: number;
    commentCount: number;
}

export interface VideoCardPros{
    video: VideoInfo;
}

export interface SpaceInfo{
    userId: number;
    userName: string;
    avatar: string;
    bio: string;
    videoCount: number;
    followCount: number;
    fansCount: number;
    likeTotal: number;
    isMe: boolean;
    isFollowing: boolean;
    isFollowed: boolean;
    myVideos: SpaceVideoInfo[];
    likeVideos: SpaceVideoInfo[];
    favoriteVideos: SpaceVideoInfo[];
}