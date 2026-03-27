import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import request from "../utils/request";
import "./VideoPlayer.css";
import CommentSection from "../components/CommentSection";

interface VideoInfo {
    title: string;
    description: string;
    likeCount: number;
    viewCount: number;
    liked: boolean;
    author: {
        username: string;
        avatar: string;
    };
}

export default function VideoPlayer() {
    const { publicId } = useParams();
    const [video, setVideo] = useState<VideoInfo | null>(null);
    const [Liked,setLiked] = useState(false);
    const [LikeCount,setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (!video || loading) return;

        setLoading(true);

        try {
            const isLiked = video.liked;

            const url = isLiked
                ? `/api/video/unlike/${publicId}`
                : `/api/video/like/${publicId}`;

            await request({ url, method: "POST" });

            setVideo(prev => {
                if (!prev) return prev;

                return {
                    ...prev,
                    liked: !isLiked,
                    likeCount: isLiked
                        ? prev.likeCount - 1
                        : prev.likeCount + 1
                };
            });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        request({
            url: `/api/video/info/${publicId}`,
            method: "GET",
        }).then(res => {
            const data = res.data;

            setVideo(data);
            setLiked(data.liked);
            setLikeCount(data.likeCount);
        });
    }, [publicId]);

    if (!video) return <div>加载中...</div>;

    return (
        <div className="player-page">
            {/* 左侧 */}
            <div className="main">
                <video
                    className="video"
                    controls
                    src={`http://localhost:24352/api/video/${publicId}`}
                />

                <h2 className="title">{video.title}</h2>

                <div className="meta">
                    <div className="author">
                        <img
                            src={video.author.avatar || "https://via.placeholder.com/40"}
                            className="avatar"
                        />
                        <span>{video.author.username}</span>
                    </div>

                    <div className="stats">
                        👀 {video.viewCount}
                        <button onClick={handleLike}>
                            {video.liked ? "❤️ 已点赞" : "🤍 点赞"} ({video.likeCount})
                        </button>
                    </div>
                </div>

                <div className="desc">
                    {video.description || "暂无简介"}
                </div>
                <CommentSection />
            </div>

            {/* 右侧 */}
            <div className="sidebar">
                <h3>推荐视频</h3>
            </div>



        </div>


    );
}