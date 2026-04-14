import { useParams } from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import request from "../utils/request";
import "./VideoPlayer.css";
import CommentSection from "../components/CommentSection";
import * as dashjs from "dashjs";
import { useRef } from "react";
import { Eye, Heart } from "lucide-react";

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
    const [,setLiked] = useState(false);
    const [,setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<dashjs.MediaPlayerClass | null>(null);

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
            setTags(data.tags);
        });
    }, [publicId]);

    const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
        if (node) {
            // 如果已经初始化过同一个 ID 的播放器，就不再重复初始化
            if (playerRef.current) return;

            console.log("检测到视频节点已挂载，开始初始化播放器");
            const player = dashjs.MediaPlayer().create();
            player.initialize(
                node,
                `http://localhost:24352/api/video/${publicId}/dash/manifest.mpd`,
                false
            );
            playerRef.current = player;
        } else {
            // 当组件卸载或节点消失时，销毁播放器
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        }
    }, [publicId]);

    const handlePlay = () => {
        if (!publicId) return;

        const key = `viewed_${publicId}`;
        if (sessionStorage.getItem(key)) return;

        request({
            url: `/api/video/${publicId}/view`,
            method: "POST"
        });

        sessionStorage.setItem(key, "1");
    };

    function formatCount(num: number) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + "万";
        }
        return num;
    }

    if (!video) return <div>加载中...</div>;

    return (
        <div className="player-page">
            <div className="main">
                <video
                    ref={videoRefCallback}
                    className="video"
                    controls
                    onPlay={handlePlay}
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
                        <div className="views">
                            <Eye size={16} />
                            <span>{formatCount(video.viewCount)}</span>
                        </div>

                        <button
                            className={`like-btn ${video.liked ? "liked" : ""}`}
                            onClick={handleLike}
                        >
                            <Heart size={16} fill={video.liked ? "currentColor" : "none"}/>
                            <span>{formatCount(video.likeCount)}</span>
                        </button>
                    </div>
                </div>

                <div className="desc">
                    {video.description || "暂无简介"}
                </div>
                <div className="tag-list">
                    {tags?.map((tag: string, index: number) => (
                        <span key={index} className="tag-item">
            {tag}
        </span>
                    ))}
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