const main = document.getElementById("main");

document.addEventListener("DOMContentLoaded", async () => {
  await fetch("/index.md")
    .then((response) => {
      if (response.ok) return response.text();
      else throw new Error(response.status);
    })
    .then((data) => {
      if (typeof data === "string") main.appendChild(parseMarkDown(data));
      else throw new Error("Not parseable markdown");
    })
    .catch((err) => {
      document.body.innerText = `${err} \n Error occured when Catching Index.md`;
    });
});

function parseMarkDown(text) {
  const parent = document.createElement("section");

  if (typeof text === "string") {
    const markdownTests = [
      (text) => {
        const paragraphs = /^(?!\s*$)(?!\s*[-*+#]{1,}(?:\s|$)).+$/gm;

        return text.replace(paragraphs, (content) => {
          return `<p>${content.trim()}</p>`;
        });
      },

      (text) => {
        const header = /^(#{1,6})[ \t]+(.+)$/gm;

        return text.replace(header, (_, hashes, content) => {
          const level = hashes.length;
          return `<h${level}><span class="h">${hashes}</span> ${content}</h${level}>`;
        });
      },

      (text) => {
        const links = /\[([^\]]+)\]\(([^)]+)\)/g;

        return text.replace(
          links,
          (_, label, url) => `<a href="${url}">[${label}]</a>`,
        );
      },

      (text) => {
        const unList = /^([-*+])\s+(.+)$/gm;

        text = text.replace(unList, (_, listType, content) => {
          return `<li><span class="li">${listType}</span> ${content}</li>`;
        });

        return text.replace(
          /(?:[ \t]*<li>.*?<\/li>[ \t]*(?:\r?\n|$))+/g,
          (items) => `<ul>\n${items.trim()}\n</ul>`,
        );
      },
      (text) => {
        const comment = /`([^`\n]+)`/g;

        return text.replace(
          comment,
          (content) => `<span class="comment">${content}</span>`,
        );
      },
      (text) => {
        const hrRules = /[-]{3,}/g

        return text.replace(
          hrRules,
          (content) => `<hr />`,
        );
      },
    ];

    const result = markdownTests.reduce((currentText, test) => {
      return test(currentText);
    }, text);

    parent.innerHTML = result;
  }

  return parent;
}
