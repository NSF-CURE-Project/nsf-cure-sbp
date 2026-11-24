from base64 import b64encode
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = Path("/Users/alexanderokonkwo/Desktop/CPP_Stacked_2C_Green_RGB-500px.png")
PDF_PATH = ROOT / "output" / "pdf" / "name-tag-template-letter-hotdog-duplex.pdf"
SVG_FRONT_PATH = ROOT / "output" / "svg" / "name-tag-template-letter-hotdog-front.svg"
SVG_BACK_PATH = ROOT / "output" / "svg" / "name-tag-template-letter-hotdog-back.svg"
HTML_PATH = ROOT / "output" / "name-tag-template-letter-hotdog-duplex.html"

PAGE_W, PAGE_H = letter
INCH = 72
MARGIN = 0.45 * INCH
FOLD_X = PAGE_W / 2
PANEL_W = FOLD_X - (2 * MARGIN)
PANEL_H = PAGE_H - (2 * MARGIN)
LOGO_ASPECT = 613 / 500

NAVY = HexColor("#174A5B")
CPP_GREEN = HexColor("#005030")
GOLD = HexColor("#D6A33A")
SLATE = HexColor("#5F6F76")
PALE = HexColor("#F8FAF7")


def logo_data_uri() -> str:
    encoded = b64encode(LOGO_PATH.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def draw_panel(pdf: canvas.Canvas, x: float, y: float, mirror: bool = False, name: str = "Alexander Okonkwo") -> None:
    center_x = x + PANEL_W / 2
    center_y = y + PANEL_H / 2
    logo_w = 1.90 * INCH
    logo_h = logo_w * LOGO_ASPECT

    pdf.setFillColor(PALE)
    pdf.setStrokeColor(CPP_GREEN)
    pdf.setLineWidth(1.6)
    pdf.roundRect(x, y, PANEL_W, PANEL_H, 14, fill=1, stroke=1)

    # The physical panels are tall on the flat sheet, but the finished
    # hot-dog tent presents an 11-inch-wide face. Rotate the content group
    # so the logo/name read horizontally after the folded tent is stood up.
    display_w = PANEL_H
    pdf.saveState()
    pdf.translate(center_x, center_y)
    pdf.rotate(-90)
    if mirror:
        logo_x = display_w / 2 - 0.35 * INCH - logo_w
        name_x = -1.65 * INCH
        divider_x = 1.75 * INCH
    else:
        logo_x = -display_w / 2 + 0.45 * INCH
        name_x = 1.65 * INCH
        divider_x = -1.75 * INCH
    pdf.drawImage(
        str(LOGO_PATH),
        logo_x,
        -logo_h / 2,
        width=logo_w,
        height=logo_h,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )

    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(4.0)
    pdf.line(divider_x, -1.25 * INCH, divider_x, 1.25 * INCH)

    pdf.setFillColor(HexColor("#000000"))
    pdf.setFont("Helvetica-Bold", 40)
    pdf.drawCentredString(name_x, 4, name)

    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(3.2)
    pdf.line(name_x - 42, -0.48 * INCH, name_x + 42, -0.48 * INCH)

    pdf.setFillColor(HexColor("#41544C"))
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(name_x, -0.86 * INCH, "2026 CPP Summer Bridge Program")
    pdf.restoreState()


def draw_question_table(pdf: canvas.Canvas, x: float, y: float) -> None:
    center_x = x + PANEL_W / 2
    center_y = y + PANEL_H / 2
    display_w = PANEL_H
    table_w = 9.7 * INCH
    table_h = 3.25 * INCH
    table_x = -table_w / 2
    table_y = -table_h / 2
    header_h = 0.45 * INCH
    row_h = 0.40 * INCH
    col_widths = [0.55 * INCH, 1.15 * INCH, 8.00 * INCH]

    pdf.setFillColor(white)
    pdf.roundRect(x, y, PANEL_W, PANEL_H, 14, fill=1, stroke=0)

    pdf.saveState()
    pdf.translate(center_x, center_y)
    pdf.rotate(-90)
    pdf.setFillColor(white)
    pdf.setStrokeColor(NAVY)
    pdf.setLineWidth(0.9)
    pdf.rect(table_x, table_y, table_w, table_h, fill=1, stroke=1)
    pdf.setFillColor(HexColor("#DCECF0"))
    pdf.rect(table_x, table_y + table_h - header_h, table_w, header_h, fill=1, stroke=0)

    pdf.setStrokeColor(NAVY)
    pdf.setLineWidth(0.6)
    pdf.line(table_x, table_y + table_h - header_h, table_x + table_w, table_y + table_h - header_h)
    for row in range(1, 7):
        y_line = table_y + table_h - header_h - row * row_h
        pdf.line(table_x, y_line, table_x + table_w, y_line)
    running_x = table_x
    for width in col_widths[:-1]:
        running_x += width
        pdf.line(running_x, table_y, running_x, table_y + table_h)

    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 11)
    header_y = table_y + table_h - header_h / 2 - 4
    header_x = [table_x + col_widths[0] / 2, table_x + col_widths[0] + col_widths[1] / 2, table_x + col_widths[0] + col_widths[1] + col_widths[2] / 2]
    for label, x_pos in zip(["No.", "Date", "Questions"], header_x):
        pdf.drawCentredString(x_pos, header_y, label)

    pdf.setFont("Helvetica", 10)
    for index in range(1, 8):
        row_center_y = table_y + table_h - header_h - (index - 0.5) * row_h
        pdf.drawCentredString(header_x[0], row_center_y - 3, str(index))
    pdf.restoreState()


def draw_fold_guide(pdf: canvas.Canvas) -> None:
    pdf.setStrokeColor(SLATE)
    pdf.setDash(4, 4)
    pdf.setLineWidth(0.7)
    pdf.line(FOLD_X, MARGIN, FOLD_X, PAGE_H - MARGIN)
    pdf.setDash()


def build_pdf(output_path: Path = PDF_PATH, name: str = "Alexander Okonkwo", number: int = 1) -> None:
    if not LOGO_PATH.exists():
        raise FileNotFoundError(f"Logo file not found: {LOGO_PATH}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output_path), pagesize=letter)
    pdf.setTitle("CPP Hot-Dog Fold Duplex Name Tag Template")
    pdf.setAuthor("CPP Summer Bridge Program")

    # Page 1: front of the sheet. The left panel becomes the front face.
    pdf.setFillColor(white)
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_panel(pdf, MARGIN, MARGIN, mirror=False, name=name)
    pdf.setFillColor(CPP_GREEN)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.saveState()
    pdf.translate(MARGIN + PANEL_W + 0.08 * INCH, PAGE_H - MARGIN + 0.14 * INCH)
    pdf.rotate(-90)
    pdf.drawCentredString(0, 0, str(number))
    pdf.restoreState()
    draw_fold_guide(pdf)
    pdf.showPage()

    # Page 2: reverse of the sheet. The right panel becomes the back face.
    pdf.setFillColor(white)
    pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_question_table(pdf, MARGIN, MARGIN)
    draw_question_table(pdf, FOLD_X + MARGIN, MARGIN)
    draw_fold_guide(pdf)
    pdf.save()


def svg_question_table(center_x: float) -> str:
    table_x, table_y, table_w, table_h = -4.85, -1.625, 9.70, 3.25
    row_lines = "".join(
        f'<line x1="{table_x:g}" y1="{table_y + table_h - 0.45 - row * 0.40:g}" x2="{table_x + table_w:g}" y2="{table_y + table_h - 0.45 - row * 0.40:g}" stroke="#174A5B" stroke-width="0.006"/>'
        for row in range(1, 7)
    )
    numbers = "".join(
        f'<text x="{table_x + 0.275:g}" y="{table_y + table_h - 0.45 - (index - 0.5) * 0.40 + 0.05:g}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="0.14" fill="#174A5B">{index}</text>'
        for index in range(1, 8)
    )
    return f'''<g transform="translate({center_x:g} 5.5) rotate(-90)">
    <rect x="{table_x:g}" y="{table_y:g}" width="{table_w:g}" height="{table_h:g}" fill="#FFFFFF" stroke="#174A5B" stroke-width="0.012"/>
    <rect x="{table_x:g}" y="{table_y + table_h - 0.45:g}" width="{table_w:g}" height="0.45" fill="#DCECF0"/>
    <line x1="{table_x:g}" y1="{table_y + table_h - 0.45:g}" x2="{table_x + table_w:g}" y2="{table_y + table_h - 0.45:g}" stroke="#174A5B" stroke-width="0.008"/>
    {row_lines}
    <line x1="{table_x + 0.55:g}" y1="{table_y:g}" x2="{table_x + 0.55:g}" y2="{table_y + table_h:g}" stroke="#174A5B" stroke-width="0.006"/>
    <line x1="{table_x + 1.70:g}" y1="{table_y:g}" x2="{table_x + 1.70:g}" y2="{table_y + table_h:g}" stroke="#174A5B" stroke-width="0.006"/>
    <text x="{table_x + 0.275:g}" y="0.18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="0.16" font-weight="700" fill="#174A5B">No.</text>
    <text x="{table_x + 1.125:g}" y="0.18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="0.16" font-weight="700" fill="#174A5B">Date</text>
    <text x="{table_x + 5.70:g}" y="0.18" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="0.16" font-weight="700" fill="#174A5B">Questions</text>
    {numbers}
  </g>'''


def svg_page(data_uri: str, back: bool) -> str:
    display_w = PANEL_H / INCH
    if back:
        panel_boxes = '''<rect x="0.45" y="0.45" width="3.35" height="10.1" rx="0.19" fill="#FFFFFF"/>
  <rect x="4.70" y="0.45" width="3.35" height="10.1" rx="0.19" fill="#FFFFFF"/>'''
        content = svg_question_table(2.125) + svg_question_table(6.375)
        filename = "back"
    else:
        panel_boxes = '<rect x="0.45" y="0.45" width="3.35" height="10.1" rx="0.19" fill="#F8FAF7" stroke="#005030" stroke-width="0.022"/>'
        name_x = 1.65
        content = f'''<g transform="translate(2.125 5.5) rotate(-90)">
    <image href="{data_uri}" x="{-display_w / 2 + 0.45:g}" y="{- (1.90 * LOGO_ASPECT) / 2:g}" width="1.90" height="{1.90 * LOGO_ASPECT:g}" preserveAspectRatio="none"/>
    <line x1="-1.75" y1="-1.25" x2="-1.75" y2="1.25" stroke="#D6A33A" stroke-width="0.055"/>
    <text x="{name_x:g}" y="0.10" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="0.45" font-weight="700" fill="#000000">Alexander Okonkwo</text>
    <line x1="{name_x - 0.58:g}" y1="-0.48" x2="{name_x + 0.58:g}" y2="-0.48" stroke="#D6A33A" stroke-width="0.045"/>
    <text x="{name_x:g}" y="-0.82" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="0.18" font-weight="700" fill="#41544C">2026 CPP Summer Bridge Program</text>
    <text x="3.88" y="0.30" transform="rotate(-90 3.88 0.30)" font-family="Arial, Helvetica, sans-serif" font-size="0.16" font-weight="700" fill="#005030">1</text>
  </g>'''
        filename = "front"

    return f'''\
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="8.5in" height="11in" viewBox="0 0 8.5 11">
  <title>CPP Hot-Dog Fold Duplex Name Tag Template - {filename}</title>
  <rect width="8.5" height="11" fill="#FFFFFF"/>
  {panel_boxes}
  {content}
  <line x1="4.25" y1="0.45" x2="4.25" y2="10.55" stroke="#5F6F76" stroke-width="0.01" stroke-dasharray="0.055 0.055"/>
</svg>
'''


def build_svgs(data_uri: str) -> None:
    SVG_FRONT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SVG_FRONT_PATH.write_text(svg_page(data_uri, back=False), encoding="utf-8")
    SVG_BACK_PATH.write_text(svg_page(data_uri, back=True), encoding="utf-8")


def build_html(data_uri: str) -> None:
    HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    html = '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CPP Hot-Dog Fold Duplex Name Tag Template</title>
    <style>
      :root { --navy: #174a5b; --cpp-green: #005030; --gold: #d6a33a; --slate: #5f6f76; --pale: #f8faf7; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; background: #dfe5e8; color: var(--navy); font-family: Arial, Helvetica, sans-serif; }
      .controls { width: min(8.5in, calc(100vw - 32px)); margin: 24px auto 16px; padding: 16px 18px; border: 1px solid #c2cdd1; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgb(23 74 91 / 10%); }
      .controls h1 { margin: 0 0 10px; font-size: 18px; }
      .controls p { margin: 0 0 12px; color: var(--slate); font-size: 13px; line-height: 1.4; }
      .controls-row { display: flex; gap: 10px; align-items: center; }
      input { flex: 1; min-width: 0; padding: 10px 12px; border: 1px solid #aebdc3; border-radius: 7px; color: var(--navy); font: inherit; }
      button { padding: 10px 15px; border: 0; border-radius: 7px; background: var(--navy); color: #fff; cursor: pointer; font: 700 13px Arial, Helvetica, sans-serif; }
      .page { position: relative; width: 8.5in; height: 11in; margin: 0 auto 24px; overflow: hidden; background: #fff; }
      .panel { position: absolute; top: 0.45in; width: 3.35in; height: 10.1in; overflow: hidden; border: 1.6px solid var(--cpp-green); border-radius: 0.19in; background: var(--pale); }
      .front .panel { left: 0.45in; }
      .back .panel.left { left: 0.45in; }
      .back .panel.right { left: 4.70in; }
      .oriented-content { position: absolute; top: 50%; left: 50%; width: 10.1in; height: 3.35in; display: flex; align-items: center; justify-content: space-between; padding: 0 0.35in; transform: translate(-50%, -50%) rotate(90deg); transform-origin: center; }
      .front .oriented-content { transform: translate(-50%, -50%) rotate(-90deg); }
      .back .oriented-content { flex-direction: row-reverse; }
      .back .oriented-content { transform: translate(-50%, -50%) rotate(-90deg); }
      .logo { width: 1.90in; height: 2.33in; object-fit: contain; flex: 0 0 auto; }
      .front .oriented-content { justify-content: flex-start; padding: 0; }
      .front .logo { position: absolute; top: 50%; left: 0.45in; transform: translateY(-50%); }
      .brand-divider { position: absolute; top: 0.425in; left: 3.30in; width: 0.055in; height: 2.50in; border-radius: 999px; background: var(--gold); }
      .name-block { width: 5.2in; text-align: center; flex: 0 0 auto; }
      .front .name-block { position: absolute; top: 50%; right: 0.35in; left: 3.30in; width: auto; transform: translateY(-50%); }
      .name { color: #000; font-size: 0.55in; font-weight: 700; line-height: 1; text-align: center; white-space: nowrap; }
      .name-underline { width: 1.55in; height: 0.055in; margin: 0.22in auto 0.20in; border-radius: 999px; background: var(--gold); }
      .program-label { color: #41544c; font-size: 0.18in; font-weight: 700; line-height: 1; text-align: center; white-space: nowrap; }
      .tag-number { position: absolute; top: 0.20in; left: 3.88in; color: var(--cpp-green); font-size: 0.16in; font-weight: 700; line-height: 1; transform: rotate(-90deg); transform-origin: center; }
      .back .panel { border: 0; background: #fff; }
      .questions-wrap { justify-content: center; }
      .questions-table { width: 9.7in; height: 3.25in; border-collapse: collapse; table-layout: fixed; background: #fff; color: var(--navy); font-size: 0.14in; }
      .questions-table th, .questions-table td { border: 0.7px solid var(--navy); padding: 0.04in; }
      .questions-table th { height: 0.45in; background: #dcecf0; font-size: 0.16in; }
      .questions-table td { height: 0.40in; }
      .questions-table th:nth-child(1), .questions-table td:nth-child(1) { width: 0.55in; text-align: center; }
      .questions-table th:nth-child(2), .questions-table td:nth-child(2) { width: 1.15in; text-align: center; }
      .questions-table th:nth-child(3), .questions-table td:nth-child(3) { width: 8.00in; text-align: left; }
      .fold { position: absolute; top: 0.45in; left: 4.25in; height: 10.1in; border-left: 0.7px dashed var(--slate); }
      @media (max-width: 8.7in) { .page { transform-origin: top center; transform: scale(0.85); margin-bottom: -1.6in; } }
      @media print {
        @page { size: Letter portrait; margin: 0; }
        body { background: #fff; }
        .controls { display: none; }
        .page { margin: 0; transform: none; page-break-after: always; }
        .page:last-child { page-break-after: auto; }
      }
    </style>
  </head>
  <body>
    <section class="controls" aria-label="Name tag controls">
      <h1>CPP hot-dog fold duplex name tag</h1>
      <p>Enter a name, print both pages double-sided at 100% / actual size, and fold on the vertical line. The logo and name are rotated so they read horizontally on the finished tent.</p>
      <div class="controls-row">
        <input id="name" type="text" value="Alexander Okonkwo" aria-label="Name" autofocus />
        <button type="button" onclick="window.print()">Print</button>
      </div>
    </section>

    <main>
      <section class="page front" aria-label="Front of paper">
        <div class="panel">
          <div class="oriented-content">
            <img class="logo" src="{{LOGO_DATA_URI}}" alt="Cal Poly Pomona logo" />
            <div class="brand-divider" aria-hidden="true"></div>
            <div class="name-block">
              <div class="name" data-name></div>
              <div class="name-underline" aria-hidden="true"></div>
              <div class="program-label">2026 CPP Summer Bridge Program</div>
            </div>
          </div>
        </div>
        <div class="tag-number" aria-label="Name tag number">1</div>
        <div class="fold" aria-hidden="true"></div>
      </section>

      <section class="page back" aria-label="Back of paper">
        <div class="panel left">
          <div class="oriented-content questions-wrap">
            <table class="questions-table" aria-label="Student questions log">
              <thead><tr><th>No.</th><th>Date</th><th>Questions</th></tr></thead>
              <tbody>
                <tr><td>1</td><td></td><td></td></tr>
                <tr><td>2</td><td></td><td></td></tr>
                <tr><td>3</td><td></td><td></td></tr>
                <tr><td>4</td><td></td><td></td></tr>
                <tr><td>5</td><td></td><td></td></tr>
                <tr><td>6</td><td></td><td></td></tr>
                <tr><td>7</td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="panel right">
          <div class="oriented-content questions-wrap">
            <table class="questions-table" aria-label="Student questions log">
              <thead><tr><th>No.</th><th>Date</th><th>Questions</th></tr></thead>
              <tbody>
                <tr><td>1</td><td></td><td></td></tr>
                <tr><td>2</td><td></td><td></td></tr>
                <tr><td>3</td><td></td><td></td></tr>
                <tr><td>4</td><td></td><td></td></tr>
                <tr><td>5</td><td></td><td></td></tr>
                <tr><td>6</td><td></td><td></td></tr>
                <tr><td>7</td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="fold" aria-hidden="true"></div>
      </section>
    </main>

    <script>
      const input = document.querySelector('#name');
      const nodes = document.querySelectorAll('[data-name]');
      function updateName() {
        const value = input.value.trim() || 'Alexander Okonkwo';
        const length = value.length;
        const size = length > 20 ? '0.42in' : length > 14 ? '0.48in' : '0.55in';
        nodes.forEach((node) => { node.textContent = value; node.style.fontSize = size; });
      }
      input.addEventListener('input', updateName);
      updateName();
    </script>
  </body>
</html>
'''.replace('{{LOGO_DATA_URI}}', data_uri)
    HTML_PATH.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    data_uri = logo_data_uri()
    build_pdf()
    build_svgs(data_uri)
    build_html(data_uri)
    print(PDF_PATH)
    print(SVG_FRONT_PATH)
    print(SVG_BACK_PATH)
    print(HTML_PATH)
