// pure function — takes data, returns a LaTeX string
// no React, no side effects, just string building

// fields is an array of { id, label, value, showLabel }
// watermarkBase64 is either null (no watermark) or a base64 image string
const generateLatex = (fields, programs, watermarkBase64 = null, watermarkFilename = 'watermark.png') => {

  // build the student info lines from the fields array
  // if showLabel is true → "Label: Value", otherwise just "Value"
  const infoLines = fields
    .filter(f => f.value.trim() !== '')   // skip empty fields
    .map(f => f.showLabel ? `${f.label}: ${f.value}` : f.value)
    .join('\\\\\n  ')                      // each line separated by LaTeX newline

  // ── PREAMBLE ──────────────────────────────────────────
  // built as a template literal — one big string with ${} insertions
  const preamble = `\\documentclass[12pt,a4paper]{article}

% ── Packages ──────────────────────────────────────────────
\\usepackage[a4paper, top=2.2cm, bottom=2cm, left=2.5cm, right=2.5cm]{geometry}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{parskip}
\\usepackage{graphicx}${watermarkBase64 ? '\n\\usepackage{eso-pic}' : ''}

% ── Colours ───────────────────────────────────────────────
\\definecolor{codecyan}{RGB}{0,180,200}
\\definecolor{codepink}{RGB}{224,92,138}
\\definecolor{codegrey}{RGB}{128,128,128}
\\definecolor{linenumcol}{RGB}{160,175,195}
\\definecolor{infogrey}{RGB}{150,150,150}
\\definecolor{commentgreen}{RGB}{0,180,80}

% ── Code style ────────────────────────────────────────────
\\lstdefinestyle{cstyle}{
  language=C,
  basicstyle=\\small\\ttfamily,
  keywordstyle=\\bfseries,
  keywordstyle=[2]\\color{codecyan},
  morekeywords=[2]{printf, scanf, sqrt, pow},
  commentstyle=\\color{commentgreen}\\itshape,
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  stringstyle=\\color{codepink},
  numbers=left,
  numberstyle=\\tiny\\color{linenumcol},
  numbersep=10pt,
  stepnumber=1,
  breaklines=true,
  breakindent=2em,
  showstringspaces=false,
  tabsize=4,
  frame=none,
  xleftmargin=2em,
  literate=
    {0}{{\\textcolor{codecyan}{0}}}{1}
    {1}{{\\textcolor{codecyan}{1}}}{1}
    {2}{{\\textcolor{codecyan}{2}}}{1}
    {3}{{\\textcolor{codecyan}{3}}}{1}
    {4}{{\\textcolor{codecyan}{4}}}{1}
    {5}{{\\textcolor{codecyan}{5}}}{1}
    {6}{{\\textcolor{codecyan}{6}}}{1}
    {7}{{\\textcolor{codecyan}{7}}}{1}
    {8}{{\\textcolor{codecyan}{8}}}{1}
    {9}{{\\textcolor{codecyan}{9}}}{1},
}

% ── Output style ──────────────────────────────────────────
\\lstdefinestyle{outputstyle}{
  basicstyle=\\small\\ttfamily,
  numbers=none,
  frame=none,
  xleftmargin=0pt,
  breaklines=true,
}

% ── No page numbers ───────────────────────────────────────
\\pagestyle{empty}

% ── Student info block ────────────────────────────────────
\\newcommand{\\studentinfo}{%
  {\\color{infogrey}
  ${infoLines}}%
  \\vspace{10pt}
}
${watermarkBase64 ? `
% ── Watermark ─────────────────────────────────────────────
\\AddToShipoutPictureBG{%
  \\includegraphics[width=\\paperwidth,height=\\paperheight]{${watermarkFilename}}%
}` : ''}
\\setlength{\\parskip}{4pt}`

  // ── DOCUMENT BODY ─────────────────────────────────────
  // map over each program and build its LaTeX block
  const body = programs.map((program, index) => {
    // escape any backslashes already in the code/output
    // (users paste raw C code which is fine — lstlisting handles it)
    const isLast = index === programs.length - 1

    return `
% ─────────────────────────────────────────────────────────
%  Program ${index + 1}${program.title && program.title !== `Program ${index + 1}` ? ` — ${program.title}` : ''}
% ─────────────────────────────────────────────────────────
\\studentinfo

\\textbf{Program :}

\\begin{lstlisting}[style=cstyle]
${program.code}
\\end{lstlisting}

\\vspace{8pt}
\\textbf{Output:}

\\begin{lstlisting}[style=outputstyle]
${program.output}
\\end{lstlisting}
${isLast ? '' : '\n\\newpage'}`
  }).join('\n')

  // ── FINAL ASSEMBLY ────────────────────────────────────
  return `${preamble}

% ══════════════════════════════════════════════════════════
\\begin{document}
% ══════════════════════════════════════════════════════════
${body}

\\end{document}
`
}

export default generateLatex