import  dbConnect from "../config/db.js";
const db = dbConnect(); 

export const updateProgress = async (
  jobId,
  processedRows
) => {
  await db.query(
    `
    UPDATE jobs
    SET processed_rows = $1
    WHERE id = $2
  `,
    [processedRows, jobId]
  );
};