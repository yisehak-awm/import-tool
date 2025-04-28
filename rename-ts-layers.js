import fs from "fs";

// Define your renaming map
const renameMap = {
  base: "b",
  theme: "t",
  utilities: "u",
  components: "c",
};

// Read the input CSS file
const css = fs.readFileSync("./dist/index.min.css", "utf8");

// Replace layer names using regex
let updatedCss = css;
Object.keys(renameMap).forEach((oldName) => {
  const newName = renameMap[oldName];
  const regex = new RegExp(`@layer\\s+${oldName}\\b`, "g");
  updatedCss = updatedCss.replace(regex, `@layer ${newName}`);
});

// Write the updated CSS to a new file
fs.writeFileSync("./dist/index.min.css", updatedCss);
console.log("Layer names updated in index.min.css");
