// utils/highlight.ts
export function renderContent(text: string) {
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
        if (part.startsWith("@")) {
            return (
                <span key={index} className="mention">
                {part}
                </span>
        );
        }
        return part;
    });
}