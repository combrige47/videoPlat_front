// utils/time.ts
export function formatTime(time: string) {
    const now = new Date().getTime();
    const t = new Date(time).getTime();

    const diff = (now - t) / 1000;

    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}天前`;

    return new Date(time).toLocaleDateString();
}