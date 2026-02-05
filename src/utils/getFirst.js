export function getFirst(row, keys = []) {
    for (const k of keys) {
        if (k in row && row[k] != null && String(row[k]).trim() !== "") return row[k];
    }
    return undefined;
}