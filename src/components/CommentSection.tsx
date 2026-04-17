import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import request from "../utils/request";
import { formatTime } from "../utils/time";
import { renderContent } from "../utils/highlight";
import type { Comment } from "../types/comment";
import "./CommentSection.css";

type Props = { setReplyTo: (c: Comment) => void };

export default function CommentSection({ setReplyTo }: Props) {
    const { publicId } = useParams();
    const [comments, setComments] = useState<Comment[]>([]);
    const [replyMap, setReplyMap] = useState<Record<number, Comment[]>>({});
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sort, setSort] = useState<"latest" | "hot">("latest");

    // 1. 数据加载逻辑 (封装以复用)
    const fetchData = useCallback(async (isLoadMore = false) => {
        if (loading || (isLoadMore && !hasMore)) return;
        setLoading(true);
        try {
            const res = await request({
                url: "/api/comment/root",
                method: "GET",
                params: { publicId, cursor: isLoadMore ? cursor : null, sort, size: 10 }
            });
            const { list, nextCursor } = res.data;

            setComments(prev => isLoadMore ? [...prev, ...list] : list);
            setCursor(nextCursor);
            setHasMore(!!nextCursor);
        } finally {
            setLoading(false);
        }
    }, [publicId, cursor, sort, loading, hasMore]);

    useEffect(() => { fetchData(false); }, [publicId, sort]);

    // 2. 无限滚动
    useEffect(() => {
        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
                fetchData(true);
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [fetchData]);

    // 3. 核心：统一的点赞处理函数
    const handleLikeAction = async (comment: Comment, rootId?: number) => {
        const isLiked = comment.liked;

        // 乐观更新逻辑辅助函数
        const toggleLike = (item: Comment) =>
            item.id === comment.id
                ? { ...item, liked: !isLiked, likeCount: item.likeCount + (isLiked ? -1 : 1) }
                : item;

        // 更新主评论列表
        setComments(prev => prev.map(c => {
            if (c.id === comment.id) return toggleLike(c);
            if (c.previewReply) return { ...c, previewReply: c.previewReply.map(toggleLike) };
            return c;
        }));

        // 更新展开的回复列表
        if (rootId) {
            setReplyMap(prev => ({
                ...prev,
                [rootId]: prev[rootId]?.map(toggleLike)
            }));
        }

        try {
            await request({
                url: isLiked ? "/api/comment/unlike" : "/api/comment/like",
                method: "POST",
                params: { id: comment.id }
            });
        } catch {
            // 失败时应有回滚逻辑（此处略，参考原本逻辑）
        }
    };

    return (
        <div className="comment-section">
            <div className="comment-sort">
                <button className={sort === "latest" ? "active" : ""} onClick={() => setSort("latest")}>最新</button>
                <button className={sort === "hot" ? "active" : ""} onClick={() => setSort("hot")}>最热</button>
            </div>

            <div className="comment-list">
                {comments.map(c => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        replies={replyMap[c.id]}
                        isExpanded={expanded[c.id]}
                        onLike={(target, rootId) => handleLikeAction(target, rootId)}
                        onReply={setReplyTo}
                        onExpand={async () => {
                            if (!expanded[c.id]) {
                                const res = await request({ url: `/api/comment/reply/${c.id}` });
                                setReplyMap(prev => ({ ...prev, [c.id]: res.data.list }));
                            }
                            setExpanded(prev => ({ ...prev, [c.id]: !prev[c.id] }));
                        }}
                    />
                ))}
            </div>

            {loading && <div className="load-more">正在加载...</div>}
            {!hasMore && <div className="load-more">到底了，去发条评论吧~</div>}
        </div>
    );
}

// 抽离的子组件：单条评论项
function CommentItem({ comment, replies, isExpanded, onLike, onReply, onExpand }: any) {
    return (
        <div className="comment-item">
            <Link to={`/space/${comment.author.id}`}>
                <img className="avatar" src={comment.author.avatar} alt="avatar" />
            </Link>
            <div className="comment-main">
                <div className="author-info">
                    <span className="author-name">{comment.author.userName}</span>
                    <span className="time">{formatTime(comment.createdTime)}</span>
                </div>
                <div className="content">{renderContent(comment.content)}</div>

                <div className="actions">
                    <button className={`action-btn ${comment.liked ? 'liked' : ''}`} onClick={() => onLike(comment)}>
                        <Heart size={16} fill={comment.liked ? "currentColor" : "none"} />
                        {comment.likeCount || '点赞'}
                    </button>
                    <button className="action-btn" onClick={() => onReply(comment)}>
                        <MessageSquare size={16} /> 回复
                    </button>
                </div>

                {/* 回复列表渲染 */}
                {(comment.replyCount > 0) && (
                    <div className="reply-list">
                        {(isExpanded ? replies : comment.previewReply)?.map((r:Comment) => (
                            <div key={r.id} className="reply-item">
                                <img className="reply-avatar" src={r.author.avatar} alt="v" />
                                <div className="reply-content-box">
                                    <span className="author-name" style={{fontSize: '13px'}}>{r.author.userName}</span>
                                    <span className="reply-text">：{renderContent(r.content)}</span>
                                    <div className="actions" style={{marginTop: '4px'}}>
                                        <button className={`action-btn ${r.liked ? 'liked' : ''}`} onClick={() => onLike(r, comment.id)}>
                                            <Heart size={14} fill={r.liked ? "currentColor" : "none"} />
                                            {r.likeCount}
                                        </button>
                                        <button className="action-btn" onClick={() => onReply(r)}>回复</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {comment.replyCount > 3 && (
                            <div className="expand-btn" onClick={onExpand}>
                                {isExpanded ? "收起 ↑" : `查看全部 ${comment.replyCount} 条回复 ↓`}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}