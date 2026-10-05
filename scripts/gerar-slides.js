// Gera a apresentacao (.pptx) da POC DevSecOps - TechSecure Solutions
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Grupo AP II DevSecOps";
p.title = "TechSecure Solutions - Esteira CI/CD DevSecOps";

// ---- Paleta (tema seguranca: teal/verde sobre navy) ----
const DARK = "0B2530";
const PANEL = "12323F";
const PRIMARY = "0E7490";
const ACCENT = "10B981";
const LIGHT = "FFFFFF";
const TXT = "16303B";
const MUTED = "5B7079";
const CARDBG = "F1F6F8";
const HEAD = "Cambria";
const BODY = "Calibri";
const IMGDIR = "evidencias/img/";

function titleTop(s, t) {
  s.addText(t, { isTextBox: true, x: 0.6, y: 0.4, w: 12.1, h: 0.9,
    fontFace: HEAD, fontSize: 34, bold: true, color: TXT, align: "left" });
}
function footer(s, n) {
  s.addText("TechSecure Solutions · AP II DevSecOps", { isTextBox: true,
    x: 0.6, y: 7.05, w: 9, h: 0.3, fontFace: BODY, fontSize: 10, color: MUTED, margin: 0 });
  s.addText(String(n), { isTextBox: true, x: 12.4, y: 7.05, w: 0.5, h: 0.3,
    fontFace: BODY, fontSize: 10, color: MUTED, align: "right", margin: 0 });
}
function chip(s, x, y, w, label, fill) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h: 0.5, rectRadius: 0.08,
    fill: { color: fill }, line: { type: "none" } });
  s.addText(label, { isTextBox: true, x, y, w, h: 0.5, align: "center",
    fontFace: BODY, fontSize: 13, bold: true, color: LIGHT, margin: 0 });
}
function arrow(s, x, y) {
  s.addText("→", { isTextBox: true, x, y: y - 0.02, w: 0.4, h: 0.5,
    align: "center", fontFace: BODY, fontSize: 20, color: PRIMARY, margin: 0 });
}

// ============ SLIDE 1 — Capa (dark) ============
let s = p.addSlide();
s.background = { color: DARK };
s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 1.0, w: 3.4, h: 0.5, rectRadius: 0.1,
  fill: { color: PANEL }, line: { color: PRIMARY, width: 1 } });
s.addText("AP II · DevSecOps", { isTextBox: true, x: 0.6, y: 1.0, w: 3.4, h: 0.5,
  align: "center", fontFace: BODY, fontSize: 14, bold: true, color: "7FD9E8", margin: 0 });
s.addText("TechSecure Solutions", { isTextBox: true, x: 0.6, y: 1.9, w: 12, h: 1.3,
  fontFace: HEAD, fontSize: 54, bold: true, color: LIGHT });
s.addText("Esteira CI/CD com Segurança Integrada", { isTextBox: true, x: 0.62, y: 3.1,
  w: 12, h: 0.7, fontFace: BODY, fontSize: 24, color: "CFE8EF" });
// fluxo em chips
const flow = ["Código", "Build", "Teste", "Security Scan", "Imagem", "Deploy", "Container"];
let fx = 0.6;
flow.forEach((f, i) => {
  const w = 1.45;
  s.addShape(p.ShapeType.roundRect, { x: fx, y: 4.5, w, h: 0.55, rectRadius: 0.08,
    fill: { color: i % 2 ? PRIMARY : PANEL }, line: { color: PRIMARY, width: 1 } });
  s.addText(f, { isTextBox: true, x: fx, y: 4.5, w, h: 0.55, align: "center",
    fontFace: BODY, fontSize: 12, bold: true, color: LIGHT, margin: 0 });
  fx += w;
  if (i < flow.length - 1) { s.addText("›", { isTextBox: true, x: fx - 0.08, y: 4.5, w: 0.16, h: 0.55, align: "center", fontFace: BODY, fontSize: 16, color: ACCENT, margin: 0 }); }
});
s.addText("Prova de conceito · Integrantes: [preencher]", { isTextBox: true, x: 0.6, y: 6.4,
  w: 12, h: 0.4, fontFace: BODY, fontSize: 14, color: "9FC4CE" });
s.addNotes("Abertura: apresentar o grupo e o objetivo - uma esteira CI/CD com seguranca integrada (shift-left) para a TechSecure Solutions. Citar o fluxo Codigo-Build-Teste-Seguranca-Imagem-Deploy-Container.");

// ============ SLIDE 2 — Objetivo e cenário ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Objetivo e cenário");
const obj = [
  ["Cenário", "A TechSecure quer reduzir erros de implantação e integrar segurança ao ciclo de desenvolvimento."],
  ["Objetivo", "Automatizar do código ao container, com verificação de segurança em cada push (shift-left security)."],
  ["Entrega", "POC de esteira CI/CD: Git, build, teste, análise de segurança, imagem Docker e deploy automático."],
];
let oy = 1.6;
obj.forEach(([h, d], i) => {
  s.addShape(p.ShapeType.ellipse, { x: 0.6, y: oy, w: 0.5, h: 0.5, fill: { color: i === 1 ? ACCENT : PRIMARY }, line: { type: "none" } });
  s.addText(String(i + 1), { isTextBox: true, x: 0.6, y: oy, w: 0.5, h: 0.5, align: "center", fontFace: BODY, fontSize: 16, bold: true, color: LIGHT, margin: 0 });
  s.addText(h, { isTextBox: true, x: 1.3, y: oy - 0.05, w: 11, h: 0.4, fontFace: BODY, fontSize: 18, bold: true, color: PRIMARY, margin: 0 });
  s.addText(d, { isTextBox: true, x: 1.3, y: oy + 0.35, w: 11.2, h: 0.7, fontFace: BODY, fontSize: 15, color: TXT, margin: 0 });
  oy += 1.5;
});
footer(s, 2);
s.addNotes("Explicar o cenario da TechSecure e o objetivo da POC. Reforcar que seguranca entra cedo no processo.");

// ============ SLIDE 3 — Arquitetura ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Arquitetura");
const arch = [
  ["Desenvolvedor", "git push", PANEL],
  ["GitHub", "repositório + gatilho", PRIMARY],
  ["GitHub Actions", "pipeline CI/CD", PRIMARY],
  ["Container Docker", "app na porta 8080", ACCENT],
];
let ax = 0.6;
arch.forEach((a, i) => {
  const w = 2.9;
  s.addShape(p.ShapeType.roundRect, { x: ax, y: 2.2, w, h: 1.6, rectRadius: 0.1,
    fill: { color: CARDBG }, line: { color: a[2], width: 2 } });
  s.addText(a[0], { isTextBox: true, x: ax, y: 2.5, w, h: 0.5, align: "center", fontFace: BODY, fontSize: 17, bold: true, color: TXT, margin: 0 });
  s.addText(a[1], { isTextBox: true, x: ax, y: 3.05, w, h: 0.6, align: "center", fontFace: BODY, fontSize: 13, color: MUTED, margin: 0 });
  ax += w;
  if (i < arch.length - 1) arrow(s, ax - 0.03, 2.75);
});
s.addText("O deploy é feito por um runner self-hosted no WSL, que sobe o container automaticamente ao final da esteira.",
  { isTextBox: true, x: 0.6, y: 4.6, w: 12.1, h: 0.8, fontFace: BODY, fontSize: 15, italic: true, color: TXT });
footer(s, 3);
s.addNotes("Percorrer as 4 pecas: GitHub dispara a pipeline no push; Actions orquestra; Docker empacota; runner self-hosted faz o deploy local.");

// ============ SLIDE 4 — Aplicação ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Aplicação");
s.addText([
  { text: "API web simples em ", options: { color: TXT } },
  { text: "Python + Flask", options: { color: PRIMARY, bold: true } },
  { text: ", servida por ", options: { color: TXT } },
  { text: "gunicorn", options: { color: PRIMARY, bold: true } },
  { text: " e empacotada em Docker.", options: { color: TXT } },
], { isTextBox: true, x: 0.6, y: 1.5, w: 12, h: 0.5, fontFace: BODY, fontSize: 16 });
const eps = [
  ["GET /", "Página institucional"],
  ["GET /health", "Healthcheck do container/deploy"],
  ["GET /api/version", "Versão da app e das libs"],
  ["GET /api/soma", "Lógica coberta por teste"],
];
let ey = 2.3;
eps.forEach(([e, d]) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: ey, w: 5.9, h: 0.9, rectRadius: 0.08, fill: { color: CARDBG }, line: { type: "none" } });
  s.addText(e, { isTextBox: true, x: 0.8, y: ey + 0.12, w: 5.5, h: 0.35, fontFace: "Courier New", fontSize: 15, bold: true, color: PRIMARY, margin: 0 });
  s.addText(d, { isTextBox: true, x: 0.8, y: ey + 0.47, w: 5.5, h: 0.35, fontFace: BODY, fontSize: 12, color: MUTED, margin: 0 });
  ey += 1.05;
});
// destaque: boas praticas
s.addShape(p.ShapeType.roundRect, { x: 6.9, y: 2.3, w: 5.8, h: 4.2, rectRadius: 0.1, fill: { color: DARK }, line: { type: "none" } });
s.addText("Boas práticas de segurança", { isTextBox: true, x: 7.2, y: 2.5, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
s.addText([
  { text: "Imagem base enxuta python:3.12-slim", options: { bullet: true, breakLine: true } },
  { text: "Execução como usuário não-root (uid 10001)", options: { bullet: true, breakLine: true } },
  { text: "HEALTHCHECK embutido no container", options: { bullet: true, breakLine: true } },
  { text: "Servidor de produção gunicorn", options: { bullet: true, breakLine: true } },
  { text: "Dependências fixadas (versionamento reproduzível)", options: { bullet: true } },
], { isTextBox: true, x: 7.2, y: 3.1, w: 5.3, h: 3.2, fontFace: BODY, fontSize: 14, color: "E6F2F5", paraSpaceAfter: 10, margin: 0 });
footer(s, 4);
s.addNotes("App proposital simples - o foco e a esteira. Destacar as boas praticas do container (nao-root, slim, healthcheck, gunicorn).");

// ============ SLIDE 5 — Tecnologias ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Tecnologias utilizadas");
const tech = [
  ["Git + GitHub", "Versionamento e gatilho"],
  ["GitHub Actions", "Orquestração CI/CD"],
  ["Docker", "Containerização"],
  ["pytest", "Testes automatizados"],
  ["Bandit", "SAST (análise de código)"],
  ["pip-audit", "CVEs em dependências"],
  ["Trivy", "Scan de deps e imagem"],
  ["WSL2 + Ubuntu", "Ambiente de execução"],
];
let tx = 0.6, ty = 1.7;
tech.forEach((t, i) => {
  const w = 2.95, h = 1.35, gap = 0.15;
  s.addShape(p.ShapeType.roundRect, { x: tx, y: ty, w, h, rectRadius: 0.08, fill: { color: CARDBG }, line: { color: (i % 2 ? ACCENT : PRIMARY), width: 1.5 } });
  s.addShape(p.ShapeType.ellipse, { x: tx + 0.2, y: ty + 0.2, w: 0.35, h: 0.35, fill: { color: (i % 2 ? ACCENT : PRIMARY) }, line: { type: "none" } });
  s.addText(t[0], { isTextBox: true, x: tx + 0.7, y: ty + 0.18, w: w - 0.8, h: 0.4, fontFace: BODY, fontSize: 15, bold: true, color: TXT, margin: 0 });
  s.addText(t[1], { isTextBox: true, x: tx + 0.2, y: ty + 0.7, w: w - 0.4, h: 0.5, fontFace: BODY, fontSize: 12, color: MUTED, margin: 0 });
  tx += w + gap;
  if ((i + 1) % 4 === 0) { tx = 0.6; ty += h + gap; }
});
footer(s, 5);
s.addNotes("Resumo das ferramentas. Enfatizar as 3 de seguranca: Bandit (codigo), pip-audit e Trivy (dependencias e imagem).");

// ============ SLIDE 6 — A pipeline (4 estágios) ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "A pipeline — 4 estágios");
const jobs = [
  ["1 · Build & Test", "Instala dependências e roda pytest. Falhou um teste, a esteira para."],
  ["2 · Security", "Bandit (SAST) + pip-audit + Trivy (filesystem). Relatórios publicados."],
  ["3 · Build & Scan", "Constrói a imagem Docker e roda Trivy sobre a imagem."],
  ["4 · Deploy", "Runner self-hosted sobe/atualiza o container automaticamente."],
];
let jy = 1.7;
jobs.forEach((j, i) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: jy, w: 12.1, h: 1.15, rectRadius: 0.08, fill: { color: CARDBG }, line: { type: "none" } });
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: jy, w: 2.9, h: 1.15, rectRadius: 0.08, fill: { color: i === 3 ? ACCENT : PRIMARY }, line: { type: "none" } });
  s.addText(j[0], { isTextBox: true, x: 0.6, y: jy, w: 2.9, h: 1.15, align: "center", fontFace: BODY, fontSize: 16, bold: true, color: LIGHT, margin: 0 });
  s.addText(j[1], { isTextBox: true, x: 3.7, y: jy, w: 8.8, h: 1.15, fontFace: BODY, fontSize: 14, color: TXT, valign: "middle", margin: 0.1 });
  jy += 1.25;
});
footer(s, 6);
s.addNotes("Explicar os 4 jobs encadeados. Nenhuma imagem vai para deploy sem passar por testes e seguranca.");

// ============ SLIDE 7 — Segurança: o achado ============
s = p.addSlide(); s.background = { color: DARK };
s.addText("Análise de segurança — o achado", { isTextBox: true, x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontFace: HEAD, fontSize: 32, bold: true, color: LIGHT });
// stats
const stats = [["8", "HIGH nas deps\n(Trivy fs)"], ["57", "HIGH na imagem\n(SO + Python)"], ["1", "achado SAST\n(Bandit B104)"]];
let sx = 0.6;
stats.forEach(([n, l]) => {
  s.addShape(p.ShapeType.roundRect, { x: sx, y: 1.5, w: 2.6, h: 1.7, rectRadius: 0.1, fill: { color: PANEL }, line: { type: "none" } });
  s.addText(n, { isTextBox: true, x: sx, y: 1.6, w: 2.6, h: 0.9, align: "center", fontFace: HEAD, fontSize: 48, bold: true, color: ACCENT, margin: 0 });
  s.addText(l, { isTextBox: true, x: sx, y: 2.5, w: 2.6, h: 0.65, align: "center", fontFace: BODY, fontSize: 12, color: "CFE8EF", margin: 0 });
  sx += 2.8;
});
// card do CVE
s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 3.5, w: 12.1, h: 3.1, rectRadius: 0.1, fill: { color: PANEL }, line: { color: ACCENT, width: 1.5 } });
s.addText("CVE-2023-43804 · urllib3 1.26.12 · Severidade HIGH", { isTextBox: true, x: 0.9, y: 3.7, w: 11.5, h: 0.5, fontFace: BODY, fontSize: 20, bold: true, color: LIGHT, margin: 0 });
s.addText([
  { text: "Problema: ", options: { bold: true, color: ACCENT } },
  { text: "o cabeçalho Cookie não é removido em redirecionamentos cross-origin — tokens de sessão podem vazar para outro domínio.", options: { color: "E6F2F5" } },
], { isTextBox: true, x: 0.9, y: 4.35, w: 11.4, h: 0.9, fontFace: BODY, fontSize: 15, margin: 0 });
s.addText([
  { text: "Componente: ", options: { bold: true, color: ACCENT } },
  { text: "urllib3 (dependência transitiva de requests).", options: { color: "E6F2F5" } },
], { isTextBox: true, x: 0.9, y: 5.25, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 15, margin: 0 });
s.addText([
  { text: "Correção: ", options: { bold: true, color: ACCENT } },
  { text: "atualizar urllib3 ≥ 1.26.17 (na prática, requests ≥ 2.31.0).", options: { color: "E6F2F5" } },
], { isTextBox: true, x: 0.9, y: 5.75, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 15, margin: 0 });
s.addNotes("Apresentar o achado principal: CVE-2023-43804 em urllib3. Vulnerabilidade, componente, severidade HIGH e a correcao.");

// ============ SLIDE 8 — Evidência: app ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Evidência — aplicação funcionando");
s.addImage({ path: IMGDIR + "fig-09-app-navegador.png", x: 0.6, y: 1.5, w: 8.6, h: 5.0 });
s.addShape(p.ShapeType.roundRect, { x: 9.4, y: 1.5, w: 3.3, h: 5.0, rectRadius: 0.1, fill: { color: CARDBG }, line: { type: "none" } });
s.addText("Container em execução", { isTextBox: true, x: 9.6, y: 1.7, w: 2.9, h: 0.5, fontFace: BODY, fontSize: 15, bold: true, color: PRIMARY, margin: 0 });
s.addText([
  { text: "Status: healthy", options: { bullet: true, breakLine: true } },
  { text: "Porta 8080 publicada", options: { bullet: true, breakLine: true } },
  { text: "/health → ok", options: { bullet: true, breakLine: true } },
  { text: "/api/version → 1.0.0", options: { bullet: true } },
], { isTextBox: true, x: 9.6, y: 2.3, w: 2.9, h: 2.0, fontFace: BODY, fontSize: 13, color: TXT, paraSpaceAfter: 8, margin: 0 });
s.addText("http://localhost:8080", { isTextBox: true, x: 9.6, y: 5.9, w: 2.9, h: 0.4, fontFace: "Courier New", fontSize: 12, color: MUTED, margin: 0 });
footer(s, 8);
s.addNotes("Mostrar a aplicacao rodando no navegador e o container healthy na porta 8080.");

// ============ SLIDE 9 — Evidência: pipeline ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Evidência — pipeline automática (GitHub Actions)");
s.addImage({ path: IMGDIR + "fig-10-actions.png", x: 0.6, y: 1.5, w: 8.2, h: 5.0 });
s.addShape(p.ShapeType.roundRect, { x: 9.0, y: 1.5, w: 3.7, h: 5.0, rectRadius: 0.1, fill: { color: DARK }, line: { type: "none" } });
s.addText("Pipeline verde", { isTextBox: true, x: 9.25, y: 1.7, w: 3.3, h: 0.5, fontFace: BODY, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
s.addText([
  { text: "Dispara automaticamente a cada push", options: { bullet: true, breakLine: true } },
  { text: "Build e Testes ✓", options: { bullet: true, breakLine: true } },
  { text: "Análise de Segurança ✓", options: { bullet: true, breakLine: true } },
  { text: "Build e Scan da Imagem ✓", options: { bullet: true, breakLine: true } },
  { text: "Deploy automático ✓", options: { bullet: true } },
], { isTextBox: true, x: 9.25, y: 2.3, w: 3.3, h: 3.2, fontFace: BODY, fontSize: 14, color: "E6F2F5", paraSpaceAfter: 10, margin: 0 });
footer(s, 9);
s.addNotes("Mostrar a aba Actions: a pipeline roda sozinha no push e fica verde, incluindo o deploy no runner self-hosted.");

// ============ SLIDE 10 — Demonstração ============
s = p.addSlide(); s.background = { color: LIGHT };
titleTop(s, "Demonstração ao vivo");
const demo = [
  "Aplicação funcionando (navegador + curl)",
  "Alteração simples no código (corrige CVEs, v1.0.1)",
  "Commit e push",
  "Pipeline inicia automaticamente",
  "Build → Teste → Security scan",
  "Build da imagem → Deploy",
  "Aplicação atualizada (v1.0.1)",
];
let dy = 1.7;
demo.forEach((d, i) => {
  s.addShape(p.ShapeType.ellipse, { x: 0.8, y: dy, w: 0.45, h: 0.45, fill: { color: i === demo.length - 1 ? ACCENT : PRIMARY }, line: { type: "none" } });
  s.addText(String(i + 1), { isTextBox: true, x: 0.8, y: dy, w: 0.45, h: 0.45, align: "center", fontFace: BODY, fontSize: 14, bold: true, color: LIGHT, margin: 0 });
  s.addText(d, { isTextBox: true, x: 1.45, y: dy - 0.02, w: 11, h: 0.5, fontFace: BODY, fontSize: 16, color: TXT, valign: "middle", margin: 0 });
  dy += 0.72;
});
footer(s, 10);
s.addNotes("Roteiro da demo (itens obrigatorios). Lembrar: deixar o runner rodando (cd ~/actions-runner && ./run.sh) antes de comecar.");

// ============ SLIDE 11 — Conclusão (dark) ============
s = p.addSlide(); s.background = { color: DARK };
s.addText("Conclusão", { isTextBox: true, x: 0.6, y: 0.8, w: 12, h: 1.0, fontFace: HEAD, fontSize: 40, bold: true, color: LIGHT });
s.addText([
  { text: "Esteira CI/CD completa com segurança integrada (DevSecOps).", options: { bullet: true, breakLine: true } },
  { text: "Todo push passa por testes e 3 camadas de segurança antes do deploy.", options: { bullet: true, breakLine: true } },
  { text: "Vulnerabilidades reais detectadas e corrigidas automaticamente.", options: { bullet: true, breakLine: true } },
  { text: "Ciclo detecção → correção → verificação, sem intervenção manual.", options: { bullet: true } },
], { isTextBox: true, x: 0.7, y: 2.2, w: 11.8, h: 3.0, fontFace: BODY, fontSize: 20, color: "E6F2F5", paraSpaceAfter: 16, margin: 0 });
s.addText("Obrigado!  ·  github.com/denooka47/techsecure-devsecops", { isTextBox: true, x: 0.7, y: 6.2, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, italic: true, color: ACCENT });
s.addNotes("Fechar com o valor para a TechSecure: menos risco e menos erros de implantacao. Abrir para perguntas.");

p.writeFile({ fileName: "docs/apresentacao.pptx" }).then((f) => console.log("gerado:", f));
