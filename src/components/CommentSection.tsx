import { useEffect, useState } from "react";
import request from "../utils/request";
import "./CommentSection.css";
import {Link, useParams} from "react-router-dom";
import { formatTime } from "../utils/time";
import { renderContent } from "../utils/highlight";
import type { Comment } from "../types/comment";

export default function CommentSection() {
    const { publicId } = useParams();

    const [comments, setComments] = useState<Comment[]>([]);
    const [replyMap, setReplyMap] = useState<Record<number, Comment[]>>({});
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [content, setContent] = useState("");
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [liking, setLiking] = useState<Record<number, boolean>>({});
    const [sort, setSort] = useState<"latest" | "hot">("latest");

    /* ================= 加载评论 ================= */

    const changeSort = (newSort: "latest" | "hot") => {
        setSort(newSort);
    };

    const loadComments = async (isLoadMore = false) => {
        if (loading) return;
        if (isLoadMore && !hasMore) return;

        setLoading(true);

        const res = await request({
            url: "/api/comment/root",
            method: "GET",
            params: {
                publicId,
                cursor: isLoadMore ? cursor : null,
                sort,
                size: 10
            }
        });

        const list = res.data.list;
        const nextCursor = res.data.nextCursor;

        if (isLoadMore) {
            setComments(prev => {
                const map = new Map<number, Comment>();

                [...prev, ...list].forEach(item => {
                    map.set(item.id, item);
                });

                return Array.from(map.values());
            });
        } else {
            setComments(list);
        }

        setCursor(nextCursor);
        setHasMore(!!nextCursor);
        setLoading(false);
    };

    useEffect(() => {
        setCursor(null);
        setHasMore(true);
        loadComments(false);
    }, [publicId]);
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.body.scrollHeight;

            // 👉 距离底部 100px 触发
            if (scrollTop + windowHeight >= fullHeight - 100) {
                loadComments(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [cursor, loading, hasMore]);
    useEffect(() => {
        setCursor(null);
        setHasMore(true);
        setComments([]);
        loadComments(false);
    }, [sort]);

    /* ================= 加载回复 ================= */

    const loadReplies = async (rootId: number) => {
        const res = await request({
            url: `/api/comment/reply/${rootId}`,
            method: "GET"
        });

        setReplyMap(prev => ({
            ...prev,
            [rootId]: res.data.list
        }));

        setExpanded(prev => ({
            ...prev,
            [rootId]: true
        }));
    };

    const handleLike = async (comment: Comment, rootId?: number) => {
        if (liking[comment.id]) return;

        const isLiked = comment.liked;

        // ✅ 1. 先更新UI（乐观更新）
        const updateList = (list: Comment[]) =>
            list.map(item => {
                if (item.id === comment.id) {
                    return {
                        ...item,
                        liked: !isLiked,
                        likeCount: isLiked
                            ? item.likeCount - 1
                            : item.likeCount + 1
                    };
                }
                return item;
            });

        setComments(prev =>
            prev.map(c => {
                // ✅ 如果是 root 评论
                if (c.id === comment.id) {
                    return {
                        ...c,
                        liked: !isLiked,
                        likeCount: isLiked
                            ? c.likeCount - 1
                            : c.likeCount + 1
                    };
                }

                // ✅ 如果是 preview reply
                return {
                    ...c,
                    previewReply: c.previewReply?.map(r =>
                        r.id === comment.id
                            ? {
                                ...r,
                                liked: !isLiked,
                                likeCount: isLiked
                                    ? r.likeCount - 1
                                    : r.likeCount + 1
                            }
                            : r
                    )
                };
            })
        );

        if (rootId) {
            setReplyMap(prev => ({
                ...prev,
                [rootId]: updateList(prev[rootId] || [])
            }));
        }

        // ✅ 2. 再请求后端
        setLiking(prev => ({ ...prev, [comment.id]: true }));

        try {
            await request({
                url: isLiked
                    ? "/api/comment/unlike"
                    : "/api/comment/like",
                method: "POST",
                params: { id: comment.id }
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // ❗失败回滚（很专业）
            setComments(prev => updateList(prev));

            if (rootId) {
                setReplyMap(prev => ({
                    ...prev,
                    [rootId]: updateList(prev[rootId] || [])
                }));
            }
        } finally {
            setLiking(prev => ({ ...prev, [comment.id]: false }));
        }
    };


    /* ================= 回复逻辑 ================= */

    const handleReply = (comment: Comment) => {
        setReplyTo(comment);
        setContent(`@${comment.author.userName} `);
    };

    /* ================= 提交 ================= */

    const handleSubmit = async () => {
        if (!content.trim()) return;

        let parentId = null;
        let rootId = null;

        if (replyTo) {
            parentId = replyTo.id;
            rootId = replyTo.rootId || replyTo.id;
        }

        await request({
            url: "/api/comment/create",
            method: "POST",
            data: {
                publicId,
                content,
                parentId,
                rootId
            }
        });

        setContent("");
        setReplyTo(null);
        loadComments();
    };

    /* ================= 渲染 ================= */

    return (
        <div className="comment-section">
            <h3>评论</h3>
            <div className="comment-sort">
                <button
                    className={sort === "latest" ? "active" : ""}
                    onClick={() => changeSort("latest")}
                >
                    最新
                </button>

                <button
                    className={sort === "hot" ? "active" : ""}
                    onClick={() => changeSort("hot")}
                >
                    最热
                </button>
            </div>


            {/* ✅ 回复提示（必须在输入框上） */}
            {replyTo && (
                <div className="replying-box">
                    回复 @{replyTo.author.userName}
                    <button onClick={() => setReplyTo(null)}>取消</button>
                </div>
            )}

            {/* 输入框 */}
            <div className="comment-input">
                <div className="input-box">
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="说点什么..."
                />
                    <button onClick={handleSubmit}>发布</button>
                </div>
            </div>

            {/* 评论列表 */}
            <div className="comment-list">
                {comments.map(c => (
                    <div key={c.id} className="comment-item">

                        {/* 左侧头像 */}
                        <Link
                            to={`/space/${c.author.id}`}>
                        <img
                            className="avatar"
                            src={c.author.avatar || "https://via.placeholder.com/36"}
                        />
                        </Link>

                        {/* 右侧主体 */}
                        <div className="comment-main">

                            {/* 作者 + 时间 */}
                            <div className="author">
                                <span className="name">{c.author.userName}</span>
                                {c.isAuthor && (
                                    <span className="UPtag">UP</span>
                                )}
                                <span className="time">{formatTime(c.createdTime)}</span>
                            </div>

                            {/* 内容 */}
                            <div className="content">{renderContent(c.content)}</div>

                            {/* 操作区 */}
                            <div className="actions">
                                <button
                                    className={c.liked ? "liked" : ""}
                                    onClick={() => handleLike(c)}
                                >
                                    {c.liked ? "❤️" : "🤍"} {c.likeCount}
                                </button>

                                <button onClick={() => handleReply(c)}>
                                    回复
                                </button>

                                <span>回复 ({c.replyCount})</span>
                            </div>

                            {/* ===== 回复区 ===== */}
                            <div className="reply-list">

                                {/* preview */}
                                {!expanded[c.id] && c.previewReply?.map(r => (
                                    <div key={r.id} className="reply-item">
                                        <Link to={`/space/${r.author.id}`}>
                                        <img
                                            src={r.author.avatar || "https://via.placeholder.com/24"}
                                            className="avatar"
                                        />
                                        </Link>

                                        <div className="reply-main">
                                            <span className="name">{r.author.userName}</span>
                                            <span className="reply-content">:{renderContent(r.content)}</span>

                                            <div className="reply-actions">
                                                <button
                                                    className={r.liked ? "liked" : ""}
                                                    onClick={() => handleLike(r, c.id)}
                                                >
                                                    {r.liked ? "❤️" : "🤍"} {r.likeCount}
                                                </button>

                                                <button onClick={() => handleReply(r)}>
                                                    回复
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* 全量 */}
                                {expanded[c.id] && replyMap[c.id]?.map(r => (
                                    <div key={r.id} className="reply-item">

                                        <img
                                            src={r.author.avatar || "https://via.placeholder.com/24"}
                                            className="avatar"
                                        />

                                        <div className="reply-main">
                                            <span className="name">{r.author.userName}</span>
                                            <span className="reply-content">：{r.content}</span>

                                            <div className="reply-actions">
                                                <button
                                                    className={r.liked ? "liked" : ""}
                                                    onClick={() => handleLike(r, c.id)}
                                                >
                                                    {r.liked ? "❤️" : "🤍"} {r.likeCount}
                                                </button>

                                                <button onClick={() => handleReply(r)}>
                                                    回复
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* 展开 */}
                                {!expanded[c.id] && c.replyCount > 3 && (
                                    <div
                                        className="expand-btn"
                                        onClick={() => loadReplies(c.id)}
                                    >
                                        查看全部 {c.replyCount} 条回复 ↓
                                    </div>
                                )}

                                {/* 收起 */}
                                {expanded[c.id] && (
                                    <div
                                        className="expand-btn"
                                        onClick={() =>
                                            setExpanded(prev => ({
                                                ...prev,
                                                [c.id]: false
                                            }))
                                        }
                                    >
                                        收起 ↑
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div className="load-more">
                    {loading && <span>加载中...</span>}
                    {!hasMore && <span>没有更多评论了</span>}
                </div>
            </div>
        </div>
    );
}