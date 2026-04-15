import {useEffect,useState} from "react";
import { useParams } from "react-router-dom";
import type {SpaceVideoInfo} from "../types/userSpace.ts";
import type {SpaceInfo} from "../types/userSpace.ts";
import request from "../utils/request.ts";
import {Link} from "react-router-dom";
import {Eye} from "lucide-react";
import "./UserSpace.css"
import {formatCount} from "../utils/format.ts";

export default function UserSpace(){
    const {userId} = useParams();
    const [spaceInfo,setSpaceInfo] = useState<SpaceInfo>();
    const [spaceVideos,setSpaceVideos] = useState<SpaceVideoInfo[]>([]);
    useEffect(() => {
        console.log(userId)
        if(!userId) return;
        request({
            url : `/api/space/${userId}/videos`,
            method: "GET",
        }).then(res => {
            setSpaceVideos(res.data)
        })
        request({
            url : `/api/space/${userId}`,
            method: "GET",
        }).then(res => {
            setSpaceInfo(res.data)
        })
    },[userId]);

    const follow = async () => {
        const newState = !spaceInfo?.isFollowed;

        // 先更新 UI
        // @ts-ignore
        setSpaceInfo(prev => ({
            ...prev,
            isFollowed: newState
        }));

        try {
            await request({
                url: `/api/user/${newState ? "follow" : "unfollow"}/${userId}`,
                method: "POST",
            });
        } catch (e) {
            // 失败回滚
            setSpaceInfo(prev => ({
                ...prev,
                isFollowed: !newState
            }));
        }
    };

    return(
        <div className="user-space">
            <div className="base-space-info">
                <div className="left">
                    <img
                        className="avatar"
                        src={spaceInfo?.avatar || "https://via.placeholder.com/40"}
                    />
                </div>

                <div className="center">
                    <div className="top">
                        <span className="username">{spaceInfo?.userName}</span>
                        {spaceInfo?.isMe ? (
                            <span className="self-tag">自己</span>
                        ) : (
                            <button className="follow-btn" onClick={follow}>
                                {spaceInfo?.isFollowed ? "已关注" : "关注"}
                            </button>
                        )}
                    </div>

                    <div className="bio">
                        {spaceInfo?.bio || "这个人很懒，还没写简介"}
                    </div>

                    <div className="stats">
                        <span>视频 {spaceInfo?.videoCount}</span>
                        <span>粉丝 {spaceInfo?.fansCount}</span>
                        <span>关注 {spaceInfo?.followCount}</span>
                        <span>获赞 {spaceInfo?.likeTotal}</span>
                    </div>
                </div>
            </div>
            {spaceVideos.map(video => (
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
                        <div className="title">
                            <h3>{video.title}</h3>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

