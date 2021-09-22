// https://github.com/magenta/magenta-js/blob/ce4ab4c4255eeb7d78e014fd7656b4207fd94119/music/src/core/midi_io.ts

import fs from "fs-extra";
import path from "path";
import parse from "csv-parse";
import core from "@magenta/music/node/core.js";
import stringifyObject from "stringify-object";

const { midiToSequenceProto } = core;

const [csvFile, outFile] = process.argv.slice(2);

let parser;
const promise = new Promise((res, rej) => {
  parser = parse({ columns: true }, (err, records) => {
    if (err) rej(err);
    else res(records);
  });
});

fs.createReadStream(csvFile).pipe(parser);

promise
  .then((rows) => {
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        noteSequence: midiToSequenceProto(
          (await fs.readFile(path.join("assets", row.midi_filename))).buffer
        ),
      }))
    );
  })
  .then((rows) =>
    fs.outputFile(
      outFile,
      JSON.stringify(rows, null, 2),
      //       ```
      // export default ${stringifyObject(rows, { indent: "  ", singleQuotes: false })};
      // ```,
      "utf-8"
    )
  );
