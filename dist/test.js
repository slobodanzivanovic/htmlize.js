const Htmlize = require("../src/htmlize");

const htmlize = new Htmlize();

const markdownContent = htmlize.readMarkdownFile("dist", "example.md");

const split = markdownContent.split("\n");

console.log(split);
