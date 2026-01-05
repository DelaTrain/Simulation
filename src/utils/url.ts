export function getDataUrl(path: string): string {
    return `${import.meta.env.BASE_URL}data${path}`;
}
