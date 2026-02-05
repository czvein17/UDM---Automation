import XLSX from "xlsx";

export function readExcel(filePath) {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    return { sheetName, rows };
}
