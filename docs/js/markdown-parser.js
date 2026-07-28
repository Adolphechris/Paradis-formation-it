/* ==========================================================================
   PARADIS IT — Dynamic Markdown Parser Engine
   ========================================================================== */

class MarkdownParser {
  static parse(md) {
    if (!md) return '';

    let html = md;

    // Normalize line endings
    html = html.replace(/\r\n/g, '\n');

    // Code Blocks (fenced)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      const escapedCode = MarkdownParser.escapeHtml(code.trim());
      return `<div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-lang">${language}</span>
          <button class="btn-copy-code" onclick="MarkdownParser.copyCode(this)">Copier</button>
        </div>
        <pre><code class="language-${language}">${escapedCode}</code></pre>
      </div>`;
    });

    // Inline Code
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      return `<code>${MarkdownParser.escapeHtml(code)}</code>`;
    });

    // Callouts / Alerts (> [!NOTE], > [!IMPORTANT], > [!WARNING], > [!TIP])
    html = html.replace(/^>\s*\[!(NOTE|IMPORTANT|WARNING|TIP)\]\s*\n([\s\S]*?)(?=\n\n|\n[^\>]|$)/gmi, (match, type, content) => {
      const calloutType = type.toLowerCase();
      const cleanContent = content.replace(/^>\s*/gm, '').trim();
      return `<div class="callout callout-${calloutType}">
        <strong class="callout-title">${type}</strong>
        <p>${cleanContent}</p>
      </div>`;
    });

    // Blockquotes
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

    // Headers
    html = html.replace(/^### (.*$)/gmi, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gmi, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gmi, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered Lists
    html = html.replace(/^\s*[\-\*]\s+(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Simple Tables parser
    html = MarkdownParser.parseTables(html);

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<blockquote') || p.startsWith('<table')) {
        return p;
      }
      return p ? `<p>${p}</p>` : '';
    }).join('\n');

    return html;
  }

  static escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static parseTables(text) {
    const tableRegex = /\|(.+)\|[\r\n]+\|([-:]+[-| :]*)\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
    return text.replace(tableRegex, (match, headerLine, alignLine, bodyLines) => {
      const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
      const rows = bodyLines.trim().split('\n').map(row => {
        return row.split('|').map(c => c.trim()).filter(c => c);
      });

      let headerHtml = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
      let bodyHtml = rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('');

      return `<table><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
    });
  }

  static copyCode(btn) {
    const pre = btn.parentElement.nextElementSibling;
    const code = pre.querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
      btn.innerText = 'Copié !';
      setTimeout(() => { btn.innerText = 'Copier'; }, 2000);
    });
  }
}

window.MarkdownParser = MarkdownParser;
