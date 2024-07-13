(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["fs", "path"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("fs"), require("path"));
  } else {
    root.Htmlize = factory(root.fs, root.path);
  }
})(this, function (fs, path) {
  "use strict";

  class Htmlize {
    /**
     * Reads the content of markdown file
     *
     * @param {string} relativeFilePath - The relative path to the folder containing the markdown file
     * @param {string} fileName - The name of the markdown file
     * @returns {string} - The content of the markdown file
     * @throws {Error} - If an error occurs while reading the markdown file
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

    /**
     * Converts markdown content to HTML
     *
     * @param {string} markdownContent - The markdown content to convert
     * @returns {string} - The converted HTML contet
     */
    markdownToHtml(markdownContent) {
      const lines = markdownContent.split("\n");

      let html = "";

      let inList = false;
      let listType = "";
      let firstItem = true;

      let inCodeBlock = false;

      let inBlockquote = false;

      for (let line of lines) {
        if (line.startsWith(">")) {
          if (!inBlockquote) {
            inBlockquote = true;
            html += "<blockquote>\n";
          }
          line = line.substring(1);
          html += `\t<p>${line.trim()}</p>\n`;
        } else if (inBlockquote) {
          html += "</blockquote>\n\n";
          inBlockquote = false;
        } else if (line.startsWith("```")) {
          if (inCodeBlock) {
            html += "\t</code>\n</pre>\n\n";
            inCodeBlock = false;
          } else {
            html += "<pre>\n\t<code>\n";
            inCodeBlock = true;
          }
        } else if (inCodeBlock) {
          html += `${line}\n`;
        } else {
          if (line.startsWith("* ") || line.startsWith("- ")) {
            if (!inList) {
              inList = true;
              listType = "ul";
              // new line, tab -> indent first item
              html += `<${listType}>\n\t`;
            }

            line = line.substring(2);

            // check if it is first item in list because indentation for first item
            // is getting from list
            if (firstItem) {
              html += `<li>${line}</li>\n`;
            } else {
              html += `\t<li>${line}</li>\n`;
            }

            firstItem = false;
          } else if (line.startsWith("![")) {
            const altTextStartIndex = line.indexOf("[") + 1;
            const altTextEndIndex = line.indexOf("]");
            const altText = line.substring(altTextStartIndex, altTextEndIndex);
            const urlStartIndex = line.indexOf("(") + 1;
            const urlEndIndex = line.indexOf(")");
            const url = line.substring(urlStartIndex, urlEndIndex);
            html += `<img src="${url}" alt="${altText}">\n\n`;
          } else if (line.includes("[") && line.includes("](")) {
            const linkTextStartIndex = line.indexOf("[") + 1;
            const linkTextEndIndex = line.indexOf("]");
            const linkText = line.substring(
              linkTextStartIndex,
              linkTextEndIndex
            );
            const urlStartIndex = line.indexOf("](") + 2;
            const urlEndIndex = line.indexOf(")");
            const url = line.substring(urlStartIndex, urlEndIndex);
            html += `<a href="${url}">${linkText}</a>\n\n`;
          } else if (/^\d+\./.test(line)) {
            if (!inList) {
              inList = true;
              listType = "ol";
              html += `<${listType}>\n\t`;
            }

            const parts = line.split(".");
            const number = parts.shift();
            const rest = parts.join(".");

            if (firstItem) {
              html += `<li value="${number}">${rest.trim()}</li>\n`;
            } else {
              html += `\t<li value="${number}">${rest.trim()}</li>\n`;
            }
            firstItem = false;
          } else {
            if (inList) {
              inList = false;

              // we use two new lines here because if we have p tag after list it
              // will be generated just under list and will not have spacing
              html += `</${listType}>\n\n`;
              firstItem = true;
            }
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
                  .replace(/(\*|_)(.*?)\1/gim, "<i>$2</i>")

                  // inline code
                  .replace(/(`)(.*?)\1/g, "<code>$2</code>")
                  // strikethrough
                  .replace(/~~(.*?)~~/gim, "<s>$1</s>");

                // add to paragraph even if it is clear par or with bold/italic
                html += `<p>${line}</p>\n\n`;
              }
            }
          }
        }
      }

      if (inList) {
        html += `</${listType}>\n\n`;
      }

      if (inCodeBlock) {
        html += "\t</code>\n</pre>\n\n";
      }

      if (inBlockquote) {
        html += "</blockquote>\n\n";
      }

      return html;
    }

    /**
     * Generates HTML file from markdown content
     *
     * @param {string} markdownContent - The markdown content to convert to HTML
     * @param {string} outputDirectory - The directory where the generated HTML file will be saved
     * @param {string} outputFileName - The name of the generated HTML file
     * @throws {Error} If an error occurs during the generation of the HTML file
     */
    generateHtml(markdownContent, outputDirectory, outputFileName) {
      try {
        const htmlContent = this.markdownToHtml(markdownContent);

        const templatePath = path.resolve(__dirname, "template.html");
        let templateHtml = fs.readFileSync(templatePath, "utf-8");

        templateHtml = templateHtml.replace("<!-- TITLE -->", outputFileName);
        templateHtml = templateHtml.replace("<!-- CONTENT -->", htmlContent);

        const outputPath = path.resolve(outputDirectory, outputFileName);

        fs.writeFileSync(outputPath, templateHtml, "utf-8");

        console.log(
          `HTML file "${outputFileName}" generated successfully at ${outputPath}!`
        );
      } catch (error) {
        throw new Error("Error generating HTML file: " + error.message);
      }
    }
  }

  return Htmlize;
});
