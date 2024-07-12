import Htmlize from "../../src/htmlize.js";

const htmlize = new Htmlize();

const markdownContent = htmlize.readMarkdownFile("dist", "example.md");

const generated = htmlize.markdownToHtml(markdownContent);

console.log(generated);
