import {useEffect, useRef, useState} from "react";
import { useParams } from "react-router-dom";
import type {SpaceVideoInfo} from "../types/userSpace.ts";
import type {SpaceInfo} from "../types/userSpace.ts";
import request from "../utils/request.ts";
import {Link} from "react-router-dom";
import {Eye} from "lucide-react";
import "./UserSpace.css"
import {formatCount} from "../utils/format.ts";
import VideoCard from "../components/VideoCard.tsx";
import CropModal from "../components/CropModal.tsx";

export default function UserSpace(){
    const {userId} = useParams();
    const [spaceInfo,setSpaceInfo] = useState<SpaceInfo>();
    const [spaceVideos,setSpaceVideos] = useState<SpaceVideoInfo[]>([]);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("请选择图片文件");
            return;
        }

        const url = URL.createObjectURL(file);
        setCropImage(url);
    };

    const handleCropConfirm = async (blob: Blob) => {
        const formData = new FormData();
        formData.append("file", blob, "avatar.jpg");

        const res = await request({
            url: "/api/user/uploadFace",
            method: "POST",
            faceFile: formData
        });

        setSpaceInfo(prev => ({
            ...prev,
            avatar: `/api/user/face/get/${res.data}`
        }));

        setCropImage(null);
    };
    useEffect(() => {
        if (cropImage) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [cropImage]);
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
            // @ts-ignore
            setSpaceInfo(prev => ({
                ...prev,
                isFollowed: !newState
            }));
        }
    };

    return(
        <div className="user-space">
            <div className="base-space-info">
                {cropImage && (
                    <CropModal
                        image={cropImage}
                        onCancel={() => setCropImage(null)}
                        onConfirm={handleCropConfirm}
                    />
                )}

                <div className="left">
                    <div className="avatar-wrapper" onClick={handleClick}>
                        <img
                            src={spaceInfo?.avatar || "https://via.placeholder.com/80"}
                            className="avatar"
                            onClick={() => fileInputRef.current?.click()}
                        />
                        <div className="mask">更换头像</div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
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
            <div className="video-section">
                <h2>TA的视频</h2>
                <div className="video-grid">
                    {spaceInfo?.myVideos.map(video => (
                        <VideoCard key={video.publicId} video={video} />
                    ))}
                </div>
            </div>

            <div className="video-section">
                <h2>TA的点赞</h2>
                <div className="video-grid">
                    {spaceInfo?.likeVideos.map(video => (
                        <VideoCard key={video.publicId} video={video} />
                    ))}
                </div>
            </div>
            <div className="video-section">
                <h2>TA的收藏</h2>
                <div className="video-grid">
                    {spaceInfo?.favoriteVideos.map(video => (
                        <VideoCard key={video.publicId} video={video} />
                    ))}
                </div>
            </div>
        </div>
    )
}

