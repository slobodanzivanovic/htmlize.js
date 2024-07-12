const Htmlize = require("../../src/htmlize");

const htmlize = new Htmlize();

const markdownContent = htmlize.readMarkdownFile("dist", "example.md");

const generated = htmlize.markdownToHtml(markdownContent);

console.log(generated);
