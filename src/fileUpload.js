import dbConnect from "../config/db.js"
import { processFile } from "./processFile.js";

const db = dbConnect()

export const fileUploads = async (file) => {
    try {
        const result = await db.query(
        `
        INSERT INTO jobs (file_name,status)
        VALUES ($1, $2)
        RETURNING *
      `,
        [file.originalname, "processing"]
      );
      const job = result.rows[0];

      processFile(file.path, job.id);

      return job;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}