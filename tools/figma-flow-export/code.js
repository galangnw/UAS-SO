/* global figma */
/**
 * Stick Brawl Flow Export
 * ------------------------------------------------------------------
 * Plugin Figma (read-only) untuk mengekspor:
 *  - prototype reactions / interactions tiap node (trigger -> action -> tujuan)
 *  - flow starting points tiap page
 *  - peta node supaya destinationId bisa diterjemahkan jadi nama frame
 *
 * Tidak mengubah file Figma sama sekali.
 */

const UI_HTML = `
  <style>
    body { margin: 0; padding: 12px; font: 12px/1.5 sans-serif; color: #eaeaea; background: #1e1e1e; }
    #stat { margin-bottom: 8px; color: #9cdcfe; }
    #json { width: 100%; height: 470px; box-sizing: border-box; resize: none;
            background: #111; color: #d4d4d4; border: 1px solid #444; padding: 8px;
            font: 11px/1.4 monospace; }
    .row { display: flex; gap: 8px; margin-top: 8px; }
    button { flex: 1; padding: 8px; cursor: pointer; background: #0b5394; color: #fff;
             border: 0; border-radius: 4px; }
    button:hover { background: #1372c2; }
    small { display: block; margin-top: 8px; color: #888; }
  </style>
  <div id="stat">Mengumpulkan data...</div>
  <textarea id="json" readonly></textarea>
  <div class="row">
    <button id="copy">Copy JSON</button>
    <button id="download">Download .json</button>
  </div>
  <small>JSON ini bisa ditempel langsung ke chat, atau file .json-nya dilampirkan.</small>
  <script>
    window.onmessage = function (event) {
      var msg = event.data.pluginMessage;
      if (!msg || msg.type !== 'data') return;
      document.getElementById('json').value = msg.json;
      document.getElementById('stat').textContent = msg.stat;
    };
    document.getElementById('copy').onclick = function () {
      var t = document.getElementById('json');
      t.focus();
      t.select();
      document.execCommand('copy');
      parent.postMessage({ pluginMessage: { type: 'copied' } }, '*');
    };
    document.getElementById('download').onclick = function () {
      var blob = new Blob([document.getElementById('json').value], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'stick-brawl-flow.json';
      a.click();
      URL.revokeObjectURL(a.href);
    };
  </script>
`;

function safe(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { _unserializable: true };
  }
}

// Reaksi prototype: API baru async (`getReactionsAsync`), fallback ke
// properti `node.reactions` untuk versi Figma lama.
async function readReactions(node) {
  if (typeof node.getReactionsAsync === 'function') {
    try {
      return (await node.getReactionsAsync()) || [];
    } catch {
      return node.reactions || [];
    }
  }
  return node.reactions || [];
}

async function collect() {
  if (typeof figma.loadAllPagesAsync === 'function') {
    await figma.loadAllPagesAsync();
  }

  const nodes = new Map();
  const raw = [];
  let reactionCount = 0;

  async function visit(node, pageName) {
    nodes.set(node.id, {
      id: node.id,
      name: node.name,
      type: node.type,
      page: pageName,
    });

    const reactions = await readReactions(node);

    if (reactions.length) {
      raw.push({
        page: pageName,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        reactions: safe(reactions),
      });
      reactionCount += reactions.length;
    }

    for (const child of node.children || []) {
      await visit(child, pageName);
    }
  }

  for (const page of figma.root.children) {
    if (typeof page.loadAsync === 'function') {
      try {
        await page.loadAsync();
      } catch {
        // Halaman sudah termuat.
      }
    }
    for (const child of page.children) {
      await visit(child, page.name);
    }
  }

  const flowStartingPoints = [];
  for (const page of figma.root.children) {
    for (const fp of page.flowStartingPoints || []) {
      const info = nodes.get(fp.nodeId);
      flowStartingPoints.push({
        page: page.name,
        nodeId: fp.nodeId,
        name: fp.name,
        frameName: info ? info.name : null,
        frameType: info ? info.type : null,
      });
    }
  }

  const graph = raw
    .map((entry) => {
      const transitions = [];
      for (const reaction of entry.reactions) {
        const trigger = reaction.trigger || {};
        for (const action of reaction.actions || []) {
          const dest = action.destinationId
            ? nodes.get(action.destinationId)
            : null;
          transitions.push({
            trigger: trigger.type || null,
            triggerDetail: safe(trigger),
            action: action.type || null,
            from: {
              id: entry.nodeId,
              name: entry.nodeName,
              page: entry.page,
            },
            to: action.destinationId
              ? {
                  id: action.destinationId,
                  name: dest ? dest.name : null,
                  type: dest ? dest.type : null,
                  page: dest ? dest.page : null,
                }
              : null,
            navigation: action.navigation || null,
            transition: action.transition ? safe(action.transition) : null,
            overlay: action.overlayRelativePosition
              ? safe(action.overlayRelativePosition)
              : null,
            url: action.url || null,
          });
        }
      }
      return {
        from: {
          id: entry.nodeId,
          name: entry.nodeName,
          page: entry.page,
        },
        transitions,
      };
    })
    .filter((item) => item.transitions.length > 0);

  return {
    file: figma.root.name,
    generatedAt: new Date().toISOString(),
    summary: {
      pages: figma.root.children.length,
      nodesScanned: nodes.size,
      flows: flowStartingPoints.length,
      nodesWithReactions: raw.length,
      reactions: reactionCount,
      transitions: graph.reduce((total, item) => total + item.transitions.length, 0),
    },
    flowStartingPoints,
    graph,
    allReactions: raw,
  };
}

collect()
  .then((payload) => {
    const json = JSON.stringify(payload, null, 2);
    figma.showUI(UI_HTML, { width: 780, height: 640 });
    figma.ui.postMessage({
      type: 'data',
      json,
      stat: `${payload.summary.reactions} reactions · ${payload.summary.transitions} transisi · ${payload.summary.flows} flow`,
    });
    figma.ui.onmessage = (msg) => {
      if (msg && msg.type === 'copied') {
        figma.notify('JSON tersalin ke clipboard.');
      }
    };
  })
  .catch((err) => {
    figma.notify(
      'Gagal mengekspor: ' + (err && err.message ? err.message : String(err)),
      { error: true },
    );
    figma.closePlugin();
  });
