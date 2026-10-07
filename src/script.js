const main = document.getElementById("main");
const pLoadingText = document.getElementById("loading-text")

const indexMdPath = "public/index.md" 

document.addEventListener("DOMContentLoaded", async () => {
  await fetch(indexMdPath, {method: "GET", cache: "default", priority: "auto"})
    .then((response) => {
      if (response.ok) return response.text();
      else throw new Error(`${response.status} ${response.statusText}`);
    })
    .then((data) => {
      if (typeof data === "string") {
        const markdownHTML = parseMarkDown(data, markdownRegexParseFunctions);
        main.removeChild(pLoadingText)
        
        if (markdownHTML instanceof HTMLElement && markdownHTML !== undefined) {
          main.appendChild(markdownHTML);
        }

        return
      }
      
      throw new Error("Not parseable markdown");
    })
    .catch((err) => {
      main.innerText = `${err} \nThis occured when fetching index.md`;
      main.className = "error-page"
    });
});

const markdownRegexParseFunctions = [
  /* p */
  (text) => {
    const paragraphs = /^(?!\s*$)(?!\s*[-*+#]{1,}(?:\s|$)).+$/gm;

    return text.replace(paragraphs, (content) => `<p>${content.trim()}</p>`);
  },

  /* h1-h6 */
  (text) => {
    const header = /^(#{1,6})[ \t]+(.+)$/gm;

    return text.replace(header, (_, hashes, content) => {
      const level = hashes.length;
      return `<h${level}><span class="h">${hashes}</span> ${content}</h${level}>`;
    });
  },

  /* a */
  (text) => {
    const links = /\[([^\]]+)\]\(([^)]+)\)/g;

    return text.replace(
      links,
      (_, label, url) => `<a href="${url}">[${label}]</a>`,
    );
  },

  /* ul/li */
  (text) => {
    const unList = /^([-*+])\s+(.+)$/gm;

    text = text.replace(
      unList,
      (_, listType, content) =>
        `<li><span class="li">${listType}</span> ${content}</li>`,
    );

    return text.replace(
      /(?:[ \t]*<li>.*?<\/li>[ \t]*(?:\r?\n|$))+/g,
      (items) => `<ul>\n${items.trim()}\n</ul>`,
    );
  },

  /* text comments -> span */
  (text) => {
    const comment = /`([^`\n]+)`/g;

    return text.replace(
      comment,
      (content) => `<span class="comment">${content}</span>`,
    );
  },

  /* hr */
  (text) => {
    const hrRules = /[-]{3,}/g;

    return text.replace(hrRules, (_) => `<hr />`);
  },
];


function parseMarkDown(text, markdownTests) {
  const parent = document.createElement("section");

  if (typeof text === "string") {
    const result = markdownTests.reduce((currentText, test) => {
      try {
        return test(currentText);
      } catch (err) {
        console.error(`Markdown Parsing Function failed:\n${err}`);

        const errorPar = document.createElement("p");
        errorPar.innerText = "FAILED PARSE MARKDOWN";

        return errorPar
      }
    }, text);

    if ("setHTML" in parent) {
      parent.setHTML(result);
    } else {
      parent.innerHTML = result;
    }
  }

  return parent;
}