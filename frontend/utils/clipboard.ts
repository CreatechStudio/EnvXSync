export async function CopyToClipboard(text: string) {
    return navigator.clipboard.writeText(text);
}
