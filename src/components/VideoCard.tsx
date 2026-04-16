// components/VideoCard.jsx
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type {VideoCardPros} from "../types/userSpace.ts";
import {formatCount} from "../utils/format.ts";

export default function VideoCard(video: VideoCardPros) {
    const formatDuration = (duration:number) => {
        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        const s = duration % 60;

        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${m}:${String(s).padStart(2, "0")}`;
    };

    return (
        <Link
            to={`/${video.video.publicId}`}
            className="video-card"
        >
            <div className="cover-wrapper">
                <img src={video.video.coverUrl} className="cover" />

                <span className="view">
                    <Eye size={10} />
                    {formatCount(video.video.viewCount)}
                </span>

                <span className="duration">
                    {formatDuration(video.video.duration)}
                </span>
            </div>

            <div className="info">
                <div className="title">
                    <h3>{video.video.title}</h3>
                </div>
            </div>
        </Link>
    );
}