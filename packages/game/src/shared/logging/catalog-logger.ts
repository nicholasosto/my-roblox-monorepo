/// <reference types="@rbxts/types" />

import { ATTRIBUTE_KEYS, AttributeCatalog, AttributeDisplayMeta } from "../catalogs/attributes/attribute-catalog";

type BoxStyle = {
  pad: number;
  maxWidth: number;
  titleChar: string;
  ruleChar: string;
};

const defaultStyle: BoxStyle = {
  pad: 1,
  maxWidth: 100,
  titleChar: "=",
  ruleChar: "-",
};

function repeatChar(ch: string, count: number) {
  return string.rep(ch, count);
}

function clamp(n: number, min: number, max: number) {
  const a = n < min ? min : n;
  return a > max ? max : a;
}

function padRight(text: string, width: number) {
  const pad = math.max(0, width - text.size());
  return text + repeatChar(" ", pad);
}

function wordWrap(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines = new Array<string>();
  let current = "";
  for (const word of words) {
    if (current.size() === 0) {
      current = word;
      continue;
    }
    if ((current.size() + 1 + word.size()) <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.size() > 0) lines.push(current);
  return lines;
}

function printBoxed(title: string, bodyLines: string[], style: BoxStyle = defaultStyle) {
  const pad = repeatChar(" ", style.pad);
  const innerWidth = clamp(style.maxWidth - 2 - style.pad * 2, 30, 200);
  const top = `${style.titleChar}${repeatChar(style.titleChar, innerWidth + style.pad * 2)}${style.titleChar}`;

  print(top);
  const titleText = ` ${title} `;
  const cappedTitle = titleText.size() > innerWidth ? titleText.sub(1, innerWidth) : titleText;
  const titleLine = `${style.titleChar}${pad}${padRight(cappedTitle, innerWidth)}${pad}${style.titleChar}`;
  print(titleLine);
  print(`${style.titleChar}${repeatChar(style.ruleChar, innerWidth + style.pad * 2)}${style.titleChar}`);

  for (const line of bodyLines) {
  const wrapped = line.size() > innerWidth ? wordWrap(line, innerWidth) : [line];
    for (const w of wrapped) {
      print(`${style.titleChar}${pad}${padRight(w, innerWidth)}${pad}${style.titleChar}`);
    }
  }
  print(top);
}

export type AttributeCatalogLoggerOptions = {
  maxWidth?: number;
  showIcons?: boolean;
  showDescriptions?: boolean;
};

export function logAttributeCatalog(options: AttributeCatalogLoggerOptions = {}) {
  const style: BoxStyle = { ...defaultStyle, maxWidth: options.maxWidth ?? defaultStyle.maxWidth };

  const lines = new Array<string>();
  lines.push(`Count: ${ATTRIBUTE_KEYS.size()}`);
  lines.push(`Keys: ${ATTRIBUTE_KEYS.join(", ")}`);
  lines.push("");

  // Header row (fixed widths)
  const colA = 12; // Attribute
  const colB = 20; // Icon
  const colC = 7; // Default
  const header = `${padRight("Attribute", colA)}  ${padRight("Icon", colB)}  ${padRight("Default", colC)}  Description`;
  lines.push(header);
  lines.push(repeatChar("-", header.size()));

  for (const key of ATTRIBUTE_KEYS) {
    const meta: AttributeDisplayMeta = AttributeCatalog[key];
    const icon = options.showIcons !== false ? (meta.icon ?? "-") : "-";
    const def = 5; // from makeDefaultAttributeDTO/default state

    const rowPrefix = `${padRight(key, colA)}  ${padRight(icon, colB)}  ${padRight(tostring(def), colC)}  `;
  const wrapWidth = math.max(10, (style.maxWidth - 2 - style.pad * 2) - rowPrefix.size());
    const desc = options.showDescriptions === false ? "" : meta.description;
    if (desc.size() === 0) {
      lines.push(rowPrefix);
    } else {
      const wrapped = wordWrap(desc, wrapWidth);
      lines.push(`${rowPrefix}${wrapped[0]}`);
      for (let i = 1; i < wrapped.size(); i++) {
        lines.push(`${padRight("", rowPrefix.size())}${wrapped[i]}`);
      }
    }
  }

  printBoxed("Attribute Catalog", lines, style);
}
