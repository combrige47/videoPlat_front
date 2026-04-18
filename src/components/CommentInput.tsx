import type { Comment } from "../types/comment";
import "./CommentInput.css";
import { useEffect, useRef } from "react";

type Props = {
    content: string;
    setContent: (v: string) => void;
    handleSubmit: () => void;
    replyTo: Comment | null;
    setReplyTo: (c: Comment | null) => void;
    fixed?: boolean;
    onHeightChange?: (h: number) => void;
};

export default function CommentInput({
                                         content,
                                         setContent,
                                         handleSubmit,
                                         replyTo,
                                         setReplyTo,
                                         fixed,
                                         onHeightChange   // ✅ 必须解构
                                     }: Props) {

    const inputRef = useRef<HTMLDivElement | null>(null);

    /* ===== 高度监听 ===== */
    useEffect(() => {
        if (!inputRef.current || !onHeightChange) return;

        const el = inputRef.current;

        const updateHeight = () => {
            const h = el.offsetHeight;
            onHeightChange(Math.min(Math.max(h, 60), 250)); // ✅ 限制范围
        };

        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(el);

        return () => observer.disconnect();
    }, [content, replyTo, fixed]);

    useEffect(() => {
        const el = inputRef.current;
        if (!el || !onHeightChange) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const h = entry.target.getBoundingClientRect().height;
                if (h > 0) {
                    onHeightChange(h);
                }
            }
        });

        observer.observe(el);

        // 初始执行一次
        onHeightChange(el.offsetHeight);

        return () => observer.disconnect();
    }, [onHeightChange]);

    /* ===== 渲染 ===== */
    return (
        <div
            ref={inputRef}   // ✅ 必须绑定
            className={`comment-input ${fixed ? "fixed" : ""}`}
        >

            <div className="input-box">
                <div className="textarea-wrapper">

                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={
                            replyTo
                                ? `回复 @${replyTo.author.userName}...`
                                : "说点什么..."
                        }

                        onInput={e => {
                            const el = e.currentTarget;

                            el.style.height = "auto";

                            const maxHeight = 200;

                            if (el.scrollHeight > maxHeight) {
                                el.style.height = maxHeight + "px";
                                el.style.overflowY = "auto";
                            } else {
                                el.style.height = el.scrollHeight + "px";
                                el.style.overflowY = "hidden";
                            }
                        }}
                        onKeyDown={e => {
                            if (e.ctrlKey && e.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim()}
                    >
                        发布
                    </button>

                </div>
            </div>
        </div>
    );
}