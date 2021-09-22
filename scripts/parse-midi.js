// https://github.com/magenta/magenta-js/blob/ce4ab4c4255eeb7d78e014fd7656b4207fd94119/music/src/core/midi_io.ts

import fs from "fs-extra";
import path from "path";
import parse from "csv-parse";
import core from "@magenta/music/node/core.js";
import stringifyObject from "stringify-object";

const { midiToSequenceProto } = core;

const [csvFile, outDir] = process.argv.slice(2);

let parser;
const promise = new Promise((res, rej) => {
  parser = parse({ columns: true }, (err, records) => {
    if (err) rej(err);
    else res(records);
  });
});

fs.createReadStream(csvFile).pipe(parser);

promise.then((rows) => {
  rows.forEach(async (row, i) => {
    const object = {
      ...row,
      noteSequence: midiToSequenceProto(
        (await fs.readFile(path.join("assets", row.midi_filename))).buffer
      ),
    };
    fs.outputFile(
      path.join(outDir, `${i}.json`),
      JSON.stringify(object, null, 2)
    );
  });
});
