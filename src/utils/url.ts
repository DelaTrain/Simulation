export function getDataUrl(path: string): string {
    console.log(import.meta.env.BASE_URL);
    return `${import.meta.env.BASE_URL}data${path}`;
}
