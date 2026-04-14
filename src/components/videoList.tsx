import { useEffect, useState } from "react";
import request from "../utils/request";
import { Link } from "react-router-dom";
import "./videoList.css"
import {Eye} from "lucide-react";

interface Video {
    publicId: string;
    title: string;
    coverUrl: string;
    author : string;
    duration: number;
    viewCount: number;
    likeCount: number;
}



export default function VideoList() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadVideos = async (isLoadMore = false) => {
        if (loading) return;
        if (isLoadMore && !hasMore) return;

        setLoading(true);

        const res = await request({
            url: "/api/video/list/cursor",
            method: "GET",
            params: {
                cursor: isLoadMore ? cursor : null,
                size: 10
            }
        });

        const list = res.data.list;
        const nextCursor = res.data.nextCursor;

        if (isLoadMore) {
            setVideos(prev => [...prev, ...list]);
        } else {
            setVideos(list);
        }
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
        setLoading(false);
    };

    useEffect(() => {
        loadVideos(false);
    }, []);

    useEffect(() => {
        if (!loading && hasMore) {
            const fullHeight = document.body.scrollHeight;
            const windowHeight = window.innerHeight;

            if (fullHeight <= windowHeight) {
                loadVideos(true);
            }
        }
    }, [videos]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.body.scrollHeight;
            console.log("scroll触发了");
            if (scrollTop + windowHeight >= fullHeight - 100) {
                loadVideos(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [cursor, loading, hasMore]);

    function formatCount(num: number) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + "万";
        }
        return num;
    }

    return (
        <div className="video-list">
            {videos.map(video => (
                <Link
                    key={video.publicId}
                    to={`/${video.publicId}`}
                    className="video-card"
                >
                    <div className="cover-wrapper">
                        <img src={video.coverUrl} className="cover" />
                        <span className={"view"}>
                            <Eye size={10} />
                            {formatCount(video.viewCount)}
                        </span>
                        <span className="duration">
    {(() => {
        const h = Math.floor(video.duration / 3600);
        const m = Math.floor((video.duration % 3600) / 60);
        const s = video.duration % 60;

        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${m}:${String(s).padStart(2, "0")}`;
    })()}
</span>
                    </div>

                    <div className="info">
                        <h3>{video.title}</h3>
                        <p>{video.author}</p>
                    </div>
                </Link>
            ))}

            <div className="load-more">
                {loading && <p>加载中...</p>}
                {!hasMore && <p>没有更多视频了</p>}
            </div>
        </div>
    );
}