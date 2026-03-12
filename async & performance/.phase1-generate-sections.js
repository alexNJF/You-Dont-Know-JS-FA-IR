const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname);
const files = [
  "apA.md",
  "apB.md",
  "apC.md",
];
const placeholder = "<!-- TODO: ترجمه -->\n";

function splitSections(content) {
  const lines = content.split(/\r?\n/);
  const h2Starts = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) h2Starts.push(i);
  }

  if (h2Starts.length === 0) return [lines.join("\n")];

  const sections = [];
  sections.push(lines.slice(0, h2Starts[0]).join("\n"));

  for (let i = 0; i < h2Starts.length; i++) {
    const start = h2Starts[i];
    const end = i + 1 < h2Starts.length ? h2Starts[i + 1] : lines.length;
    sections.push(lines.slice(start, end).join("\n"));
  }

  return sections;
}

function namesFor(file, idx) {
  const isAppendix = file === "apA.md";
  if (isAppendix) {
    return {
      folder: "apA-sections",
      source: `ap-A-se-${idx}.md`,
      translate: `ap-Ase-${idx}.translate.md`,
    };
  }

  const chNum = path.basename(file, ".md").slice(2);
  return {
    folder: `ch${chNum}-sections`,
    source: `ch-${chNum}-se-${idx}.md`,
    translate: `ch-${chNum}se-${idx}.translate.md`,
  };
}

const perFile = [];
let totalSource = 0;
let totalTranslate = 0;
const createdDirs = [];

for (const file of files) {
  const inputPath = path.join(base, file);
  const content = fs.readFileSync(inputPath, "utf8");
  const sections = splitSections(content);

  const folder = namesFor(file, 0).folder;
  const outDir = path.join(base, folder);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    createdDirs.push(folder);
  }

  for (let i = 0; i < sections.length; i++) {
    let sectionContent = sections[i];
    if (i > 0) {
      sectionContent = sectionContent.replace(/^##\s+/, "# ");
    }

    const names = namesFor(file, i);
    fs.writeFileSync(path.join(outDir, names.source), sectionContent, "utf8");
    fs.writeFileSync(path.join(outDir, names.translate), placeholder, "utf8");

    totalSource += 1;
    totalTranslate += 1;
  }

  perFile.push({ file, sections: sections.length, dir: folder });
}

console.log(
  JSON.stringify(
    {
      perFile,
      totalSource,
      totalTranslate,
      createdDirs,
    },
    null,
    2
  )
);
