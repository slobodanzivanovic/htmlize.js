const Htmlize = require("../../src/htmlize");

const htmlize = new Htmlize();

const markdownContent = htmlize.readMarkdownFile("dist", "example.md");

// const generated = htmlize.markdownToHtml(markdownContent);

htmlize.generateHtml(markdownContent, "dist/cjs", "generated.html");

// console.log(generated);
