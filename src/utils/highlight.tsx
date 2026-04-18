import { Link } from "react-router-dom";

export function renderContent(content: string) {
    if (!content) return "";

    // 匹配 @[用户名](id) 格式的正则
    const mentionRegex = /@\[(.*?)\]\((\d+)\)/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    // 循环匹配所有 @ 信息
    while ((match = mentionRegex.exec(content)) !== null) {
        const [fullMatch, username, userId] = match;
        const index = match.index;

        // 1. 放入匹配项之前的普通文本
        if (index > lastIndex) {
            parts.push(content.substring(lastIndex, index));
        }

        // 2. 放入 React 组件形式的 Mention
        parts.push(
            <Link key={`${userId}-${index}`} to={`/space/${userId}`} className="mention">
                @{username}
            </Link>
        );

        lastIndex = index + fullMatch.length;
    }

    // 3. 放入剩余的文本
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
}