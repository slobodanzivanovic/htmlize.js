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
}

module.exports = Htmlize;
