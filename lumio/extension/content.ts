// Content script: highlights text mentioning Lumio task IDs on any page.
// Used by M71 to test content script behavior.

function highlightLumioReferences() {
  const taskPattern = /\bLMO-\d+\b/g;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (taskPattern.test((node as Text).data)) {
      textNodes.push(node as Text);
    }
    taskPattern.lastIndex = 0;
  }

  for (const textNode of textNodes) {
    const span = document.createElement('span');
    span.innerHTML = textNode.data.replace(
      /\bLMO-\d+\b/g,
      (match) =>
        `<a href="http://localhost:3000/tasks/${match}" target="_blank" style="color:#4f6ef7;font-weight:bold;" data-lumio-task="${match}">${match}</a>`,
    );
    textNode.parentNode?.replaceChild(span, textNode);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', highlightLumioReferences);
} else {
  highlightLumioReferences();
}

(window as unknown as Record<string, unknown>).__lumioContentScript = { highlightLumioReferences };
