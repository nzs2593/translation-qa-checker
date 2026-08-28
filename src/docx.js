const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_ENTRY = 0x02014b50;
const LOCAL_FILE_HEADER = 0x04034b50;

function findEndOfCentralDirectory(view) {
  const firstOffset = Math.max(0, view.byteLength - 65557);
  for (let offset = view.byteLength - 22; offset >= firstOffset; offset -= 1) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY) return offset;
  }
  throw new Error("Invalid DOCX archive.");
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot unpack DOCX files locally.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function readDocxText(file) {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const eocd = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocd + 10, true);
  const centralDirectoryOffset = view.getUint32(eocd + 16, true);
  let cursor = centralDirectoryOffset;
  let documentXml;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(cursor, true) !== CENTRAL_DIRECTORY_ENTRY) throw new Error("Invalid DOCX directory.");
    const compression = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = new TextDecoder().decode(new Uint8Array(buffer, cursor + 46, nameLength));

    if (name === "word/document.xml") {
      if (view.getUint32(localOffset, true) !== LOCAL_FILE_HEADER) throw new Error("Invalid DOCX document entry.");
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = new Uint8Array(buffer, dataStart, compressedSize);
      documentXml = compression === 0 ? compressed : compression === 8 ? await inflateRaw(compressed) : null;
      if (!documentXml) throw new Error("Unsupported DOCX compression.");
      break;
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  if (!documentXml) throw new Error("DOCX does not contain word/document.xml.");
  const xml = new DOMParser().parseFromString(new TextDecoder().decode(documentXml), "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("Could not read DOCX document content.");
  const paragraphs = Array.from(xml.getElementsByTagNameNS("*", "p"));
  return paragraphs
    .map((paragraph) => Array.from(paragraph.getElementsByTagNameNS("*", "t")).map((node) => node.textContent).join(""))
    .filter((paragraph) => paragraph.length > 0)
    .join("\n\n");
}
