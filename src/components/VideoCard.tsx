import { Link } from "react-router-dom";
import { Eye, ThumbsUp } from "lucide-react";
import type { VideoCardPros } from "../types/userSpace.ts";
import { formatCount } from "../utils/format.ts";
import "./VideoCard.css";
import {formatTime} from "../utils/time.ts";

function formatDuration(duration: number) {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    const s = duration % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoCard({ video }: VideoCardPros) {
    return (
        <Link to={`/${video.publicId}`} className="vc-card">
            <div className="vc-cover-wrap">
                <img src={video.coverUrl} alt={video.title} className="vc-cover" />

                {/* 悬停播放遮罩 */}
                <div className="vc-overlay">
                    <div className="vc-play-btn">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                    </div>
                </div>

                {/* 时长 */}
                <span className="vc-duration">{formatDuration(video.duration)}</span>

                {/* 播放量（左下角） */}
                <span className="vc-views">
                    <Eye size={11} strokeWidth={2} />
                    {formatCount(video.viewCount)}
                </span>
            </div>

            <div className="vc-info">
                <h3 className="vc-title">{video.title}</h3>
                <div className="vc-author-row">
                    <span className="vc-uptag">UP</span>
                    <span className="vc-name">{video.author.username}</span>
                </div>
                <span className="vc-time">{formatTime(video.publishTime)}</span>
            </div>
        </Link>
    );
}