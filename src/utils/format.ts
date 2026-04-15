export function formatCount(num: number) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + "万";
    }
    return num;
}