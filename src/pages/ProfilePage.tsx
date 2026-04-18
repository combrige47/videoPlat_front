import { useEffect, useRef, useState } from "react";
import "./ProfilePage.css";
import CropModal from "../components/CropModal";
import request from "../utils/request.ts";
import type { UserInfo } from "../types/user.ts";

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [userInfo, setUserInfo] = useState<UserInfo>({
        avatar: "",
        username: "",
        bio: ""
    });
    const [, setUploading] = useState(false);
    const [backup, setBackup] = useState<UserInfo | null>(null);
    const [editing, setEditing] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "done">("idle");

    const handleCropConfirm = async (blob: Blob) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("faceFile", blob, "avatar.jpg");
            const res = await request({ url: "/api/user/face/upload", method: "POST", data: formData });
            setUserInfo(prev => ({ ...prev, avatar: res.data }));
        } finally {
            setCropImage(null);
            setUploading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        request({ url: "/api/user/me", method: "GET" })
            .then(res => setUserInfo(res.data))
            .catch(() => localStorage.removeItem("token"));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("请选择图片文件"); return; }
        setCropImage(URL.createObjectURL(file));
        e.target.value = "";
    };

    const startEdit = () => { setBackup(userInfo); setEditing(true); };
    const cancelEdit = () => { if (backup) setUserInfo(backup); setEditing(false); };

    const handleSave = async () => {
        setSaveStatus("saving");
        await request({ url: "/api/user/update", method: "POST", data: userInfo });
        setSaveStatus("done");
        setEditing(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
    };

    const avatarSrc = userInfo.avatar || "https://via.placeholder.com/100";
    const initials = userInfo.username
        ? userInfo.username.slice(0, 2).toUpperCase()
        : "?";

    return (
        <div className="pp-root">
            <div className="pp-container">

                {/* ── 顶部 Banner + 头像 ── */}
                <div className="pp-banner">
                    <div className="pp-banner-bg" />
                    <div className="pp-avatar-area">
                        <div
                            className="pp-avatar-wrap"
                            onClick={() => fileInputRef.current?.click()}
                            title="点击更换头像"
                        >
                            {userInfo.avatar
                                ? <img src={avatarSrc} alt="avatar" className="pp-avatar-img" />
                                : <div className="pp-avatar-initials">{initials}</div>
                            }
                            <div className="pp-avatar-overlay">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 20H5a2 2 0 01-2-2V9a2 2 0 012-2h1.5l2-3h7l2 3H20a2 2 0 012 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8"/>
                                    <path d="M18 14v6M15 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                </svg>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>

                {/* ── 用户名 + bio 摘要 ── */}
                <div className="pp-identity">
                    <h1 className="pp-username">{userInfo.username || "未命名用户"}</h1>
                    {!editing && (
                        <p className="pp-bio-preview">{userInfo.bio || "暂无简介"}</p>
                    )}
                </div>

                {/* ── 信息卡片 ── */}
                <div className="pp-card">
                    <div className="pp-card-header">
                        <span className="pp-card-title">基本信息</span>
                        {saveStatus === "done" && (
                            <span className="pp-save-badge">已保存</span>
                        )}
                    </div>

                    <div className="pp-field">
                        <label className="pp-label">用户名</label>
                        <input
                            className={`pp-input ${editing ? "pp-input--active" : ""}`}
                            value={userInfo.username || ""}
                            disabled={!editing}
                            placeholder="输入用户名"
                            onChange={e => setUserInfo({ ...userInfo, username: e.target.value })}
                        />
                    </div>

                    <div className="pp-field">
                        <label className="pp-label">个人简介</label>
                        <textarea
                            className={`pp-textarea ${editing ? "pp-input--active" : ""}`}
                            value={userInfo.bio || ""}
                            disabled={!editing}
                            placeholder="介绍一下自己..."
                            rows={3}
                            onChange={e => setUserInfo({ ...userInfo, bio: e.target.value })}
                        />
                    </div>
                </div>

                {/* ── 操作按钮 ── */}
                <div className="pp-actions">
                    {editing ? (
                        <>
                            <button className="pp-btn pp-btn--ghost" onClick={cancelEdit}>取消</button>
                            <button
                                className="pp-btn pp-btn--primary"
                                onClick={handleSave}
                                disabled={saveStatus === "saving"}
                            >
                                {saveStatus === "saving"
                                    ? <><span className="pp-spinner" /> 保存中</>
                                    : "保存更改"
                                }
                            </button>
                        </>
                    ) : (
                        <button className="pp-btn pp-btn--primary" onClick={startEdit}>
                            编辑资料
                        </button>
                    )}
                </div>

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