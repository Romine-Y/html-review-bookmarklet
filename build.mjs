import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const root = new URL('./', import.meta.url);
const source = await readFile(new URL('editor.js', root), 'utf8');
new Script(source, { filename: 'editor.js' });
const bookmarklet = 'javascript:' + encodeURIComponent(source.trim());
const href = bookmarklet.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const page = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Editor · 安装与使用</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#fff;color:#111;font:16px/1.7 system-ui,sans-serif}
  main{max-width:1072px;margin:0 auto;padding:clamp(36px,9vw,112px) 28px;display:grid;grid-template-columns:1.2fr 1fr;align-items:start;gap:clamp(34px,8vw,112px)}
  h1,h2,h3,p{margin:0} h1,.install{font-family:ui-monospace,Consolas,monospace}
  h1{font-size:clamp(58px,10vw,108px);letter-spacing:-.085em;line-height:1}
  .intro{margin:18px 0 36px;font-size:18px} .setup{border-top:1px solid #111;padding-top:20px}
  .install{display:inline-flex;gap:28px;align-items:center;margin:12px 0 14px;padding:10px 18px;background:#111;color:#fff;border:1px solid #111;border-radius:6px;text-decoration:none;font-size:17px;font-weight:700;cursor:grab}
  .install::after{content:"↗"} .install:hover{background:#fff;color:#111} .install:active{cursor:grabbing}
  :focus-visible{outline:2px solid #111;outline-offset:4px}
  .hint{font-size:13px;color:#444} kbd{border:1px solid #999;border-radius:3px;padding:1px 4px}
  aside{border:1px solid #111;border-radius:9px;padding:clamp(18px,4vw,30px)}
  h2{font-size:22px;line-height:1.3} ol{padding-left:1.35em;margin:14px 0 0}
  li{border-top:1px solid #ccc;padding:12px 0 0;margin-top:12px} li::marker{font-family:ui-monospace,Consolas,monospace}
  li p{font-size:14px;color:#333;margin-top:3px}
  @media(max-width:680px){main{grid-template-columns:1fr;padding-inline:22px}.intro{margin-bottom:24px}}
</style>
<main>
  <section aria-labelledby="title">
    <h1 id="title">Editor</h1>
    <p class="intro">在浏览器里编辑和批注本地 HTML。</p>
    <div class="setup">
      <h2>拖到 Chrome 书签栏</h2>
      <a id="install" class="install" href="${href}">Editor</a>
      <p class="hint">看不到书签栏？按 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>。</p>
    </div>
  </section>
  <aside aria-labelledby="guide">
    <h2 id="guide">使用指南</h2>
    <ol>
      <li><strong>打开 HTML</strong><p>在桌面 Chrome 打开本地文件，点书签，再点「开始」。</p></li>
      <li><strong>编辑或批注</strong><p>划选文字或点击区块。批注在右栏查看，拖动栏的左边缘可调宽度。</p></li>
      <li><strong>保存或另存为</strong><p>首次保存请选择当前打开的原文件。要保留原版时，使用「另存为」。</p></li>
    </ol>
  </aside>
</main>
<script>document.getElementById('install').addEventListener('click', event => event.preventDefault())</script>
</html>
`;
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/install.html', root), page);
console.log('dist/install.html (' + bookmarklet.length + ' 字符的离线书签)');
