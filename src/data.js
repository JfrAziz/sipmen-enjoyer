import fs from "fs"
import csv from "csv-parser"

export const fromCsv = (path) => {
  return new Promise((resolve, reject) => {
    const raw = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data) => raw.push(data))
      .on('end', () => resolve(raw))
  })
}
