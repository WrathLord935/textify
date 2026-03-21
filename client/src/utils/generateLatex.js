// pure function — takes data, returns a LaTeX string
// no React, no side effects, just string building

const defaultSettings = {
  appearance: { keywordColor: '#00b4c8', stringColor: '#e05c8a', commentColor: '#00b450', lineNumberColor: '#a0afc3' },
  layout: { fontSize: '12pt', programSpacing: '8' },
  visibility: { showStudentInfo: true, showProgramTitle: true, showCode: true, showOutput: true },
  margins: { top: '2.2', bottom: '2.0', left: '2.5', right: '2.5' }
}

const hexToLatex = (hex) => {
  if (!hex || hex.length !== 7 || !hex.startsWith('#')) return '000000'
  return hex.replace('#', '').toUpperCase()
}

// fields is an array of { id, label, value, showLabel }
// watermarkBase64 is either null (no watermark) or a base64 image string
const generateLatex = (fields, programs, watermarkBase64 = null, watermarkFilename = 'watermark.png', opacity = 0.15, marginX = 0, marginY = 0, settings = defaultSettings) => {

  // build the student info lines from the fields array
  // if showLabel is true → "Label: Value", otherwise just "Value"
  const infoLines = fields
    .filter(f => f.value.trim() !== '')   // skip empty fields
    .map(f => f.showLabel ? `${f.label}: ${f.value}` : f.value)
    .join('\\\\\n  ')                      // each line separated by LaTeX newline

  const studentInfoCmd = settings.visibility.showStudentInfo && fields.some(f => f.value.trim() !== '') ? `
% ── Student info block ────────────────────────────────────
\\newcommand{\\studentinfo}{%
  {\\color{infogrey}
  ${infoLines}}%
  \\vspace{10pt}
}` : `\\newcommand{\\studentinfo}{}`

  // ── PREAMBLE ──────────────────────────────────────────
  // built as a template literal — one big string with ${} insertions
  const fontSize = parseInt(settings.layout.fontSize) || 12
  const preamble = `\\documentclass[${fontSize}pt,a4paper]{extarticle}

% ── Packages ──────────────────────────────────────────────
\\usepackage[a4paper, top=${settings.margins.top}cm, bottom=${settings.margins.bottom}cm, left=${settings.margins.left}cm, right=${settings.margins.right}cm]{geometry}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{parskip}
\\usepackage{graphicx}${watermarkBase64 ? '\n\\usepackage{eso-pic}\n\\usepackage{transparent}' : ''}

% ── Colours ───────────────────────────────────────────────
\\definecolor{codecyan}{HTML}{${hexToLatex(settings.appearance.keywordColor || '#00b4c8')}}
\\definecolor{codepink}{HTML}{${hexToLatex(settings.appearance.stringColor || '#e05c8a')}}
\\definecolor{codegrey}{RGB}{128,128,128}
\\definecolor{linenumcol}{HTML}{${hexToLatex(settings.appearance.lineNumberColor || '#a0afc3')}}
\\definecolor{infogrey}{RGB}{150,150,150}
\\definecolor{commentgreen}{HTML}{${hexToLatex(settings.appearance.commentColor || '#00b450')}}
\\definecolor{operatorcol}{HTML}{${hexToLatex(settings.appearance.operatorColor || '#ff8c00')}}
\\definecolor{specifiercol}{HTML}{${hexToLatex(settings.appearance.specifierColor || '#b400c8')}}
\\definecolor{funccol}{HTML}{${hexToLatex(settings.appearance.functionColor || '#e6db74')}}
\\definecolor{numcol}{HTML}{${hexToLatex(settings.appearance.numberColor || '#ae81ff')}}
\\definecolor{directivecol}{HTML}{${hexToLatex(settings.appearance.directiveColor || '#f92672')}}
\\definecolor{headercol}{HTML}{${hexToLatex(settings.appearance.headerColor || '#fd971f')}}

% ── Code style ────────────────────────────────────────────
\\lstdefinestyle{cstyle}{
  language=C,
  basicstyle=\\small\\ttfamily,
  keywordstyle=\\color{codecyan}\\bfseries,
  morekeywords=[2]{printf, scanf, sprintf, fprintf, perror, malloc, free, calloc, realloc, exit, main},
  keywordstyle=[2]\\color{funccol},
  commentstyle=\\color{commentgreen}\\itshape,
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  moredelim=*[l][\\color{directivecol}]{\\#},
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
    {<stdio.h>}{{\\textcolor{headercol}{<stdio.h>}}}{9}
    {<stdlib.h>}{{\\textcolor{headercol}{<stdlib.h>}}}{10}
    {<string.h>}{{\\textcolor{headercol}{<string.h>}}}{10}
    {<math.h>}{{\\textcolor{headercol}{<math.h>}}}{8}
    {<ctype.h>}{{\\textcolor{headercol}{<ctype.h>}}}{9}
    {<stdbool.h>}{{\\textcolor{headercol}{<stdbool.h>}}}{11}
    {<stdint.h>}{{\\textcolor{headercol}{<stdint.h>}}}{10}
    {<time.h>}{{\\textcolor{headercol}{<time.h>}}}{8}
    {+}{{\\textcolor{operatorcol}{+}}}{1}
    {-}{{\\textcolor{operatorcol}{-}}}{1}
    {=}{{\\textcolor{operatorcol}{=}}}{1}
    {<}{{\\textcolor{operatorcol}{<}}}{1}
    {>}{{\\textcolor{operatorcol}{>}}}{1}
    {*}{{\\textcolor{operatorcol}{*}}}{1}
    {/}{{\\textcolor{operatorcol}{/}}}{1}
    {|}{{\\textcolor{operatorcol}{|}}}{1}
    {!}{{\\textcolor{operatorcol}{!}}}{1}
    {^}{{\\textcolor{operatorcol}{^}}}{1}
    {0}{{\\textcolor{numcol}{0}}}{1}
    {1}{{\\textcolor{numcol}{1}}}{1}
    {2}{{\\textcolor{numcol}{2}}}{1}
    {3}{{\\textcolor{numcol}{3}}}{1}
    {4}{{\\textcolor{numcol}{4}}}{1}
    {5}{{\\textcolor{numcol}{5}}}{1}
    {6}{{\\textcolor{numcol}{6}}}{1}
    {7}{{\\textcolor{numcol}{7}}}{1}
    {8}{{\\textcolor{numcol}{8}}}{1}
    {9}{{\\textcolor{numcol}{9}}}{1},
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
${studentInfoCmd}
${watermarkBase64 ? `
% ── Watermark ─────────────────────────────────────────────
\\AddToShipoutPictureBG{%
  \\put(${marginX}, ${marginY}){%
    \\transparent{${opacity}}%
    \\includegraphics[width=\\paperwidth,height=\\paperheight]{${watermarkFilename}}%
  }%
}` : ''}
\\setlength{\\parskip}{4pt}`

  // ── DOCUMENT BODY ─────────────────────────────────────
  // map over each program and build its LaTeX block
  const body = programs.map((program, index) => {
    // escape any backslashes already in the code/output
    // (users paste raw C code which is fine — lstlisting handles it)
    const isLast = index === programs.length - 1

    let block = ''
    if (settings.visibility.showProgramTitle) {
      block += `
% ─────────────────────────────────────────────────────────
%  Program ${index + 1}${program.title && program.title !== `Program ${index + 1}` ? ` — ${program.title}` : ''}
% ─────────────────────────────────────────────────────────
`
    }
    
    block += `\\studentinfo\n`

    if (settings.visibility.showCode) {
      block += `
\\textbf{Program :}

\\begin{lstlisting}[style=cstyle]
${program.code}
\\end{lstlisting}
`
    }

    if (settings.visibility.showOutput) {
      block += `
\\vspace{${settings.layout.programSpacing}pt}
\\textbf{Output:}

\\begin{lstlisting}[style=outputstyle]
${program.output}
\\end{lstlisting}
`
    }

    block += `${isLast ? '' : '\n\\newpage'}`
    return block
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