import request from "../utils/request";
import type { CommentPage } from "../types/comment";

export const getRootComments = (publicId: string, cursor?: number) => {
    return request<CommentPage>({
        url: "/api/comment/root",
        method: "GET",
        params: { publicId, cursor, size: 10 }
    });
};