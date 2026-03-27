import { useState } from "react";
import request from "../utils/request";
import "./uploadPage.css"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const CHUNK_SIZE = 5 * 1024 * 1024;

    const handleSelect = (f: File) => {
        setFile(f);
        setProgress(0);
        setStatus("idle");
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus("uploading");

            // 1️⃣ 初始化上传
            const initRes = await request({
                url: "/api/video/upload/init",
                method: "POST",
                data: {
                    fileName: file.name,
                    fileSize: file.size,
                    chunkSize: CHUNK_SIZE
                }
            });

            const { uploadId } = initRes.data;
            //console.log("CHUNK_SIZE:", CHUNK_SIZE);
            // 2️⃣ 分片
            const chunks: Blob[] = [];
            for (let i = 0; i < file.size; i += CHUNK_SIZE) {
                chunks.push(file.slice(i, i + CHUNK_SIZE));
            }

            // 3️⃣ 上传每一片
            let uploaded = 0;

            for (let i = 0; i < chunks.length; i++) {
                const formData = new FormData();
                formData.append("file", chunks[i]);

                await request({
                    url: "/api/video/upload/record",
                    method: "POST",
                    params: {
                        uploadId,
                        partNumber: i + 1
                    },
                    data: formData
                });

                uploaded++;
                setProgress(Math.floor((uploaded / chunks.length) * 100));
            }

            // 4️⃣ 完成上传
            await request({
                url: "/api/video/upload/complete",
                method: "POST",
                params: { uploadId }
            });

            setStatus("success");

        } catch (e) {
            console.error(e);
            setStatus("error");
        }
    };

    return (
        <div className="upload-page">
            <h2>上传视频</h2>

            <div className="upload-box">
                <input
                    type="file"
                    accept="video/*"
                    onChange={e => {
                        if (e.target.files?.[0]) {
                            handleSelect(e.target.files[0]);
                        }
                    }}
                />

                {file && (
                    <div className="file-info">
                        <p>文件名：{file.name}</p>
                        <p>大小：{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                )}

                <button onClick={handleUpload} disabled={!file || status === "uploading"}>
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

                {/* 状态提示 */}
                {status === "success" && <p className="success">上传成功 🎉</p>}
                {status === "error" && <p className="error">上传失败 ❌</p>}
            </div>
        </div>
    );
}