export interface PageResponse<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}