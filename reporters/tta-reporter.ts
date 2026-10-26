import type { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import os from 'os';

type Options = { outputFolder?: string; environment?: string; title?: string };

type Row = {
  suite: string;
  title: string;
  author: string;
  priority: string;
  tags: string[];
  file: string;
  start: Date;
  end: Date;
  duration: number;
  status: string;
  screenshot?: string;
  video?: string;
};

export default class TTAReporter implements Reporter {
  private rows: Row[] = [];
  private config!: FullConfig;
  private startTime = new Date();
  private outputFolder: string;
  private environment: string;
  private title: string;

  constructor(options: Options = {}) {
    this.outputFolder = options.outputFolder ?? 'tta-report';
    this.environment = process.env.ENV ?? options.environment ?? 'UAT';
    this.title = options.title ?? 'TTA Automation Report';
  }

  onBegin(config: FullConfig, _suite: Suite) {
    this.config = config;
    this.startTime = new Date();
    fs.rmSync(this.outputFolder, { recursive: true, force: true });
    fs.mkdirSync(path.join(this.outputFolder, 'attachments'), { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Only keep the final attempt when a test is retried
    if (result.retry < test.retries && result.status !== 'passed' && result.status !== 'skipped') return;

    const annotation = (type: string) => test.annotations.find(a => a.type === type)?.description ?? '';
    const tags = test.tags.map(t => t.replace(/^@/, ''));
    const priority = annotation('priority') || tags.find(t => /^P\d$/i.test(t))?.toUpperCase() || '';

    const start = new Date(result.startTime);
    this.rows.push({
      suite: test.parent.project()?.name ?? '',
      title: test.title,
      author: annotation('author') || '-',
      priority: priority || '-',
      tags,
      file: `${path.basename(test.location.file)}:${test.location.line}`,
      start,
      end: new Date(start.getTime() + result.duration),
      duration: result.duration,
      status: result.status === 'timedOut' || result.status === 'interrupted' ? 'failed' : result.status,
      screenshot: this.copyAttachment(result, 'image/png'),
      video: this.copyAttachment(result, 'video/webm'),
    });
  }

  async onEnd(result: FullResult) {
    const file = path.join(this.outputFolder, 'index.html');
    fs.writeFileSync(file, this.buildHtml(result));
    console.log(`\nTTA report: ${path.resolve(file)}`);
  }

  private copyAttachment(result: TestResult, contentType: string): string | undefined {
    const attachment = result.attachments.find(a => a.contentType === contentType && a.path);
    if (!attachment?.path || !fs.existsSync(attachment.path)) return undefined;
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(attachment.path)}`;
    fs.copyFileSync(attachment.path, path.join(this.outputFolder, 'attachments', name));
    return `attachments/${name}`;
  }

  private buildHtml(result: FullResult): string {
    const total = this.rows.length;
    const passed = this.rows.filter(r => r.status === 'passed').length;
    const failed = this.rows.filter(r => r.status === 'failed').length;
    const skipped = this.rows.filter(r => r.status === 'skipped').length;
    const executed = total - skipped;
    const passRate = executed ? ((passed / executed) * 100).toFixed(1) : '0.0';
    const browsers = [...new Set(this.config.projects.map(p => p.name))];
    const platform = { win32: 'Windows', darwin: 'Mac', linux: 'Linux' }[os.platform() as string] ?? os.platform();
    const pad = (n: number) => String(n).padStart(2, '0');
    const s = this.startTime;
    const runId = `${s.getFullYear()}${pad(s.getMonth() + 1)}${pad(s.getDate())}_${pad(s.getHours())}${pad(s.getMinutes())}${pad(s.getSeconds())}`;

    const rowsHtml = this.rows.map((r, i) => `
      <tr data-status="${r.status}" data-priority="${esc(r.priority)}" data-smoke="${r.tags.some(t => t.toLowerCase() === 'smoke')}">
        <td>${i + 1}</td>
        <td>${esc(r.suite)}</td>
        <td class="name">${esc(r.title)}</td>
        <td>${esc(r.author)}</td>
        <td>${esc(r.priority)}</td>
        <td>${r.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</td>
        <td class="mono">${esc(r.file)}</td>
        <td class="time">${fmtDate(r.start)}</td>
        <td class="time">${fmtDate(r.end)}</td>
        <td>${fmtDuration(r.duration)}</td>
        <td><span class="status ${r.status}">${r.status.toUpperCase()}</span></td>
        <td>${r.screenshot ? `<a href="${r.screenshot}" target="_blank">View</a>` : 'N/A'}</td>
        <td>${r.video ? `<a href="${r.video}" target="_blank">Play</a>` : 'N/A'}</td>
      </tr>`).join('');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(this.title)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; background: #f2f5f4; color: #1f2d2a; }
  header { background: linear-gradient(135deg, #1f7a5c, #5fa8a0); color: #fff; text-align: center; padding: 36px 16px; }
  header h1 { margin: 0 0 8px; font-size: 28px; }
  header p { margin: 0; opacity: .9; }
  main { max-width: 1400px; margin: 0 auto; padding: 24px 16px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .card { background: #fff; border-radius: 10px; padding: 18px; border-left: 4px solid #2e8b6a; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
  .card.fail { border-color: #d64545; } .card.skip { border-color: #8a94a6; }
  .card .num { font-size: 30px; font-weight: 700; }
  .card .lbl { font-size: 12px; text-transform: uppercase; color: #5b6b67; margin-top: 4px; }
  .panel { background: #fff; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.08);
           display: flex; flex-wrap: wrap; gap: 10px 22px; align-items: center; font-size: 13px; }
  .panel b { font-size: 11px; color: #5b6b67; text-transform: uppercase; margin-right: 6px; font-weight: 600; }
  .pill { display: inline-block; padding: 3px 12px; border-radius: 999px; background: #e7f3ef; font-weight: 600; font-size: 12px; }
  .pill.env { background: #2e8b6a; color: #fff; }
  .panel label { border: 1px solid #d5ddda; border-radius: 999px; padding: 4px 12px; cursor: pointer; user-select: none; }
  .table-wrap { overflow-x: auto; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
  table { width: 100%; border-collapse: collapse; background: #fff; font-size: 13px; }
  th { background: #1f2a33; color: #fff; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
  td { padding: 12px 10px; border-bottom: 1px solid #edf0ef; vertical-align: middle; }
  td.name { font-weight: 600; } td.mono { font-family: Consolas, monospace; font-size: 12px; } td.time { font-size: 12px; white-space: nowrap; }
  .tag { background: #eef1f6; border-radius: 4px; padding: 2px 6px; font-size: 11px; }
  .status { padding: 4px 12px; border-radius: 999px; color: #fff; font-size: 11px; font-weight: 700; }
  .status.passed { background: #2e9e6a; } .status.failed { background: #d64545; } .status.skipped { background: #8a94a6; }
  .empty { text-align: center; padding: 30px; color: #5b6b67; }
</style>
</head>
<body>
<header>
  <h1>&#127917; ${esc(this.title)}</h1>
  <p>The Testing Academy - Playwright Framework</p>
</header>
<main>
  <section class="cards">
    <div class="card"><div class="num">${total}</div><div class="lbl">Total Tests</div></div>
    <div class="card"><div class="num">${passed}</div><div class="lbl">Passed</div></div>
    <div class="card fail"><div class="num">${failed}</div><div class="lbl">Failed</div></div>
    <div class="card skip"><div class="num">${skipped}</div><div class="lbl">Skipped</div></div>
    <div class="card"><div class="num">${passRate}%</div><div class="lbl">Pass Rate</div></div>
    <div class="card"><div class="num">${fmtDuration(result.duration)}</div><div class="lbl">Duration</div></div>
  </section>

  <section class="panel">
    <span><b>Environment</b><span class="pill env">${esc(this.environment)}</span></span>
    <span><b>Browser</b>${browsers.map(b => `<span class="pill">${esc(b)}</span>`).join(' ')}</span>
    <span><b>Platform</b>${platform}</span>
    <span><b>Workers</b>${this.config.workers}</span>
    <span><b>Run ID</b>${runId}</span>
    <span><b>Started</b>${fmtDate(this.startTime)}</span>
  </section>

  <section class="panel" id="filters">
    <b>Priority:</b>
    <label><input type="checkbox" data-group="priority" value="all" checked> All</label>
    <label><input type="checkbox" data-group="priority" value="P0"> P0</label>
    <label><input type="checkbox" data-group="priority" value="P1"> P1</label>
    <label><input type="checkbox" data-group="priority" value="smoke"> Smoke</label>
    <b style="margin-left:16px">Status:</b>
    <label><input type="checkbox" data-group="status" value="all" checked> All</label>
    <label><input type="checkbox" data-group="status" value="passed"> &#9989; Passed</label>
    <label><input type="checkbox" data-group="status" value="failed"> &#10060; Failed</label>
    <label><input type="checkbox" data-group="status" value="skipped"> &#9197; Skipped</label>
  </section>

  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>S.No</th><th>Suite</th><th>Test Name</th><th>Author</th><th>Priority</th><th>Tags</th><th>File</th>
        <th>Start Time</th><th>End Time</th><th>Duration</th><th>Status</th><th>Screenshot</th><th>Video</th>
      </tr></thead>
      <tbody>${rowsHtml || '<tr><td colspan="13" class="empty">No tests were run.</td></tr>'}</tbody>
    </table>
  </div>
</main>
<script>
  const boxes = document.querySelectorAll('#filters input');
  boxes.forEach(box => box.addEventListener('change', () => {
    const group = box.dataset.group;
    const groupBoxes = [...document.querySelectorAll('input[data-group="' + group + '"]')];
    const allBox = groupBoxes.find(b => b.value === 'all');
    if (box.value === 'all' && box.checked) groupBoxes.forEach(b => { if (b !== allBox) b.checked = false; });
    else if (box.value !== 'all') allBox.checked = !groupBoxes.some(b => b.value !== 'all' && b.checked);
    applyFilters();
  }));

  function selected(group) {
    return [...document.querySelectorAll('input[data-group="' + group + '"]:checked')].map(b => b.value);
  }

  function applyFilters() {
    const priorities = selected('priority');
    const statuses = selected('status');
    document.querySelectorAll('tbody tr[data-status]').forEach(row => {
      const priorityOk = priorities.includes('all') || priorities.some(p =>
        p === 'smoke' ? row.dataset.smoke === 'true' : row.dataset.priority === p);
      const statusOk = statuses.includes('all') || statuses.includes(row.dataset.status);
      row.style.display = priorityOk && statusOk ? '' : 'none';
    });
  }
</script>
</body>
</html>`;
  }
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function fmtDate(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
}
