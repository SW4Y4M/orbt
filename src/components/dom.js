// Tiny DOM helpers — just enough to build views without a framework.

/**
 * Create an element.
 * @param {string} tag
 * @param {Object} [attrs]  properties/attributes; `class`, `text`, `html`,
 *   `on` (event map), and `dataset` are handled specially.
 * @param {(Node|string|null|undefined)[]} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k === "on") {
      for (const [evt, fn] of Object.entries(v)) node.addEventListener(evt, fn);
    } else if (k in node) {
      node[k] = v;
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

/** Remove all children of a node. @param {HTMLElement} node */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Replace a node's contents with new children. */
export function mount(node, ...children) {
  clear(node);
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}
