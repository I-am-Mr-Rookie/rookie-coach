// Writes release/rookie-coach-extension.zip from the built extension, with no dependencies.
// manifest.json must sit at the ZIP root: Chrome refuses a dropped ZIP whose files are inside a wrapper folder.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { crc32, deflateRawSync } from "node:zlib";

const entries = ["manifest.json", "popup.html", "dist/", "dist/popup.js", "dist/collector.js"];
const root = new URL("../extension/", import.meta.url);
const locals = [];
const central = [];
let offset = 0;

for (const name of entries) {
  const folder = name.endsWith("/");
  const data = folder ? Buffer.alloc(0) : readFileSync(new URL(name, root));
  const packed = folder ? data : deflateRawSync(data, { level: 9 });
  const method = folder ? 0 : 8; // stored folder, deflated file
  const nameBytes = Buffer.from(name);
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6); // UTF-8 names
  header.writeUInt16LE(method, 8);
  header.writeUInt32LE(0x00210000, 10); // fixed 1980-01-01 timestamp keeps the ZIP reproducible
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(packed.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(nameBytes.length, 26);
  locals.push(header, nameBytes, packed);

  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4);
  entry.writeUInt16LE(20, 6);
  entry.writeUInt16LE(0x0800, 8);
  entry.writeUInt16LE(method, 10);
  entry.writeUInt32LE(0x00210000, 12);
  entry.writeUInt32LE(crc, 16);
  entry.writeUInt32LE(packed.length, 20);
  entry.writeUInt32LE(data.length, 24);
  entry.writeUInt16LE(nameBytes.length, 28);
  entry.writeUInt32LE(folder ? 0x10 : 0, 38); // MS-DOS directory attribute
  entry.writeUInt32LE(offset, 42);
  central.push(entry, nameBytes);
  offset += header.length + nameBytes.length + packed.length;
}

const directory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);

const out = new URL("../release/", import.meta.url);
mkdirSync(out, { recursive: true });
const zipUrl = new URL("rookie-coach-extension.zip", out);
writeFileSync(zipUrl, Buffer.concat([...locals, directory, end]));

// Read the written central directory back and confirm every entry is at the root.
const zip = readFileSync(zipUrl);
const names = [];
for (let i = 0, at = zip.readUInt32LE(zip.length - 22 + 16); i < zip.readUInt16LE(zip.length - 22 + 10); i++) {
  const length = zip.readUInt16LE(at + 28);
  names.push(zip.subarray(at + 46, at + 46 + length).toString("utf8"));
  at += 46 + length;
}
assert.deepEqual(names, entries, "ZIP entries must sit at the root");
console.log("Wrote release/rookie-coach-extension.zip (manifest.json at the root). Drop it on chrome://extensions with Developer mode on, or unzip it and Load unpacked that folder.");
