
export default function extractTitleAndAbstract() {
  // All remark and rehype plugins return a separate function
  return function (tree, file) {
    console.log("This is an example remark plugin");
    console.log("The tree is:", tree);
    
    if (!file.data.astro.frontmatter.title) {
      const firstTopHeadingIdx = tree.children.findIndex(node => node.type === "heading" && node.depth === 1);
      if (firstTopHeadingIdx !== -1) {
        file.data.astro.frontmatter.title = extractText(tree.children[firstTopHeadingIdx]);
        // tree.children.splice(firstTopHeadingIdx, 1);
      }
    }

    console.log("The frontmatter is:", file.data.astro.frontmatter);
  }
}

function extractText(node) {
  if (node.type === "text") {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }
  return "";
}