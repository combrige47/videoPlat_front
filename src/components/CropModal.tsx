import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { useState, useCallback } from "react";
import "./CropModal.css";

type Props = {
    image: string;
    onCancel: () => void;
    onConfirm: (blob: Blob) => Promise<void>;
};

export default function CropModal({ image, onCancel, onConfirm }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [uploading, setUploading] = useState(false);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    const PREVIEW_SIZE = 100;

    const previewScale = croppedAreaPixels
        ? PREVIEW_SIZE / croppedAreaPixels.width
        : 0;

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener("load", () => resolve(img));
            img.addEventListener("error", reject);
            img.setAttribute("crossOrigin", "anonymous");
            img.src = url;
        });

    const getCroppedImg = async (): Promise<Blob | null> => {
        if (!croppedAreaPixels) return null;
        const img = await createImage(image);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const size = 300;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(
            img,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0, 0, size, size
        );

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
        });
    };

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        try {
            setUploading(true);
            const blob = await getCroppedImg();
            if (blob) await onConfirm(blob);
        } catch (e) {
            console.error("裁剪失败:", e);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="cm-overlay" onClick={onCancel}>
            <div className="cm-panel" onClick={(e) => e.stopPropagation()}>

                {/* 标题栏 */}
                <div className="cm-header">
                    <span className="cm-title">编辑头像</span>
                    <button className="cm-close" onClick={onCancel} aria-label="关闭">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* 主体：左裁剪 + 右预览 */}
                <div className="cm-body">

                    {/* 左侧裁剪区 */}
                    <div className="cm-cropper-wrap">
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    {/* 右侧预览区 */}
                    <div className="cm-preview-col">
                        <p className="cm-preview-label">预览效果</p>

                        {/* 大预览 */}
                        <div
                            className="cm-preview-circle cm-preview-lg"
                            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
                        >
                            {croppedAreaPixels && (
                                <img
                                    src={image}
                                    alt="preview"
                                    onLoad={(e) => {
                                        const { naturalWidth, naturalHeight } = e.currentTarget;
                                        setNaturalSize({ width: naturalWidth, height: naturalHeight });
                                    }}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        width: naturalSize.width || "auto",
                                        maxWidth: "none",
                                        maxHeight: "none",
                                        transformOrigin: "0 0",
                                        transform: `
                                            translate(-${croppedAreaPixels.x * previewScale}px, -${croppedAreaPixels.y * previewScale}px)
                                            scale(${previewScale})
                                        `,
                                        visibility: naturalSize.width ? "visible" : "hidden",
                                    }}
                                />
                            )}
                        </div>
                        <span className="cm-preview-size-tag">100 × 100</span>

                        {/* 小预览 */}
                        <div
                            className="cm-preview-circle cm-preview-sm"
                            style={{ width: 48, height: 48 }}
                        >
                            {croppedAreaPixels && naturalSize.width > 0 && (() => {
                                const s = 48 / croppedAreaPixels.width;
                                return (
                                    <img
                                        src={image}
                                        alt="preview-sm"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            width: naturalSize.width,
                                            maxWidth: "none",
                                            maxHeight: "none",
                                            transformOrigin: "0 0",
                                            transform: `translate(-${croppedAreaPixels.x * s}px, -${croppedAreaPixels.y * s}px) scale(${s})`,
                                        }}
                                    />
                                );
                            })()}
                        </div>
                        <span className="cm-preview-size-tag">48 × 48</span>
                    </div>
                </div>

                {/* 缩放滑条 */}
                <div className="cm-zoom-row">
                    <svg className="cm-zoom-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                        <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                        className="cm-zoom-slider"
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                    <span className="cm-zoom-val">{Math.round((zoom - 1) / 2 * 100)}%</span>
                </div>

                {/* 底部操作栏 */}
                <div className="cm-footer">
                    <span className="cm-tip">支持 JPG / PNG，小于 2MB</span>
                    <div className="cm-actions">
                        <button className="cm-btn-cancel" onClick={onCancel}>取消</button>
                        <button
                            className="cm-btn-confirm"
                            onClick={handleConfirm}
                            disabled={uploading || !naturalSize.width}
                        >
                            {uploading
                                ? <><span className="cm-spinner" /> 处理中</>
                                : "确认更新"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}