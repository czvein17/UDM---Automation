export function buildTargetUrl(row) {
    const elementId = String(row["Element ID"] ?? "").trim();
    if (!elementId) throw new Error('Missing "Element ID"');

    const tableRaw = String(row["Table Name"] ?? "");
    const tableName = normalizeTableName(tableRaw);

    const base = "https://axis.ehr.com/en-US/survey-setup/surveys/48";

    if (tableName === "SUBMISSIONCOMPANY" ||
        tableName === "SUBMISSIONUNIT" ||
        tableName === "SUBMISSIONCONTACT" ||
        tableName === "COMPANYDATA") {
        return `${base}/organization/${encodeURIComponent(elementId)}`;
    }

    if (tableName === "SUBMISSIONINCUMBENT" || tableName === "SUBMISSIONGRANT") {
        return `${base}/incumbent/${encodeURIComponent(elementId)}`;
    }

    throw new Error(`Unsupported Table Name: "${tableRaw}" (normalized="${tableName}")`);
}

function normalizeTableName(s) {
    // trims, removes weird spacing, uppercases
    return String(s).trim().replace(/\s+/g, "").toUpperCase();
}
