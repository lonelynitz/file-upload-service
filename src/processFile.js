import fs from "fs";
import csv from "csv-parser";
import  dbConnect from "../config/db.js";
import { insertBatch } from "./batchInsert.js";
import { updateProgress } from "./updateFile.js";

const db = dbConnect();

export const processFile = async (
  filePath,
  jobId
) => {
  const batch = [];

  let processedRows = 0;

  const stream = fs
    .createReadStream(filePath)
    .pipe(csv());

  stream.on("data", async (row) => {
    stream.pause();

    try {
      batch.push([
        row.name,
        row.email,
      ]);

      if (batch.length >= 1000) {
        // await insertBatch(batch);

        processedRows += batch.length;

        await updateProgress(
          jobId,
          processedRows
        );

        batch.length = 0;
      }
    } catch (err) {
      console.log(err);
    }

    stream.resume();
  });

  stream.on("end", async () => {
    try {
      if (batch.length > 0) {
        // await insertBatch(batch);

        processedRows += batch.length;
      }

      await db.query(
        `
        UPDATE jobs
        SET
          status = 'completed',
          processed_rows = $1
        WHERE id = $2
      `,
        [processedRows, jobId]
      );

      console.log("Completed");
    } catch (err) {
      console.log(err);
    }
  });

  stream.on("error", async (err) => {
    console.log(err);

    await db.query(
      `
      UPDATE jobs
      SET status = 'failed'
      WHERE id = $1
    `,
      [jobId]
    );
  });
};