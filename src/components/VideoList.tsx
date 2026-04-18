import { useEffect, useState } from "react";
import request from "../utils/request";
import Banner from "../components/Banner.tsx"
import "./videoList.css";
import VideoCard from "./VideoCard.tsx";

interface Video {
    publicId: string;
    title: string;
    coverUrl: string;
    author: { username: string };
    publishTime: string;
    duration: number;
    viewCount: number;
    likeCount: number;
}
function SkeletonCard() {
    return (
        <div className="vl-card vl-skeleton">
            <div className="vl-cover-wrap vl-ske-cover" />
            <div className="vl-info">
                <div className="vl-ske-line vl-ske-title" />
                <div className="vl-ske-line vl-ske-sub" />
                <div className="vl-ske-line vl-ske-meta" />
            </div>
        </div>
    );
}

export default function VideoList() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [activeTag, setActiveTag] = useState("全部");


    const loadVideos = async (isLoadMore = false) => {
        if (loading) return;
        if (isLoadMore && !hasMore) return;

        setLoading(true);
        const res = await request({
            url: "/api/video/list/cursor",
            method: "GET",
            params: { cursor: isLoadMore ? cursor : null, size: 10 },
        });

        const list = res.data.list;
        const nextCursor = res.data.nextCursor;

        setVideos(prev => isLoadMore ? [...prev, ...list] : list);
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
        setLoading(false);
        setInitializing(false);
    };

    useEffect(() => { loadVideos(false); }, []);

    useEffect(() => {
        if (!loading && hasMore) {
            if (document.body.scrollHeight <= window.innerHeight) loadVideos(true);
        }
    }, [videos]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 150) {
                loadVideos(true);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [cursor, loading, hasMore]);

    return (
        <div className="vl-root">

            <Banner
                title="发现好视频"
                subtitle="每天更新 · 精选内容 · 无限探索"
                tags={["全部"]}
                activeTag={activeTag}
                onTagClick={setActiveTag}
            />

            {/* ── 网格 ── */}
            <div className="vl-content-area">
            <div className="vl-grid">
                {initializing
                    ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
                    : videos.map(video => (
                        <VideoCard key={video.publicId} video={video} />
                    ))
                }
            </div>

            {/* ── 底部状态 ── */}
            <div className="vl-footer">
                {loading && !initializing && (
                    <div className="vl-loading">
                        <span className="vl-spinner" />
                        <span>加载中</span>
                    </div>
                )}
                {!hasMore && !initializing && (
                    <div className="vl-end">
                        <span className="vl-end-line" />
                        <span className="vl-end-text">已经到底了</span>
                        <span className="vl-end-line" />
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}