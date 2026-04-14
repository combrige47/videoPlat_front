import { useState } from "react";
import request from "../utils/request";
import { useNavigate } from "react-router-dom";
import "./UploadPage.css";
const BASE_URL = "http://localhost:24352";
const tempcoverUrl = "/api/video/temp/"

export default function UploadPage() {
    const navigate = useNavigate();
    const UPLOAD_INIT = 0;
    const UPLOAD_COMPLETED = 1;
    const UPLOAD_CONSUMED = 2;
    const UPLOAD_EXPIRED = 3;
    const UPLOAD_ABORTED = 4;
    const UPLOAD_UPLOADING = 5;
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

    const [uploadId, setUploadId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const CHUNK_SIZE = 10 * 1024 * 1024; // 5MB

    /* ================= 上传 ================= */

    const getUploadStatus = async (uploadId: string) => {
        const res = await request({
            url: `/api/video/upload/${uploadId}`,
            method: "GET"
        });
        return res.data;
    };
    const waitUntilCompleted = async (uploadId: string, maxTries = 10) => {
        for (let i = 0; i < maxTries; i++) {
            const statusRes = await getUploadStatus(uploadId);

            if (statusRes?.status === UPLOAD_COMPLETED) {
                return true;
            }

            if (
                statusRes?.status === UPLOAD_ABORTED ||
                statusRes?.status === UPLOAD_EXPIRED ||
                statusRes?.status === UPLOAD_CONSUMED
            ) {
                throw new Error(`上传状态异常: ${statusRes?.status}`);
            }

            await new Promise((res) => setTimeout(res, 1000));
        }

        return false;
    };
    const completeUploadSafely = async (uploadId: string) => {
        try {
            await request({
                url: "/api/video/upload/complete",
                method: "POST",
                params: { uploadId }
            });
            return;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            const completed = await waitUntilCompleted(uploadId, 5);
            if (completed) {
                return;
            }

            await request({
                url: "/api/video/upload/complete",
                method: "POST",
                params: { uploadId }
            });

            const completedAfterRetry = await waitUntilCompleted(uploadId, 10);
            if (!completedAfterRetry) {
                throw new Error("complete 后状态仍未完成");
            }
        }
    };
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const value = tagInput.trim();
            if (!value) return;

            // 去重 + 限制数量（可选）
            if (tags.includes(value)) {
                setTagInput("");
                return;
            }

            if (tags.length >= 10) return; // 可选限制

            setTags([...tags, value]);
            setTagInput("");
        }
    };
    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };
    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus("uploading");

            // 1️⃣ init
            const initRes = await request({
                url: "/api/video/upload/init",
                method: "POST",
                data: {
                    fileName: file.name,
                    fileSize: file.size,
                    chunkSize: CHUNK_SIZE
                }
            });

            if (!initRes.data) {
                throw new Error("init失败");
            }

            const id = initRes.data.uploadId;
            setUploadId(id);

            // 2️⃣ 分片
            const chunks: Blob[] = [];
            for (let i = 0; i < file.size; i += CHUNK_SIZE) {
                chunks.push(file.slice(i, i + CHUNK_SIZE));
            }

            // 3️⃣ 上传
            let uploaded = 0;

            for (let i = 0; i < chunks.length; i++) {
                const formData = new FormData();
                formData.append("file", chunks[i]);

                await request({
                    url: "/api/video/upload/record",
                    method: "POST",
                    params: {
                        uploadId: id,
                        partNumber: i + 1
                    },
                    data: formData
                });

                uploaded++;
                setProgress(Math.floor((uploaded / chunks.length) * 100));
            }

            await completeUploadSafely(id);
            setStatus("success");

        } catch (e) {
            console.error(e);
            setStatus("error");
        }
    };

    /* ================= 发布 ================= */

    const handlePublish = async () => {
        if (!uploadId || !title.trim()) return;

        try {
            const res = await request({
                url: "/api/video/create",
                method: "POST",
                data: {
                    title,
                    description,
                    uploadId,
                    coverName:coverUrl,
                    tags
                }
            });

            const publicId = res.data;

            // 跳转播放页
            navigate(`/${publicId}`);

        } catch (e) {
            console.error(e);
        }
    };

    /* ================= UI ================= */

    return (
        <div className="upload-page">
            <h2>上传视频</h2>

            {/* 选择文件 */}
            <div className="upload-card">
                <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={e => {
                        if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                            setStatus("idle");
                            setProgress(0);
                        }
                    }}
                />

                {file && (
                    <div className="file-info">
                        <p>{file.name}</p>
                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || status === "uploading"}
                >
                    {status === "uploading" ? "上传中..." : "开始上传"}
                </button>

                {/* 进度条 */}
                {status !== "idle" && (
                    <div className="progress">
                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {status === "success" && <p className="success">上传完成 ✅</p>}
                {status === "error" && <p className="error">上传失败 ❌</p>}
            </div>

            {/* 发布区域 */}
            {status === "success" && (

                <div className="publish-card">
                    <h3>发布视频</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setCoverFile(file);

                            // 上传封面
                            const formData = new FormData();
                            formData.append("file", file);

                            const res = await request({
                                url: "/api/video/upload/image", // 你需要新增接口
                                method: "POST",
                                data: formData
                            });

                            setCoverUrl(res.data);
                        }}
                    />

                    {/* 预览 */}
                    {coverUrl && <img src={BASE_URL+tempcoverUrl+coverUrl} className="cover-preview" />}
                    <input
                        placeholder="请输入标题（必填）"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <div className="tag-box">
                        <div className="tag-list">
                            {tags.map((tag, index) => (
                                <span key={index} className="tag-item">
                {tag}
                                    <button onClick={() => removeTag(index)}>×</button>
            </span>
                            ))}
                        </div>

                        <input
                            placeholder="输入标签，回车确认"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                        />
                    </div>

                    <textarea
                        placeholder="描述（可选）"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />

                    <button onClick={handlePublish}>
                        发布视频
                    </button>
                </div>
            )}
        </div>
    );
}