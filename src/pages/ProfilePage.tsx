import { useEffect, useRef, useState } from "react";
import "./ProfilePage.css";
import CropModal from "../components/CropModal";
import request from "../utils/request.ts";
import type { UserInfo } from "../types/user.ts";

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ 初始化，避免 undefined 问题
    const [userInfo, setUserInfo] = useState<UserInfo>({
        avatar: "",
        username: "",
        bio: ""
    });
    const [, setUploading] = useState(false);
    const [backup, setBackup] = useState<UserInfo | null>(null);
    const [editing, setEditing] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);

    const handleCropConfirm = async (blob: Blob) => {
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("faceFile", blob, "avatar.jpg");

            const res = await request({
                url: "/api/user/face/upload",
                method: "POST",
                data: formData
            });

            // ⭐ 更新头像（防缓存）
            setUserInfo(prev => ({
                ...prev,
                avatar: res.data
            }));

        } finally {
            setCropImage(null);
        }
    };

    // 获取用户信息
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        request({
            url: "/api/user/me",
            method: "GET"
        })
            .then(res => setUserInfo(res.data))
            .catch(() => {
                localStorage.removeItem("token");
            });
    }, []);

    // 选择图片
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("请选择图片文件");
            return;
        }

        const url = URL.createObjectURL(file);
        setCropImage(url);

        e.target.value = ""; // ⭐ 防止重复选择不触发
    };

    // 开始编辑
    const startEdit = () => {
        setBackup(userInfo);
        setEditing(true);
    };

    // 取消编辑（回滚）
    const cancelEdit = () => {
        if (backup) setUserInfo(backup);
        setEditing(false);
    };

    // 保存（这里先写基础版）
    const handleSave = async () => {
        await request({
            url: "/api/user/update",
            method: "POST",
            data: userInfo
        });

        setEditing(false);
        alert("保存成功");
    };

    return (
        <div className="profile-page">
            {/* 头像区域 */}
            <div className="profile-header">
                <div
                    className="avatar-wrapper"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <img
                        src={
                            userInfo.avatar
                                ? `${userInfo.avatar}`
                                : "https://via.placeholder.com/100"
                        }
                        className="avatar"
                    />
                    <div className="mask">更换头像</div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <h2>{userInfo.username || "未命名用户"}</h2>
            </div>

            {/* 基本信息 */}
            <div className="card">
                <h3>基本信息</h3>

                <input
                    value={userInfo.username || ""}
                    disabled={!editing}
                    onChange={(e) =>
                        setUserInfo({
                            ...userInfo,
                            username: e.target.value
                        })
                    }
                />

                <textarea
                    value={userInfo.bio || ""}
                    disabled={!editing}
                    onChange={(e) =>
                        setUserInfo({
                            ...userInfo,
                            bio: e.target.value
                        })
                    }
                />
            </div>

            {/* 操作按钮 */}
            <div className="actions">
                <button onClick={editing ? cancelEdit : startEdit}>
                    {editing ? "取消" : "编辑资料"}
                </button>

                {editing && (
                    <button className="save" onClick={handleSave}>
                        保存
                    </button>
                )}
            </div>

            {/* 裁剪弹窗 */}
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