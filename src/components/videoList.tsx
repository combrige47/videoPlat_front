import { useEffect, useState } from "react";
import request from "../utils/request";
import { Link } from "react-router-dom";

interface Video {
    publicId: string;
    title: string;
    coverUrl: string;
    author?: {
        username: string;
    };
}



export default function VideoList() {
    const [videos, setVideos] = useState<Video[]>([]);
    useEffect(() => {
        request({
            url: "/api/video/list",
            method: "GET",
            params: {
                page: 1,
                size: 10
            }
        }).then(res => {
            setVideos(res.data.list);
        });
    }, []);

    return (
        <div className="video-list">
            {videos.map(video => (
                <Link
                    key={video.publicId}
                    to={`/${video.publicId}`}
                    className="video-card"
                >
                    <img src={video.coverUrl} className="cover" />
                    <div className="info">
                        <h3>{video.title}</h3>
                        <p>{video.author?.username}</p>
                    </div>
                </Link>
    ))}
    </div>
);
}