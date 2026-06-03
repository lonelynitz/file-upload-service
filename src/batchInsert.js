import  dbConnect from "../config/db.js";
const db = dbConnect();

export const insertBatch = async (batch) => {
  const values = [];
  const placeholders = [];

  batch.forEach((row, index) => {
    const offset = index * 2;

    placeholders.push(
      `($${offset + 1}, $${offset + 2})`
    );

    values.push(...row);
  });
};