import request from "../utils/request";
import type { VideoInfo, PageResponse } from "../types/video";

export const getVideoList = (page: number, size: number) => {
    return request<PageResponse<VideoInfo>>({
        url: "/api/video/list",
        method: "GET",
        params: { page, size }
    });
};