(() => {
  const identifier = 'html-review-bookmarklet-v1';
  const current = document.getElementById(identifier);
  if (current) {
    current.shadowRoot.querySelector('button').focus();
    return;
  }

  const host = document.createElement('div');
  host.id = identifier;
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:0 0 auto auto!important;z-index:2147483647!important';
  const ui = host.attachShadow({ mode: 'open' });
  ui.innerHTML = `
    <style>
      *{box-sizing:border-box} section{margin:12px;width:min(272px,max(160px,calc(100vw - var(--editor-reserved,0px) - 24px)));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#141414;border:1px solid #d4d4d4;border-radius:12px;box-shadow:0 12px 35px #0002;padding:10px;font:13px/1.45 system-ui,sans-serif}
      header,.row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:5px} header{cursor:grab;touch-action:none;user-select:none;justify-content:space-between} strong{font-size:15px}
      button,select,textarea,input{font:inherit} button,select{background:#fff;border:1px solid #d4d4d4;border-radius:6px;color:inherit;padding:3px 6px} button{cursor:pointer} button:hover{background:#eee}
      button[aria-pressed=true]{background:#111;color:#fff} textarea{display:block;width:100%;border:1px solid #aaa;border-radius:6px;padding:7px;margin:8px 0;resize:vertical}
      p{margin:8px 0;overflow-wrap:anywhere} article{border-top:1px solid #d4d4d4;padding-top:8px;margin-top:8px} [hidden]{display:none!important} #status{color:#444} #target{color:#444;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      #sidebar{position:fixed;inset:0 0 0 auto;width:var(--editor-sidebar,300px);background:#fafafa;border-left:1px solid #d4d4d4;color:#141414;font:14px/1.5 system-ui,sans-serif;display:flex;flex-direction:column;padding:14px}
      #sidebarTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
      #sidebarTop,#noteSlot{position:relative;z-index:1;background:#fafafa} #noteSlot:empty{display:none}
      #entries{position:absolute;inset:0;overflow:hidden;pointer-events:none}
      .note-card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px;margin:0;overflow:auto;max-height:152px;pointer-events:auto}
      #entries .note-card{position:absolute;inset:0 10px auto;visibility:hidden;background:transparent;border:0;border-left:1px solid #aaa;border-radius:0}
      #entries .note-card[aria-current=true]{background:#fff;border-left:2px solid #555}
      #entries .note-card blockquote{display:none}
      #entries .note-card[data-visible]{visibility:visible}
      .note-card[aria-current=true]{border-color:#555} .note-card blockquote{margin:4px 0 0;border-left:2px solid #aaa;padding-left:8px;color:#555;overflow-wrap:anywhere}
      .note-card time{color:#555;font-size:12px;margin-left:8px} .note-card p{white-space:pre-wrap;margin:5px 0} .note-card .row{margin-bottom:0}
      #leaders span{position:fixed;top:0;left:0;border-top:1px dashed #777;pointer-events:none}
      #leaders span:nth-child(2){border-top:0;border-left:1px dashed #777}
      #leaders{position:fixed;inset:0;pointer-events:none;z-index:1}
      #window{z-index:2} #sidebarTop,#noteSlot{z-index:2}
      #unlinked{position:relative;z-index:2;background:#fafafa;max-height:35vh;overflow:auto} #unlinked article{margin:4px 0}
      #resize{position:absolute;inset:0 auto 0 -5px;width:10px;cursor:ew-resize;touch-action:none} #resize:hover,#resize:focus-visible{background:#7778}
      #window{position:relative} #outline span{position:fixed;pointer-events:none;border:2px solid #333;border-radius:5px} #fields{max-height:38vh;overflow:auto} #window details{margin:6px 0} #window summary{cursor:pointer} #window details .row{margin-top:8px}
      #more{padding-block:5px;border-block:1px solid #ddd;margin-bottom:5px}.format-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(36px,1fr));gap:4px;margin-bottom:5px}.format-label{font-size:12px;font-weight:650;margin:0 0 5px}
      #more .format-grid > :is(button,select,.split-color){width:100%;min-width:0;height:26px;margin:0}
      #more .format-grid > :is(button,select){padding:0 2px;line-height:1}
      #more select{appearance:none;padding-right:9px;text-align:center;background:#fff linear-gradient(45deg,transparent 50%,#444 0) calc(100% - 4px) 11px/4px 4px no-repeat;cursor:pointer}
      #more .split-color button{flex:1;min-width:0;padding:1px 4px}
      #more .pick-color{flex:0 0 13px}
      #status:empty{display:none}
      .split-color{display:inline-flex;border:1px solid #d4d4d4;border-radius:6px;align-items:stretch}
      .split-color button{border:0;border-radius:5px 0 0 5px;min-width:26px;line-height:1.15}
      .split-color button::after{content:'';display:block;height:3px;border-radius:2px;background:var(--ink);margin-top:2px}
      .pick-color{position:relative;display:grid;place-items:center;width:17px;border-left:1px solid #ddd;cursor:pointer}
      .pick-color input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
      .pick-color:focus-within{outline:2px solid #333} #underline{text-decoration:underline}
    </style>
    <aside id="sidebar" aria-label="批注栏" hidden>
      <div id="resize" role="separator" tabindex="0" aria-label="调整批注栏宽度" aria-orientation="vertical"></div>
      <div id="sidebarTop"><strong>批注</strong><button id="hideNotes" aria-label="隐藏批注">隐藏</button></div>
      <div id="noteSlot"></div><div id="entries"></div>
      <details id="unlinked" hidden><summary>无法定位的批注</summary><div id="unlinkedEntries"></div></details>
    </aside><div id="leaders" aria-hidden="true" hidden></div><div id="outline" hidden></div>
    <section id="window" aria-label="Editor">
      <header title="拖动工具窗"><strong>Editor</strong><span aria-hidden="true">⠿</span></header>
      <div class="row"><button id="start" aria-pressed="false">开始</button><button id="undo">撤销</button><button id="html">保存</button><button id="saveAs">另存为</button><button id="close">关闭</button></div>
      <div id="panel">
        <div id="controls" hidden>
        <p id="target">划选文字，或点击标签、图片和内容块。</p>
        <div id="actions" class="row" hidden><button id="blockEdit">编辑</button><button id="image" hidden>换图</button><button id="note" aria-controls="sidebar">批注</button></div>
        <div id="more" hidden>
          <p class="format-label">文字</p>
          <div id="textFormat">          <div class="format-grid"><button id="bold" aria-label="粗体" title="粗体"><b>B</b></button>
              <button id="italic" aria-label="斜体" title="斜体"><i>I</i></button>
              <button id="underline" aria-label="添加下划线" title="添加下划线">U</button>
              <button id="strike" aria-label="删除线" title="删除线"><s>S</s></button>
              <button id="sup" aria-label="上标" title="上标">x²</button>
              <button id="sub" aria-label="下标" title="下标">x₂</button>
              <select id="font" aria-label="字体" title="字体"><option value="">Aa</option><option value="serif">衬线</option><option value="sans-serif">无衬线</option><option value="monospace">等宽</option><option value="SimSun, serif">宋体</option><option value="Microsoft YaHei, sans-serif">微软雅黑</option></select>
              <select id="size" aria-label="字号" title="字号"><option value="">A↕</option><option>14px</option><option>18px</option><option>24px</option><option>32px</option></select>
              <select id="letterSpacing" aria-label="字距" title="字距"><option value="">A↔</option><option value="normal">标准</option><option value=".06em">加宽</option><option value="-.03em">收紧</option></select>
              <div class="split-color" style="--ink:#fff176"><button id="markText" type="button" aria-label="应用高亮" title="应用高亮">✎</button><label class="pick-color">⌄<input id="markColor" type="color" value="#fff176" aria-label="选择高亮颜色"></label></div><div class="split-color" style="--ink:#1d4ed8"><button id="paintText" type="button" aria-label="应用字体颜色" title="应用字体颜色">A</button><label class="pick-color">⌄<input id="fontColor" type="color" value="#1d4ed8" aria-label="选择字体颜色"></label></div></div>
</div>
          <p class="format-label">段落</p>
          <div id="paragraphFormat">          <div class="format-grid"><select id="align" aria-label="对齐" title="对齐"><option value="">≡</option><option value="left">左对齐</option><option value="center">居中</option><option value="right">右对齐</option></select>
              <button id="justify" aria-label="两端对齐" title="两端对齐">▤</button>
              <select id="lineHeight" aria-label="行距" title="行距"><option value="">↕≡</option><option value="1">单倍</option><option value="1.5">1.5 倍</option><option value="2">双倍</option></select>
              <select id="indent" aria-label="段落首行缩进" title="段落首行缩进"><option value="">⇥</option><option value="0">无缩进</option><option value="1em">1 字符</option><option value="2em">2 字符</option></select>
              <button id="bullets" aria-label="项目符号" title="项目符号">•≡</button>
              <div class="split-color" style="--ink:#eee"><button id="shadeText" type="button" aria-label="应用段落底色" title="应用段落底色">▧</button><label class="pick-color">⌄<input id="shadeColor" type="color" value="#eeeeee" aria-label="选择段落底色" title="选择段落底色"></label></div></div>
            <div id="blockRow" class="row" aria-label="区块操作"><button id="insert">添加区块</button>
              <button id="blockDelete" hidden>删除区块</button>
              <button id="up" title="上移区块" aria-label="上移区块">↑</button>
              <button id="down" title="下移区块" aria-label="下移区块">↓</button></div></div>
        </div>
        <div id="formSlot"><form hidden><label id="field"></label><select id="insertType" aria-label="区块类型" hidden><option value="p">段落</option><option value="h2">标题</option><option value="h3">小标题</option></select><textarea rows="3" aria-labelledby="field"></textarea><div id="fields" hidden></div><div class="row"><button type="submit">确认</button><button type="button" id="cancel">取消</button></div></form></div>
        <input id="imageFile" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/avif" hidden>
        </div>
        <button id="backup" hidden>下载上次保存前的备份</button>
        <p id="status" role="status"></p>
      </div>
    </section>`;
  document.documentElement.append(host);
  const get = (id) => ui.getElementById(id);
  const report = (message) => { get('status').textContent = message; };
  const controller = new AbortController();
  const events = { capture: true, signal: controller.signal };
  const storageKey = 'html-review-v1:' + location.href.split('#')[0];
  const notesAttribute = 'data-11-html-editor-notes';
  const history = [];
  const blocks = 'p,h1,h2,h3,h4,h5,h6,li,ul,ol,blockquote,figcaption,figure,article,section,header,footer,aside,div,td,th,span';
  const textBlocks = 'p,h1,h2,h3,h4,h5,h6,li,blockquote,figcaption,td,th';
  const selectionName = identifier + '-selection';
  const highlightStyle = document.createElement('style');
  const commentName = identifier + '-comment';
  const activeCommentName = identifier + '-comment-active';
  highlightStyle.textContent = `::highlight(${selectionName}){background:#ddd;color:#141414}::highlight(${commentName}){background:#e8e8e8}::highlight(${activeCommentName}){background:#c9c9c9}`;
  host.before(highlightStyle);
  let active = false;
  let commentsVisible = false;
  let selectedNote;
  let sidebarWidth = 300;
  let saving = false;
  const sessionKey = Symbol.for('11-html-editor-file-session');
  const fileSession = window[sessionKey] ??= {};
  let legacyNotes = false;
  let frame;
  let target;
  let draft;
  let inline;
  let entries = [];
  const noteViews = new Map();
  let visibleNotes = [];
  try {
    const embedded = document.head.querySelector('template[' + notesAttribute + ']');
    const legacy = embedded ? null : localStorage.getItem(storageKey);
    const saved = JSON.parse(embedded?.content.textContent ?? legacy ?? '[]');
    if (Array.isArray(saved)) entries = saved;
    legacyNotes = legacy !== null && entries.length > 0;
  } catch {
    report('浏览器存储不可读，仍可导出建议。');
  }

  function locate(element) {
    if (element === document.body) return 'body';
    if (element.id && document.querySelectorAll('#' + CSS.escape(element.id)).length === 1) {
      return '#' + CSS.escape(element.id);
    }
    const index = [...element.parentElement.children].indexOf(element) + 1;
    return locate(element.parentElement) + ' > :nth-child(' + index + ')';
  }

  function selector(element) {
    return element === document.body ? 'body' : locate(element);
  }

  function fingerprint(element) {
    return {
      selector: selector(element),
      tag: element.localName,
      sample: element.textContent.trim().slice(0, 100)
    };
  }

  function rangeAt(element, start, end) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let offset = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = offset + node.length;
      if (next > start && offset < end) {
        nodes.push({ node, from: Math.max(0, start - offset), to: Math.min(node.length, end - offset) });
      }
      offset = next;
    }
    if (nodes.length === 0) throw new Error('找不到原文选区。');
    const range = new Range();
    range.setStart(nodes[0].node, nodes[0].from);
    range.setEnd(nodes.at(-1).node, nodes.at(-1).to);
    return { range, nodes };
  }

  function resolve(anchor) {
    const element = document.querySelector(anchor.selector);
    if (element?.localName !== anchor.tag) throw new Error('找不到目标元素，请重新选择。');
    if (!anchor.exact) {
      if (element.textContent.trim().slice(0, 100) !== anchor.sample) throw new Error('目标内容已变更，请重新选择。');
      if (anchor.source !== undefined && element.getAttribute('src') !== anchor.source) throw new Error('原图已变更，请重新选择。');
      return { element };
    }
    const content = element.textContent;
    const matches = [];
    for (let start = content.indexOf(anchor.exact); start !== -1; start = content.indexOf(anchor.exact, start + 1)) {
      const end = start + anchor.exact.length;
      if (content.slice(0, start).endsWith(anchor.prefix) && content.slice(end).startsWith(anchor.suffix)) {
        matches.push(start);
      }
    }
    if (matches.length !== 1) throw new Error('原文已变更或有多个匹配，请重新选择。');
    return { element, ...rangeAt(element, matches[0], matches[0] + anchor.exact.length) };
  }

  function selectedBlocks() {
    const anchor = requireTarget();
    return (anchor.group || [anchor]).map((item) => resolve(item).element);
  }

  function scheduleMarks() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(drawMarks);
  }

  function drawMarks() {
    const outline = get('outline');
    outline.replaceChildren();
    outline.hidden = true;
    if (target && !target.exact) {
      try {
        for (const element of selectedBlocks()) {
          const { left, top, width, height } = element.getBoundingClientRect();
          const mark = document.createElement('span');
          Object.assign(mark.style, { left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px' });
          outline.append(mark);
        }
        outline.hidden = false;
      } catch {
        // The target may have been removed by the surrounding page.
      }
    }
    positionNotes();
  }

  function positionNotes() {
    CSS.highlights?.delete(commentName);
    CSS.highlights?.delete(activeCommentName);
    visibleNotes = [];
    if (!commentsVisible) return;
    const sidebar = get('sidebar').getBoundingClientRect();
    const headerBottom = Math.max(get('sidebarTop').getBoundingClientRect().bottom, get('noteSlot').getBoundingClientRect().bottom);
    const positioned = [];
    const orphanList = get('unlinkedEntries');
    for (const [entry, view] of noteViews) {
      view.line.hidden = true;
      view.card.removeAttribute('data-visible');
      try {
        const { element, range } = resolve(entry.anchor);
        if (view.card.parentNode !== get('entries')) get('entries').append(view.card);
        const fragments = Array.from(range?.getClientRects() ?? element.getClientRects());
        if (!fragments.length) continue;
        const start = fragments[0];
        const end = fragments.at(-1);
        positioned.push({ entry, view, range, fragments, start, end, height: view.card.offsetHeight });
      } catch {
        if (view.card.parentNode !== orphanList) orphanList.append(view.card);
      }
    }
    get('unlinked').hidden = !orphanList.children.length;
    positioned.sort((first, second) => first.end.bottom - second.end.bottom || first.end.right - second.end.right);
    let previousBottom = -Infinity;
    const highlights = [];
    for (const { entry, view, range, fragments, start, end, height } of positioned) {
      // Pack all anchors in document order, including off-screen ones, so a
      // card does not jump when another anchor crosses the viewport boundary.
      const anchorY = range ? end.bottom + 1 : start.top;
      const top = Math.max(anchorY - 8, previousBottom + 6);
      previousBottom = top + height;
      view.card.style.transform = 'translateY(' + top + 'px)';
      if (end.bottom <= 0 || start.top >= innerHeight) continue;
      if (range) highlights.push(range);
      visibleNotes.push({ entry, fragments });
      if (top + height <= headerBottom || top >= innerHeight) continue;
      view.card.setAttribute('data-visible', '');
      view.card.setAttribute('aria-current', String(entry === selectedNote));
      if (range && entry === selectedNote && CSS.highlights) {
        const highlight = new Highlight(range);
        highlight.priority = 1;
        CSS.highlights.set(activeCommentName, highlight);
      }
      if (anchorY < 0 || anchorY >= innerHeight) continue;
      const targetX = sidebar.left + 10;
      const gutterX = sidebar.left + 4;
      const sourceX = Math.min(end.right, sidebar.left - 3);
      const fromX = range ? Math.max(0, sourceX) : Math.max(sidebar.left - 16, sourceX);
      const fromY = anchorY;
      const cardTop = Math.max(headerBottom + 2, top + 8);
      const cardBottom = Math.min(innerHeight - 1, top + height - 8);
      const toY = Math.max(cardTop, Math.min(fromY, cardBottom));
      const [lead, turn, tail] = view.line.children;
      lead.style.width = gutterX - fromX + 'px';
      lead.style.transform = 'translate(' + fromX + 'px,' + fromY + 'px)';
      turn.style.height = Math.abs(toY - fromY) + 'px';
      turn.style.transform = 'translate(' + gutterX + 'px,' + Math.min(fromY, toY) + 'px)';
      tail.style.width = targetX - gutterX + 'px';
      tail.style.transform = 'translate(' + gutterX + 'px,' + toY + 'px)';
      view.line.hidden = false;
    }
    if (CSS.highlights && highlights.length) CSS.highlights.set(commentName, new Highlight(...highlights));
  }

  function setTarget(anchor) {
    target = anchor;
    get('target').textContent = anchor?.group ? '已选中 ' + anchor.group.length + ' 个区块' : anchor
      ? (anchor.exact || anchor.sample || '<' + anchor.tag + '>').slice(0, 120) : '划选文字，或按 Ctrl 点击多选区块。';
    get('actions').hidden = !anchor;
    const paragraph = anchor && !anchor.exact && /^(p|h[1-6]|li|blockquote|figcaption)$/.test(anchor.tag);
    get('more').hidden = true;
    get('blockRow').hidden = !paragraph && !anchor?.group;
    get('blockDelete').hidden = !paragraph && !anchor?.group;
    get('up').hidden = get('down').hidden = Boolean(anchor?.group);
    get('note').hidden = Boolean(anchor?.group);
    get('image').hidden = anchor?.tag !== 'img' || Boolean(anchor.group);
    get('blockEdit').hidden = anchor?.tag === 'img' && !anchor.group;
    CSS.highlights?.delete(selectionName);
    scheduleMarks();
    if (!anchor?.exact || !CSS.highlights) return;
    try {
      CSS.highlights.set(selectionName, new Highlight(resolve(anchor).range));
    } catch {
      // Stale selections are reported when the user tries to act.
    }
  }

  function captureSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    const common = range.commonAncestorContainer;
    const element = (common.nodeType === Node.ELEMENT_NODE ? common : common.parentElement).closest(textBlocks + ',a,button,label,div');
    if (!element || !document.body.contains(element) || element.isContentEditable || element.querySelector('script,style,textarea')) return false;
    const before = new Range();
    before.selectNodeContents(element);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const exact = range.toString();
    if (!exact.trim()) return false;
    const content = element.textContent;
    setTarget({ ...fingerprint(element), exact, prefix: content.slice(Math.max(0, start - 24), start), suffix: content.slice(start + exact.length, start + exact.length + 24) });
    return true;
  }

  function apply(change) {
    const { element, nodes } = resolve(change.anchor);
    if (change.kind === 'text') {
      const previous = nodes.map(({ node }) => node.data);
      nodes.forEach(({ node, from, to }, index) => {
        node.replaceData(from, to - from, index === 0 ? change.value : '');
      });
      return () => nodes.forEach(({ node }, index) => { node.data = previous[index]; });
    }
    if (change.kind === 'image') {
      const attributes = [element, ...element.closest('picture')?.querySelectorAll('source') || []]
        .flatMap((node) => ['src', 'srcset', 'sizes'].map((name) => ({ node, name, value: node.getAttribute(name) })));
      for (const { node, name } of attributes) node.removeAttribute(name);
      element.setAttribute('src', change.value);
      return () => {
        for (const { node, name, value } of attributes) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
      };
    }
    if (change.kind === 'style') {
      if (nodes && change.property !== 'text-align') {
        const restore = nodes.map(({ node, from, to }) => {
          const original = node.data;
          const parent = node.parentElement;
          if (from === 0 && to === node.length && parent.matches('span') && parent.childNodes.length === 1 && parent.style.getPropertyValue(change.property) && change.property !== 'text-decoration-line') {
            const oldStyle = parent.getAttribute('style');
            parent.style.setProperty(change.property, change.value);
            return () => parent.setAttribute('style', oldStyle);
          }
          const span = document.createElement('span');
          span.style.setProperty(change.property, change.value);
          if (change.property === 'vertical-align') span.style.fontSize = '0.75em';
          span.textContent = original.slice(from, to);
          const tail = document.createTextNode(original.slice(to));
          node.data = original.slice(0, from);
          node.after(span, tail);
          return () => {
            span.remove();
            tail.remove();
            node.data = original;
          };
        });
        return () => restore.forEach((revert) => revert());
      }
      const original = element.getAttribute('style');
      element.style.setProperty(change.property, change.value);
      return () => original === null ? element.removeAttribute('style') : element.setAttribute('style', original);
    }
    const neighbor = resolve(change.neighbor).element;
    if (change.direction === 'up' ? element.previousElementSibling !== neighbor : element.nextElementSibling !== neighbor) {
      throw new Error('区块顺序已变更，请重新选择。');
    }
    const parent = element.parentNode;
    const next = element.nextSibling;
    if (change.direction === 'up') neighbor.before(element);
    else neighbor.after(element);
    return () => parent.insertBefore(element, next);
  }

  function attempt(action) {
    try {
      action();
    } catch (error) {
      report(error.message);
    }
  }

  function submit(change) {
    if (change.kind === 'note') {
      const entry = { ...change, id: Date.now() + '-' + Math.random().toString(36).slice(2), createdAt: new Date().toISOString() };
      entries.push(entry);
      history.push(() => entries.splice(entries.indexOf(entry), 1));
      selectedNote = entry;
      showComments(true);
      report('已添加批注，保存后写入文件。');
      renderEntries();
    } else {
      history.push(apply(change));
      report('已修改当前页面，可保存。');
    }
    setTarget(undefined);
  }

  function renderEntries() {
    scheduleMarks();
    const list = get('entries');
    list.replaceChildren();
    get('unlinkedEntries').replaceChildren();
    get('unlinked').hidden = true;
    const leaders = get('leaders');
    leaders.replaceChildren();
    noteViews.clear();
    const labels = { text: '文字修订', image: '换图', style: '样式', move: '排序', note: '批注' };
    for (const entry of entries) {
      const card = document.createElement('article');
      card.className = 'note-card';
      const line = document.createElement('div');
      line.append(document.createElement('span'), document.createElement('span'), document.createElement('span'));
      line.hidden = true;
      leaders.append(line);
      noteViews.set(entry, { card, line });
      card.setAttribute('aria-current', String(entry === selectedNote));
      const title = document.createElement('strong');
      title.textContent = labels[entry.kind];
      const summary = document.createElement('p');
      const detail = entry.kind === 'image' ? entry.filename : entry.kind === 'move'
        ? (entry.direction === 'up' ? '移到前一个区块前' : '移到后一个区块后')
        : entry.value || '删除选中文字';
      const quote = document.createElement('blockquote');
      quote.textContent = entry.anchor.exact || entry.anchor.sample || entry.anchor.tag;
      summary.textContent = detail;
      const time = document.createElement('time');
      if (entry.createdAt) time.textContent = new Date(entry.createdAt).toLocaleString('zh-CN');
      const actions = document.createElement('div');
      actions.className = 'row';
      function button(label, action) {
        const item = document.createElement('button');
        item.textContent = label;
        item.onclick = () => attempt(action);
        actions.append(item);
      }
      button('定位', () => {
        resolve(entry.anchor).element.scrollIntoView({ block: 'center' });
        selectedNote = entry;
        scheduleMarks();
        report('已定位。');
      });
      if (entry.kind !== 'note') {
        button('接受', () => {
          const revert = apply(entry);
          const index = entries.indexOf(entry);
          history.push(() => {
            revert();
            entries.splice(index, 0, entry);
          });
          entries.splice(index, 1);
          setTarget(undefined);
          report('已接受修改，保存后写入文件。');
          renderEntries();
        });
      }
      button('移除', () => {
        const index = entries.indexOf(entry);
        entries.splice(index, 1);
        history.push(() => entries.splice(index, 0, entry));
        if (selectedNote === entry) selectedNote = undefined;
        report('已移除，保存后写入文件。');
        renderEntries();
      });
      card.append(title, time, quote, summary, actions);
      list.append(card);
    }
  }

  function requireTarget() {
    if (!target) throw new Error('请先划选文字或点击页面元素。');
    return target;
  }

  function openDraft(kind, label, value, anchor) {
    if (draftChanged()) throw new Error('请先确认或取消当前输入。');
    get('fields').replaceChildren();
    get('insertType').hidden = kind !== 'insert' || anchor?.tag === 'li';
    draft = { kind, anchor };
    get('field').textContent = label;
    const form = ui.querySelector('form');
    get(kind === 'note' ? 'noteSlot' : 'formSlot').append(form);
    const input = form.querySelector('textarea');
    input.hidden = false;
    get('fields').hidden = true;
    form.hidden = false;
    input.value = value;
    input.focus();
    input.select();
  }

  function downloadBackup(content) {
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = (document.title.trim().replace(/[<>:"/\\|?*]/g, '_').slice(0, 80) || 'page') + '-保存前备份.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function finishInline(cancel = false) {
    if (!inline) return;
    const { element, node, original } = inline;
    inline = undefined;
    const value = cancel ? original : element.innerText;
    element.removeAttribute('contenteditable');
    node.data = value;
    element.replaceChildren(node);
    if (!cancel && value !== original) history.push(() => { node.data = original; });
  }

  document.addEventListener('pointerup', (event) => {
    if (active && !event.ctrlKey && !draftChanged() && !event.composedPath().includes(host) && !inline) captureSelection();
  }, events);
  document.addEventListener('click', (event) => {
    if (event.composedPath().includes(host)) return;
    if (commentsVisible && !event.ctrlKey && !event.altKey && !window.getSelection()?.toString()) {
      const hit = visibleNotes.find(({ fragments }) => fragments.some((rect) =>
        event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom));
      if (hit) {
        selectedNote = hit.entry;
        scheduleMarks();
      }
    }
    if (!active) return;
    if (inline?.element.contains(event.target)) return;
    const element = event.target.closest?.('img,button,a,input,select,summary,' + blocks);
    if (!element || !document.body.contains(element)) return;
    if (!event.altKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.altKey) return;
    if (draftChanged()) {
      report('请先确认或取消当前输入。');
      return;
    }
    if (!event.ctrlKey && captureSelection()) return;
    finishInline();
    get('cancel').click();
    const clicked = { ...fingerprint(element), ...(element.localName === 'img' ? { source: element.getAttribute('src') } : {}) };
    if (!event.ctrlKey) {
      setTarget(clicked);
      return;
    }
    window.getSelection()?.removeAllRanges();
    const existing = target && !target.exact ? selectedBlocks() : [];
    const next = existing.includes(element) ? existing.filter((item) => item !== element)
      : [...existing.filter((item) => !item.contains(element) && !element.contains(item)), element];
    next.sort((first, second) => first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    const group = next.map((item) => item === element ? clicked : fingerprint(item));
    setTarget(group.length > 1 ? { ...group[0], group } : group[0]);
  }, events);
  document.addEventListener('dblclick', (event) => {
    if (!active || event.ctrlKey || event.composedPath().includes(host)) return;
    const element = event.target.closest?.(textBlocks);
    if (!element || element.isContentEditable || element.childNodes.length !== 1 || element.firstChild.nodeType !== Node.TEXT_NODE) return;
    const node = element.firstChild;
    const original = node.data;
    // Keep a single text node so the page's structure and listeners survive.
    inline = { element, node, original };
    element.contentEditable = 'plaintext-only';
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    report('可直接输入，回车完成，Esc 取消。');
  }, events);
  document.addEventListener('focusout', (event) => {
    if (event.target === inline?.element) finishInline();
  }, events);
  document.addEventListener('keydown', (event) => {
    if (!inline || event.isComposing || !['Escape', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    finishInline(event.key === 'Escape');
    setTarget(undefined);
    report(event.key === 'Escape' ? '已取消。' : '已完成，可保存。');
  }, events);

  function style(property, value, paragraph = false) {
    const anchor = requireTarget();
    if (property === 'vertical-align' && !anchor.exact) throw new Error('请先划选要设为上标或下标的文字。');
    const anchors = paragraph || property === 'text-align'
      ? [...new Set(selectedBlocks().map((block) => block.closest(textBlocks) || block))].map(fingerprint)
      : anchor.group || [anchor];
    anchors.forEach(resolve);
    const restore = anchors.map((item) => apply({ kind: 'style', anchor: item, property, value }));
    history.push(() => restore.toReversed().forEach((revert) => revert()));
    CSS.highlights?.delete(selectionName);
    window.getSelection()?.removeAllRanges();
    report('已应用格式，可撤销。');
  }

  function listStyle(tag) {
    if (draftChanged()) throw new Error('请先确认或取消当前输入。');
    const selected = selectedBlocks();
    const lists = [...new Set(selected.map((element) => element.closest('ul,ol')))];
    if (lists.length === 1 && lists[0]) {
      const original = lists[0];
      if (original.localName === tag) return report('已使用该列表样式。');
      const list = document.createElement(tag);
      for (const attr of original.attributes) {
        if (!['start', 'reversed', 'type'].includes(attr.name)) list.setAttribute(attr.name, attr.value);
      }
      list.append(...original.childNodes);
      original.replaceWith(list);
      history.push(() => {
        original.append(...list.childNodes);
        list.replaceWith(original);
      });
    } else {
      const paragraphs = [...new Set(selected.map((element) => element.closest('p')))];
      if (lists.some(Boolean) || paragraphs.some((element, index) => !element || (index > 0 && paragraphs[index - 1].nextElementSibling !== element))) {
        throw new Error('请选择同一组相邻段落，或现有列表中的一项。');
      }
      const list = document.createElement(tag);
      const positions = paragraphs.map((node) => ({ node, parent: node.parentNode, next: node.nextSibling }));
      paragraphs[0].before(list);
      for (const paragraph of paragraphs) {
        const item = document.createElement('li');
        item.append(paragraph);
        list.append(item);
      }
      history.push(() => {
        for (const { node, parent, next } of positions.toReversed()) parent.insertBefore(node, next);
        list.remove();
      });
    }
    get('cancel').click();
    setTarget(undefined);
    report('已更新列表，可撤销。');
  }

  function move(direction) {
    if (draftChanged()) throw new Error('请先确认或取消当前输入。');
    const anchor = requireTarget();
    const { element } = resolve(anchor);
    if (!element.matches(blocks) || element.parentElement === document.body && element.matches('header,footer')) throw new Error('请选择可移动的段落或区块。');
    const neighbor = direction === 'up' ? element.previousElementSibling : element.nextElementSibling;
    if (!neighbor?.matches(blocks)) throw new Error('相邻位置没有可交换的区块。');
    submit({ kind: 'move', anchor: fingerprint(element), direction, neighbor: fingerprint(neighbor) });
  }

  get('blockEdit').onclick = () => attempt(() => {
    const anchor = requireTarget();
    get('more').hidden = false;
    if (anchor.exact) {
      openDraft('text', '编辑所选文字', anchor.exact, anchor);
      return;
    }
    const nodes = [];
    for (const element of selectedBlocks()) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => node.data.trim() && !node.parentElement.closest('script,style,textarea,select,[hidden]') && node.parentElement.getClientRects().length
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      });
      for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);
    }
    if (!nodes.length) throw new Error('这个区块没有可编辑文字。');
    if (nodes.length > 60) throw new Error('区块包含太多文字，请选择更小的区块。');
    openDraft('block', '区块文字', '', target);
    const fields = get('fields');
    ui.querySelector('textarea').hidden = true;
    fields.hidden = false;
    draft.nodes = nodes.map((node, index) => {
      const input = document.createElement('textarea');
      input.rows = 2;
      input.setAttribute('aria-label', '区块文字 ' + (index + 1));
      input.value = node.data;
      fields.append(input);
      return { node, original: node.data, input };
    });
    draft.nodes[0].input.focus();
  });
  get('insert').onclick = () => attempt(() => {
    let anchor;
    if (target) {
      let element = selectedBlocks().at(-1);
      while (element !== document.body && !element.matches('li') &&
             !element.parentElement.matches('body,main,section,article,header,footer,aside,div,blockquote,td,th,details')) {
        element = element.parentElement;
      }
      if (element !== document.body) anchor = fingerprint(element);
    }
    openDraft('insert', anchor ? '在所选区块后添加' : '在正文末尾添加', '', anchor);
    get('insertType').value = 'p';
    get('more').hidden = true;
  });
  get('blockDelete').onclick = () => attempt(() => {
    if (draftChanged()) throw new Error('请先确认或取消当前输入。');
    const blocksToRemove = selectedBlocks();
    get('cancel').click();
    const positions = blocksToRemove.map((node) => ({ node, parent: node.parentNode, next: node.nextSibling }));
    blocksToRemove.forEach((node) => node.remove());
    history.push(() => {
      for (const { node, parent, next } of positions.toReversed()) {
        parent.insertBefore(node, next?.parentNode === parent ? next : null);
      }
    });
    setTarget(undefined);
    report('区块已删除，可撤销。保存后写入原文件。');
  });
  const pageMargin = getComputedStyle(document.body).marginRight;
  const baseHighlightStyle = highlightStyle.textContent;
  const handle = ui.querySelector('header');
  const panel = get('window');
  let position;
  let drag;
  let dragFrame;
  let resizing;
  const widthLimit = () => Math.floor(innerWidth * 0.45);
  const minimumWidth = () => Math.min(210, widthLimit());

  function positionWindow(left, top, width, height) {
    const space = innerWidth - (commentsVisible ? sidebarWidth : 0);
    position = {
      left: Math.max(0, Math.min(left, space - width)),
      top: Math.max(0, Math.min(top, innerHeight - height))
    };
    panel.style.transform = 'translate3d(' + position.left + 'px,' + position.top + 'px,0)';
  }

  function fitWindow() {
    const { width, height } = host.getBoundingClientRect();
    positionWindow(position?.left ?? innerWidth, position?.top ?? 0, width, height);
  }

  function layoutSidebar() {
    sidebarWidth = Math.min(widthLimit(), Math.max(minimumWidth(), sidebarWidth));
    host.style.setProperty('--editor-sidebar', sidebarWidth + 'px');
    host.style.setProperty('--editor-reserved', (commentsVisible ? sidebarWidth : 0) + 'px');
    highlightStyle.textContent = baseHighlightStyle + (commentsVisible
      ? 'body{margin-right:calc(' + pageMargin + ' + ' + sidebarWidth + 'px)!important}'
      : '');
    const grip = get('resize');
    grip.setAttribute('aria-valuemin', String(minimumWidth()));
    grip.setAttribute('aria-valuemax', String(widthLimit()));
    grip.setAttribute('aria-valuenow', String(sidebarWidth));
    fitWindow();
    scheduleMarks();
  }

  function showComments(visible) {
    commentsVisible = visible;
    get('sidebar').hidden = !visible;
    get('leaders').hidden = !visible;
    get('note').setAttribute('aria-expanded', String(visible));
    layoutSidebar();
  }
  get('hideNotes').onclick = () => {
    if (draft?.kind === 'note') {
      if (draftChanged()) {
        ui.querySelector('textarea').focus();
        report('请先确认或取消当前批注。');
        return;
      }
      get('cancel').click();
    }
    showComments(false);
    get(active && target ? 'note' : 'start').focus({ preventScroll: true });
  };
  const grip = get('resize');
  grip.onpointerdown = (event) => {
    if (event.button !== 0) return;
    resizing = { id: event.pointerId, x: event.clientX, width: sidebarWidth };
    grip.setPointerCapture(event.pointerId);
  };
  grip.onpointermove = (event) => {
    if (resizing?.id !== event.pointerId) return;
    sidebarWidth = resizing.width + resizing.x - event.clientX;
    layoutSidebar();
  };
  grip.onlostpointercapture = () => { resizing = undefined; };
  grip.onkeydown = (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    sidebarWidth += event.key === 'ArrowLeft' ? 20 : -20;
    layoutSidebar();
  };

  host.style.setProperty('inset', '0 auto auto 0', 'important');
  handle.onpointerdown = (event) => {
    if (event.button !== 0) return;
    const { width, height } = host.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX - position.left, y: event.clientY - position.top, width, height };
    handle.setPointerCapture(event.pointerId);
  };
  handle.onpointermove = (event) => {
    if (drag?.id !== event.pointerId) return;
    const { x, y, width, height } = drag;
    cancelAnimationFrame(dragFrame);
    dragFrame = requestAnimationFrame(() => positionWindow(event.clientX - x, event.clientY - y, width, height));
  };
  handle.onlostpointercapture = () => { drag = undefined; };
  window.addEventListener('scroll', scheduleMarks, events);
  window.addEventListener('resize', layoutSidebar, events);
  const panelObserver = new ResizeObserver(fitWindow);
  panelObserver.observe(panel);
  const noteObserver = new ResizeObserver(scheduleMarks);
  noteObserver.observe(document.body);
  noteObserver.observe(get('noteSlot'));

  get('start').onclick = () => {
    if (draftChanged()) {
      report('请先确认或取消编辑框中的修改。');
      return;
    }
    finishInline();
    active = !active;
    get('start').textContent = active ? '结束' : '开始';
    get('start').setAttribute('aria-pressed', String(active));
    get('controls').hidden = !active;
    setTarget(undefined);
    get('cancel').click();
  };
  get('close').onclick = () => {
    if (saving) return;
    finishInline();
    if (hasDraft() && !confirm('放弃本次未保存的文字修改和批注？')) return;
    while (history.length) history.pop()();
    controller.abort();
    panelObserver.disconnect();
    noteObserver.disconnect();
    CSS.highlights?.delete(selectionName);
    CSS.highlights?.delete(commentName);
    CSS.highlights?.delete(activeCommentName);
    cancelAnimationFrame(frame);
    cancelAnimationFrame(dragFrame);
    highlightStyle.remove();
    host.remove();
  };
  get('undo').onclick = () => attempt(() => {
    finishInline();
    if (!history.length) throw new Error('没有可撤销的操作。');
    history.at(-1)();
    history.pop();
    setTarget(undefined);
    if (!entries.includes(selectedNote)) selectedNote = undefined;
    report('已撤销。');
    renderEntries();
  });
  get('note').onclick = () => attempt(() => {
    const anchor = requireTarget();
    showComments(true);
    if (draft?.kind === 'note' && draftChanged()) {
      ui.querySelector('textarea').focus();
      return;
    }
    openDraft('note', '批注内容', '', anchor);
  });
  get('bold').onclick = () => attempt(() => {
    const { element } = resolve(requireTarget());
    style('font-weight', Number(getComputedStyle(element).fontWeight) >= 600 ? '400' : '700');
  });
  for (const [id, property, paragraph] of [['size', 'font-size'], ['align', 'text-align'], ['font', 'font-family'],
    ['lineHeight', 'line-height', true], ['letterSpacing', 'letter-spacing'], ['indent', 'text-indent', true]]) {
    get(id).onchange = ({ target: control }) => attempt(() => {
      const value = control.value;
      control.value = '';
      if (value) style(property, value, paragraph);
    });
  }
  get('up').onclick = () => attempt(() => move('up'));
  get('down').onclick = () => attempt(() => move('down'));
  get('underline').onclick = () => attempt(() => style('text-decoration-line', 'underline'));
  for (const [id, property, value] of [['italic', 'font-style', 'italic'], ['strike', 'text-decoration-line', 'line-through'],
    ['sup', 'vertical-align', 'super'], ['sub', 'vertical-align', 'sub'], ['justify', 'text-align', 'justify']]) {
    get(id).onclick = () => attempt(() => style(property, value));
  }
  get('bullets').onclick = () => attempt(() => listStyle('ul'));
  for (const [button, picker, property, paragraph] of [['markText', 'markColor', 'background-color'],
    ['paintText', 'fontColor', 'color'], ['shadeText', 'shadeColor', 'background-color', true]]) {
    const input = get(picker);
    get(button).onclick = () => attempt(() => style(property, input.value, paragraph));
    input.onchange = () => {
      input.closest('.split-color').style.setProperty('--ink', input.value);
      get(button).click();
    };
  }
  const fileInput = get('imageFile');
  let fileContext;
  get('image').onclick = () => attempt(() => {
    const anchor = requireTarget();
    if (anchor.tag !== 'img') throw new Error('请先点击要替换的图片。');
    fileContext = anchor;
    fileInput.click();
  });
  fileInput.onchange = () => attempt(() => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|gif|webp|avif)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      throw new Error('请选择不超过 2 MB 的 PNG、JPEG、GIF、WebP 或 AVIF 图片。');
    }
    const context = fileContext;
    const reader = new FileReader();
    reader.onerror = () => report('读取图片失败。');
    reader.onload = () => attempt(() => {
      if (!host.isConnected || !active) return;
      submit({ kind: 'image', anchor: context, value: reader.result, filename: file.name });
    });
    reader.readAsDataURL(file);
  });
  ui.querySelector('form').onsubmit = (event) => {
    event.preventDefault();
    attempt(() => {
      if (draft.kind === 'block') {
        if (draft.nodes.some(({ node, original }) => !node.isConnected || node.data !== original)) throw new Error('区块内容已变化，请重新选择。');
        for (const { node, input } of draft.nodes) node.data = input.value;
        const nodes = draft.nodes;
        history.push(() => { for (const { node, original } of nodes) node.data = original; });
        setTarget(undefined);
        report('区块已修改，可撤销或保存。');
        get('cancel').click();
        return;
      }
      const value = ui.querySelector('textarea').value;
      if (draft.kind === 'insert') {
        if (!value.trim()) throw new Error('请输入区块内容。');
        const nextTo = draft.anchor ? resolve(draft.anchor).element : null;
        const block = document.createElement(nextTo?.matches('li') ? 'li' : get('insertType').value);
        block.textContent = value;
        if (nextTo) nextTo.after(block);
        else (document.querySelector('main') || document.body).append(block);
        history.push(() => block.remove());
        get('cancel').click();
        setTarget(fingerprint(block));
        report('区块已添加，可继续编辑或撤销。');
        return;
      }
      if (draft.kind === 'note' && !value.trim()) throw new Error('请输入批注内容。');
      submit({ ...draft, value });
      get('cancel').click();
    });
  };
  get('cancel').onclick = () => {
    const form = ui.querySelector('form');
    form.hidden = true;
    get('formSlot').append(form);
    if (draft?.kind !== 'note') get('more').hidden = true;
    get('fields').replaceChildren();
    draft = undefined;
  };

  function draftChanged() {
    if (!draft) return false;
    if (draft.kind === 'block') return draft.nodes.some(({ input, original }) => input.value !== original);
    const initial = draft.kind === 'text' ? draft.anchor.exact : '';
    return ui.querySelector('textarea').value !== initial;
  }

  function hasDraft() {
    return history.length > 0 || draftChanged() || Boolean(inline && inline.element.innerText !== inline.original);
  }

  window.addEventListener('beforeunload', (event) => {
    if (!saving && !hasDraft()) return;
    event.preventDefault();
    event.returnValue = '';
  }, events);

  function writeNotes(head) {
    const previous = head.querySelector('template[' + notesAttribute + ']');
    const template = document.createElement('template');
    template.setAttribute(notesAttribute, '');
    template.content.append(document.createTextNode(JSON.stringify(entries)));
    if (previous) previous.replaceWith(template);
    else head.append(template);
  }

  function serializePage() {
    const copy = document.documentElement.cloneNode(true);
    const children = [...document.documentElement.children];
    copy.children[children.indexOf(host)].remove();
    copy.children[children.indexOf(highlightStyle)].remove();
    const head = copy.querySelector('head');
    head.querySelectorAll('meta[charset],meta[http-equiv="content-type" i]').forEach((meta) => meta.remove());
    const charset = document.createElement('meta');
    charset.setAttribute('charset', 'utf-8');
    head.prepend(charset);
    writeNotes(head);
    const doctype = document.doctype ? new XMLSerializer().serializeToString(document.doctype) : '';
    return doctype + '\n' + copy.outerHTML;
  }

  function versionOf(file) {
    return file.lastModified + ':' + file.size;
  }

  async function save(copy) {
    if (saving) return;
    if (draftChanged()) {
      report('请先在编辑框中确认或取消，再保存。');
      return;
    }
    finishInline();
    if (!copy && !history.length && !legacyNotes) {
      report('没有需要保存的修改。');
      return;
    }
    const originalName = decodeURIComponent(location.pathname.split('/').at(-1)) || '页面.html';
    const types = [{ description: 'HTML 文件', accept: { 'text/html': ['.html', '.htm'] } }];
    saving = true;
    panel.inert = true;
    get('sidebar').inert = true;
    try {
      const html = serializePage();
      let handle = fileSession.handle;
      let original;
      if (copy) {
        if (!window.showSaveFilePicker) throw new Error('当前浏览器无法授权另存，请在桌面 Chrome 打开。');
        handle = await window.showSaveFilePicker({ suggestedName: originalName.replace(/\.html?$/i, '') + '-副本.html', types });
        if (handle.name.toLowerCase() === originalName.toLowerCase() || (fileSession.handle && await handle.isSameEntry(fileSession.handle))) {
          throw new Error('另存时请选择与原文件不同的名称。');
        }
      } else {
        if (location.protocol !== 'file:' || !window.showOpenFilePicker) throw new Error('原位保存需要在桌面 Chrome 打开本地 HTML 文件。');
        if (!handle) {
          report('请选择当前页面对应的原文件。');
          [handle] = await window.showOpenFilePicker({ types, multiple: false, mode: 'readwrite' });
          if (handle.name.toLowerCase() !== originalName.toLowerCase()) throw new Error('所选文件名与当前页面不同。');
        }
        original = await handle.getFile();
        const wasChanged = fileSession.version ? versionOf(original) !== fileSession.version : original.lastModified > performance.timeOrigin;
        if (wasChanged) throw new Error('原文件在打开后发生过变化，可以先另存副本再核对。');
        // Materialize before overwriting because a File handle may become unreadable.
        original = { file: new Blob([await original.arrayBuffer()], { type: 'text/html' }), version: versionOf(original) };
      }
      const stream = await handle.createWritable();
      try {
        if (!copy && versionOf(await handle.getFile()) !== original.version) throw new Error('原文件已变化。');
        await stream.write(html);
        await stream.close();
      } catch (error) {
        await stream.abort().catch(() => {});
        throw error;
      }
      if (copy) {
        report('已另存副本。当前草稿和撤销历史仍保留。');
        return;
      }
      fileSession.handle = handle;
      fileSession.backup = original.file;
      get('backup').hidden = false;
      history.length = 0;
      legacyNotes = false;
      writeNotes(document.head);
      fileSession.version = versionOf(await handle.getFile().catch(() => ({ size: -1, lastModified: -1 })));
      report('已保存到原文件。');
    } catch (error) {
      report(error.name === 'AbortError' ? '已取消保存，草稿仍在。' : error.message + ' 草稿仍在。');
    } finally {
      saving = false;
      panel.inert = false;
      get('sidebar').inert = false;
    }
  }
  get('html').onclick = () => save(false);
  get('saveAs').onclick = () => save(true);
  get('backup').hidden = !fileSession.backup;
  get('backup').onclick = () => downloadBackup(fileSession.backup);
  layoutSidebar();
  renderEntries();
})();
