import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { SpaceVideoInfo, SpaceInfo } from "../types/userSpace.ts";
import request from "../utils/request.ts";
import "./UserSpace.css";
import VideoCard from "../components/VideoCard.tsx";
import CropModal from "../components/CropModal.tsx";

type TabKey = "videos" | "likes" | "favorites";

const TABS: { key: TabKey; label: string }[] = [
    { key: "videos",    label: "TA的视频" },
    { key: "likes",     label: "TA的点赞" },
    { key: "favorites", label: "TA的收藏" },
];

export default function UserSpace() {
    const { userId } = useParams();
    const [spaceInfo, setSpaceInfo] = useState<SpaceInfo | undefined>();
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("videos");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("请选择图片文件"); return; }
        setCropImage(URL.createObjectURL(file));
        e.target.value = "";
    };

    const handleCropConfirm = async (blob: Blob) => {
        const formData = new FormData();
        formData.append("faceFile", blob, "avatar.jpg");
        const res = await request({ url: "/api/user/face/upload", method: "POST", data: formData });
        setSpaceInfo(prev => prev ? { ...prev, avatar: `/api/user/face/get/${res.data}` } : prev);
        setCropImage(null);
    };

    useEffect(() => {
        document.body.style.overflow = cropImage ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [cropImage]);

    useEffect(() => {
        if (!userId) return;
        request({ url: `/api/space/${userId}`, method: "GET" }).then(res => setSpaceInfo(res.data));
    }, [userId]);

    const follow = async () => {
        const newState = !spaceInfo?.isFollowed;
        setSpaceInfo(prev => prev ? { ...prev, isFollowed: newState } : prev);
        try {
            await request({ url: `/api/user/${newState ? "follow" : "unfollow"}/${userId}`, method: "POST" });
        } catch {
            setSpaceInfo(prev => prev ? { ...prev, isFollowed: !newState } : prev);
        }
    };

    const tabVideos: Record<TabKey, SpaceVideoInfo[]> = {
        videos:    spaceInfo?.myVideos    ?? [],
        likes:     spaceInfo?.likeVideos  ?? [],
        favorites: spaceInfo?.favoriteVideos ?? [],
    };

    const currentVideos = tabVideos[activeTab];

    return (
        <div className="us-root">

            {/* ── Banner ── */}
            <div className="us-banner">
                <div className="us-banner-bg" />

                {/* 头像 */}
                <div className="us-avatar-anchor">
                    <div
                        className="us-avatar-wrap"
                        onClick={() => spaceInfo?.isMe && fileInputRef.current?.click()}
                        style={{ cursor: spaceInfo?.isMe ? "pointer" : "default" }}
                    >
                        <img
                            src={spaceInfo?.avatar || "https://via.placeholder.com/96"}
                            alt="avatar"
                            className="us-avatar-img"
                        />
                        {spaceInfo?.isMe && (
                            <div className="us-avatar-overlay">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 20H5a2 2 0 01-2-2V9a2 2 0 012-2h1.5l2-3h7l2 3H20a2 2 0 012 2v4"
                                          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8"/>
                                    <path d="M18 14v6M15 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                </svg>
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef}
                           style={{ display: "none" }} onChange={handleFileChange} />
                </div>
            </div>

            {/* ── 身份信息 ── */}
            <div className="us-identity">
                <div className="us-name-row">
                    <h1 className="us-username">{spaceInfo?.userName ?? "加载中…"}</h1>
                    {spaceInfo?.isMe ? (
                        <span className="us-self-tag">自己</span>
                    ) : (
                        <button
                            className={`us-follow-btn ${spaceInfo?.isFollowed ? "us-follow-btn--active" : ""}`}
                            onClick={follow}
                        >
                            {spaceInfo?.isFollowed ? "已关注" : "+ 关注"}
                        </button>
                    )}
                </div>
                <p className="us-bio">{spaceInfo?.bio || "这个人很懒，还没写简介~"}</p>

                {/* 数据统计 */}
                <div className="us-stats">
                    {[
                        { label: "视频", value: spaceInfo?.videoCount },
                        { label: "粉丝", value: spaceInfo?.fansCount },
                        { label: "关注", value: spaceInfo?.followCount },
                        { label: "获赞", value: spaceInfo?.likeTotal },
                    ].map(({ label, value }) => (
                        <div className="us-stat-item" key={label}>
                            <span className="us-stat-value">{value ?? "–"}</span>
                            <span className="us-stat-label">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tab 切换 ── */}
            <div className="us-tabs-wrap">
                <div className="us-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`us-tab ${activeTab === tab.key ? "us-tab--active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            <span className="us-tab-count">
                                {tabVideos[tab.key].length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── 视频网格 ── */}
            <div className="us-content">
                {currentVideos.length === 0 ? (
                    <div className="us-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity=".3">
                            <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
                        </svg>
                        <p>暂无内容</p>
                    </div>
                ) : (
                    <div className="us-video-grid">
                        {currentVideos.map(video => (
                            <VideoCard key={video.publicId} video={video} />
                        ))}
                    </div>
                )}
            </div>

            {cropImage && (
                <CropModal
                    image={cropImage}
                    onCancel={() => setCropImage(null)}
                    onConfirm={handleCropConfirm}
                />
            )}
        </div>
    );
}