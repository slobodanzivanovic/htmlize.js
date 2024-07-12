"use strict";

const fs = require("node:fs");
const path = require("node:path");

class Htmlize {
  /**
   * Reads the content of markdown file
   *
   * @param {string} relativeFilePath - The relative path to the folder containing the markdown file
   * @param {string} fileName = The name of the markdown file
   * @returns {string} The content of the markdown file
   * @throws {Error} If an error occurs while reading the markdown file
   */
  readMarkdownFile(relativeFilePath, fileName) {
    try {
      const absoluteFilePath = path.resolve(relativeFilePath, fileName);
      const markdownContent = fs.readFileSync(absoluteFilePath, "utf-8");

      return markdownContent;
    } catch (error) {
      throw new Error("Error reading markdown file: " + error.message);
    }
  }

  markdownToHtml(markdownContent) {
    const lines = markdownContent.split("\n");

    let html = "";

    for (let line of lines) {
      if (line.startsWith("#")) {
        let headerLevel = line.split(" ")[0].length;
        const headerText = line.substring(headerLevel + 1);

        // Limit header level to h6
        headerLevel = Math.min(headerLevel, 6);

        html += `<h${headerLevel}>${headerText}</h${headerLevel}>\n\n`;
      } else {
        if (line.trim() !== "") {
          line = line
            // check for both bold and italic
            // modified version of regex (https://randyperkins2k.medium.com/writing-a-simple-markdown-parser-using-javascript-1f2e9449a558)
            .replace(/(\*\*|__)(.*?)\1/gim, "<b>$2</b>")
            .replace(/(\*|_)(.*?)\1/gim, "<i>$2</i>");

          // add to paragraph even if it is clear par or with bold/italic
          html += `<p>${line}</p>\n\n`;
        }
      }
    }

    return html;
  }
}

module.exports = Htmlize;
