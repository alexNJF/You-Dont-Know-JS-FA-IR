# YDKJS Persian Translation Workflow — Agent Prompt

Use this prompt to have any agent perform the same section extraction and translation workflow on a YDKJS book folder.

---

## Task Overview

For a given YDKJS book folder (e.g., `get-started`, `objects-classes`, `scope-closures`, `types-grammar`, `up & going`, etc.):

1. **Extract** all sections from each chapter/appendix file by splitting on `## ` (H2) headers
2. **Create** section folders with source files and translation placeholder files
3. **Translate** all content from English to Persian (Farsi)
4. **Create** root-level translation files (README, foreword, toc)

---

## Step 1: Section Extraction

### Rules

- **Section 0** = Everything from the start of the file up to (but not including) the first `## ` header. This includes the book title and chapter intro.
- **Section N** (N > 0) = Content from a `## ` header through the next `## ` header (exclusive).
- For standalone section files (N > 0), promote the first `## ` to `# ` (H1) in the extracted file.

### Naming Convention

| Type | Source File | Translation File | Folder |
|------|-------------|------------------|--------|
| Chapter 1 | `ch-1-se-0.md`, `ch-1-se-1.md`, ... | `ch-1se-0.translate.md`, `ch-1se-1.translate.md`, ... | `ch1-sections/` |
| Chapter 2 | `ch-2-se-0.md`, `ch-2-se-1.md`, ... | `ch-2se-0.translate.md`, `ch-2se-1.translate.md`, ... | `ch2-sections/` |
| Appendix A | `ap-A-se-0.md`, `ap-A-se-1.md`, ... | `ap-Ase-0.translate.md`, `ap-Ase-1.translate.md`, ... | `apA-sections/` |
| Appendix B | `ap-B-se-0.md`, `ap-B-se-1.md`, ... | `ap-Bse-0.translate.md`, `ap-Bse-1.translate.md`, ... | `apB-sections/` |

**Pattern:** `ch-X-se-N` (source) → `ch-Xse-N` (translate). The hyphen before `se` is removed in the translation filename.

### Files to Process

- All `chN.md` files (ch1.md, ch2.md, ...)
- All `apA.md`, `apB.md` files if they exist

---

## Step 2: Translation File Structure

### Section 0 (Chapter/Appendix Intro)

Translation file should start with:
```
# [Persian Book Title]: [Book Subtitle] - ویرایش دوم
# [Persian Chapter/Appendix Title]

[Translated content...]
```

### Section N (N > 0)

Translation file should start with:
```
# [Persian Section Title]

[Translated content...]
```

### Translation Rules

1. **Code blocks**: Keep ALL code blocks (```js, ```json, ```html, etc.) **completely unchanged**. Do not translate code, comments inside code, or code structure.

2. **Tables**: Translate NOTE, WARNING, TIP table content to Persian. Keep the table structure:
   ```
   | NOTE: |
   | :--- |
   | [Persian translation of note content] |
   ```

3. **Technical terms**: Keep these in English when used as code/technical terms: scope, closure, hoisting, TDZ, prototype, object, class, module, callback, etc.

4. **"Work in progress"**: Translate to `در حال انجام`

5. **Structure**: Preserve all markdown (headers, lists, bold, italic, links). Only translate prose text.

6. **Style**: Match the tone of existing Persian translations in the project. Use formal Persian. Technical explanations should be clear and accurate.

---

## Step 3: Root-Level Translation Files

Create these files in the book folder:

### README.translate.md

- Persian book title and structure
- Links to `toc.translate.md`, `foreword.translate.md`
- Links to chapter files (ch1.md, ch2.md, etc.) with Persian chapter titles
- Links to appendices if they exist

### foreword.translate.md

- `# [Persian Book Title]`
- `# پیش‌گفتار`
- Full translation of foreword content
- Keep author name and attribution (e.g., "نوشتهٔ [Author Name](url)")

### toc.translate.md

- `# [Persian Book Title]`
- `## فهرست مطالب`
- Full table of contents with Persian section titles
- Match the structure of the original toc.md

---

## Step 4: Persian Chapter Titles Reference

Use these patterns for chapter titles (adjust per book):

| English | Persian |
|---------|---------|
| What's the Scope? | Scope چیست؟ |
| Object Foundations | مبانی اشیاء |
| How Objects Work | سازکار اشیاء |
| Scope & Closures | Scope و Closures |
| Exploring Further | کاوش بیشتر |
| Practice | تمرین |
| Foreword | پیش‌گفتار |
| Table of Contents | فهرست مطالب |
| About This Book | دربارهٔ این کتاب |

---

## Step 5: Execution Order

1. **Extract** sections: Create all `*-sections/` folders, write source `.md` files
2. **Create placeholders**: Write `.translate.md` files with `<!-- TODO: ترجمه -->` or proper headers
3. **Translate**: Replace placeholder content with full Persian translations
4. **Create root files**: README.translate.md, foreword.translate.md, toc.translate.md

---

## Example Agent Instruction

You can give an agent this instruction:

```
Apply the YDKJS Persian Translation Workflow to the folder [FOLDER_PATH].

1. Read TRANSLATION_WORKFLOW_PROMPT.md in this repo for full instructions.
2. Extract all sections from chN.md and apA.md/apB.md files by splitting on ## headers.
3. Create chN-sections/ and apA-sections/apB-sections folders with:
   - Source files: ch-X-se-N.md, ap-A-se-N.md
   - Translation files: ch-Xse-N.translate.md, ap-Ase-N.translate.md
4. Translate ALL content to Persian following the rules (keep code blocks unchanged, translate tables, preserve structure).
5. Create README.translate.md, foreword.translate.md, toc.translate.md with Persian content.

Use the naming convention and structure from get-started, objects-classes, or scope-closures as reference.
```

---

## Reference Folders

- **get-started**: Full example with ch1–ch4, apA, apB
- **objects-classes**: ch1–ch5, no appendices, has thanks.translate.md
- **scope-closures**: ch1–ch8, apA, apB

---

## Notes

- Some books may have `thanks.md` — create `thanks.translate.md` if it exists
- The `preface.md` is usually at repo root (`../preface.md`) — link to it, don't duplicate
- Image paths (e.g., `images/cover.png`) stay unchanged in translations
