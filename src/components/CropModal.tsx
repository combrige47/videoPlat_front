import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop"
import { useEffect, useState, useCallback } from "react";

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

    // 存储图片原始自然尺寸，用于精准计算预览偏移
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    const PREVIEW_SIZE = 120; // 预览窗口的大小

    // 自动计算预览缩放倍率：预览容器宽度 / 实际裁剪区域的像素宽度
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
            img.addEventListener("error", (error) => reject(error));
            // 必须处理跨域，否则 canvas.toBlob 会报错
            img.setAttribute("crossOrigin", "anonymous");
            img.src = url;
        });

    const getCroppedImg = async () => {
        if (!croppedAreaPixels) return null;

        const img = await createImage(image);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return null;

        const size = 300; // 最终导出的头像尺寸
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(
            img,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            size,
            size
        );

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
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
        <div className="crop-modal">
            <div className="mask" onClick={onCancel} />

            <div className="crop-container">
                <div className="crop-body">
                    {/* 左侧：裁剪交互区 */}
                    <div className="crop-left">
                        <div className="cropper-wrapper" style={{ position: 'relative', height: 280, width: 320 }}>
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

                        <div className="controls" style={{ padding: '20px 0' }}>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* 右侧：实时预览区 */}
                    <div className="crop-right" style={{ marginLeft: 40, textAlign: 'center' }}>
                        <div
                            className="preview-image-wrapper"
                            style={{
                                width: PREVIEW_SIZE,
                                height: PREVIEW_SIZE,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid #ddd',
                                backgroundColor: '#f9f9f9'
                            }}
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
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        // 关键：强制设置图片显示宽度为自然宽度，确保 translate 像素对齐
                                        width: naturalSize.width || 'auto',
                                        maxWidth: 'none',
                                        maxHeight: 'none',
                                        transformOrigin: "0 0",
                                        // 先位移到裁剪像素点，再整体缩放至预览框大小
                                        transform: `
                                            translate(-${croppedAreaPixels.x * previewScale}px, -${croppedAreaPixels.y * previewScale}px) 
                                            scale(${previewScale})
                                        `,
                                        // 图片未加载完前隐藏，避免闪烁
                                        visibility: naturalSize.width ? 'visible' : 'hidden'
                                    }}
                                />
                            )}
                        </div>
                        <div className="preview-text" style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                            预览头像
                        </div>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="crop-footer">
                    <p className="tip">支持 JPG / PNG，小于 2MB</p>
                    <div className="btns" style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-cancel" onClick={onCancel}>取消</button>
                        <button
                            className="btn-confirm"
                            onClick={handleConfirm}
                            disabled={uploading || !naturalSize.width}
                        >
                            {uploading ? "处理中..." : "确定更新"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}