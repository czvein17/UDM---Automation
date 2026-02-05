import XLSX from "xlsx";
import fs from "fs";

function colToLetter(col) {
    let s = "";
    while (col >= 0) {
        s = String.fromCharCode(65 + (col % 26)) + s;
        col = Math.floor(col / 26) - 1;
    }
    return s;
}

export function writeStatusesToExcel(filePath, results) {
    if (!fs.existsSync(filePath)) throw new Error(`Excel file not found: ${filePath}`);

    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    // read header row
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const headers = rows[0] || [];

    // find or create Status column (case-insensitive)
    let statusCol = headers.findIndex((h) => String(h || "").toLowerCase() === "status");
    if (statusCol === -1) {
        statusCol = headers.length;
        const cellAddr = `${colToLetter(statusCol)}1`;
        ws[cellAddr] = { t: "s", v: "Status" };
        // update range
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        range.e.c = Math.max(range.e.c, statusCol);
        ws["!ref"] = XLSX.utils.encode_range(range);
    }

    // write each result into the Status column; results.rowIndex assumed 0 => sheet row 2
    for (const r of results) {
        const rowNum = (r.rowIndex ?? 0) + 2; // +2 => header row + 1-based
        const cellAddr = `${colToLetter(statusCol)}${rowNum}`;
        ws[cellAddr] = { t: "s", v: String(r.status ?? "") };
    }

    XLSX.writeFile(wb, filePath);
}