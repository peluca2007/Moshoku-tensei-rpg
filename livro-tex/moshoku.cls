%% ============================================================================
%%  moshoku.cls — classe do livro de regras de Moshoku Tensei RPG
%%
%%  Compila em LuaLaTeX (recomendado), XeLaTeX ou pdfLaTeX. No Overleaf, deixe
%%  o compilador em LuaLaTeX: é o único caminho que carrega as fontes
%%  Libertinus por nome e produz o resultado que este arquivo foi desenhado
%%  pra produzir. Em pdfLaTeX ele cai automaticamente no pacote `libertinus`,
%%  que dá o mesmo desenho de letra por outro caminho.
%%
%%  Dependências: todas presentes no TeX Live completo do Overleaf. Nenhum
%%  pacote de terceiros fora do CTAN, nenhum pacote abandonado.
%% ============================================================================
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{moshoku}[2026/08/29 Livro de regras Moshoku Tensei RPG]

\newif\ifmoshoku@draft
\DeclareOption{draft}{\moshoku@drafttrue}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{book}}
\ProcessOptions\relax
\LoadClass[11pt,twoside,openright]{book}

% ---------------------------------------------------------------------------
%  1. Página
% ---------------------------------------------------------------------------
\RequirePackage[
    a4paper,
    inner = 26mm, outer = 20mm,
    top   = 22mm, bottom = 24mm,
    headsep = 7mm, footskip = 12mm,
]{geometry}

\RequirePackage{iftex}
\RequirePackage{microtype}
\RequirePackage[table,dvipsnames]{xcolor}
\RequirePackage{graphicx}
\RequirePackage{booktabs}
\RequirePackage{longtable}
\RequirePackage{array}
\RequirePackage{ragged2e}
\RequirePackage{enumitem}
\RequirePackage{titlesec}
\RequirePackage{fancyhdr}
\RequirePackage[most]{tcolorbox}
\RequirePackage{multicol}
\RequirePackage{needspace}
\RequirePackage[hidelinks]{hyperref}

% ---------------------------------------------------------------------------
%  2. Paleta — os mesmos valores de src/app/globals.css, pro PDF e o site
%     não parecerem dois produtos diferentes.
% ---------------------------------------------------------------------------
\definecolor{parchment50} {HTML}{FDF6E3}
\definecolor{parchment100}{HTML}{F7EEDA}
\definecolor{parchment200}{HTML}{EEE0C4}
\definecolor{parchment300}{HTML}{DFCBA3}
\definecolor{parchment600}{HTML}{726040}
\definecolor{parchment800}{HTML}{43392A}
\definecolor{parchment900}{HTML}{2B1810}
\definecolor{wine400}     {HTML}{C9527A}
\definecolor{wine500}     {HTML}{8E2F55}
\definecolor{wine600}     {HTML}{4A0E2E}
\definecolor{gold300}     {HTML}{E2BA5E}
\definecolor{gold500}     {HTML}{B8862E}
\definecolor{gold600}     {HTML}{8A6318}

\colorlet{corpotexto}{parchment900}
\colorlet{regra}{parchment300}

% ---------------------------------------------------------------------------
%  3. Tipografia
% ---------------------------------------------------------------------------
\ifPDFTeX
    \RequirePackage[T1]{fontenc}
    \RequirePackage[utf8]{inputenc}
    \RequirePackage{libertinus}
    \RequirePackage{inconsolata}
\else
    \RequirePackage{fontspec}
    \setmainfont{Libertinus Serif}[Numbers = OldStyle, Ligatures = TeX]
    \setsansfont{Libertinus Sans}[Ligatures = TeX]
    \setmonofont{Inconsolata}[Scale = MatchLowercase]
    \newfontfamily\displayfont{Libertinus Serif}[Numbers = Lining, Ligatures = TeX]
\fi
\providecommand{\displayfont}{\normalfont}

\RequirePackage[brazil]{babel}
\RequirePackage{csquotes}

\linespread{1.06}
\setlength{\parskip}{0pt}
\setlength{\parindent}{1.2em}
\color{corpotexto}

% Números pequenos e versaletes, usados nos rótulos de bloco.
\newcommand{\rotulo}[1]{{\sffamily\bfseries\footnotesize\MakeUppercase{#1}}}

% ---------------------------------------------------------------------------
%  4. Títulos
% ---------------------------------------------------------------------------
\titleformat{\chapter}[display]
    {\displayfont\filright}
    {\color{gold600}\sffamily\bfseries\large Capítulo \thechapter}
    {6pt}
    {\color{wine600}\Huge\bfseries}
    [\vspace{4pt}{\color{gold300}\titlerule[1.2pt]}]
\titlespacing*{\chapter}{0pt}{0pt}{28pt}

\titleformat{\section}
    {\needspace{4\baselineskip}\displayfont\Large\bfseries\color{wine600}}
    {\color{gold600}\thesection}{0.7em}{}
\titlespacing*{\section}{0pt}{18pt plus 4pt minus 2pt}{7pt}

\titleformat{\subsection}
    {\needspace{3\baselineskip}\sffamily\large\bfseries\color{parchment800}}
    {}{0pt}{}
\titlespacing*{\subsection}{0pt}{13pt plus 3pt minus 1pt}{4pt}

\titleformat{\subsubsection}
    {\needspace{3\baselineskip}\sffamily\bfseries\color{gold600}}
    {}{0pt}{}
\titlespacing*{\subsubsection}{0pt}{10pt plus 2pt}{3pt}

\setcounter{secnumdepth}{1}
\setcounter{tocdepth}{1}

% ---------------------------------------------------------------------------
%  5. Cabeçalho e rodapé
% ---------------------------------------------------------------------------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\headrule}{\hbox to\headwidth{\color{regra}\leaders\hrule height \headrulewidth\hfill}}
\fancyhead[LE]{\sffamily\footnotesize\color{parchment600}\leftmark}
\fancyhead[RO]{\sffamily\footnotesize\color{parchment600}\rightmark}
\fancyfoot[LE,RO]{\sffamily\footnotesize\color{parchment600}\thepage}
\renewcommand{\chaptermark}[1]{\markboth{#1}{}}
\renewcommand{\sectionmark}[1]{\markright{#1}}
\fancypagestyle{plain}{\fancyhf{}\renewcommand{\headrulewidth}{0pt}%
    \fancyfoot[LE,RO]{\sffamily\footnotesize\color{parchment600}\thepage}}

% ---------------------------------------------------------------------------
%  6. Listas
% ---------------------------------------------------------------------------
\setlist[itemize]{leftmargin=1.25em, itemsep=2pt, topsep=4pt, parsep=0pt,
                  label=\textcolor{gold500}{\textbullet}}
\setlist[enumerate]{leftmargin=1.5em, itemsep=2pt, topsep=4pt, parsep=0pt,
                    font=\color{gold600}\bfseries}
\setlist[description]{leftmargin=1.25em, itemsep=3pt, topsep=4pt,
                      font=\sffamily\bfseries\color{parchment800}}

% ---------------------------------------------------------------------------
%  7. Caixas — os três tons que o livro usa, e mais nada.
%     \begin{nota}{Título}   ... comentário de design, fundo pergaminho
%     \begin{aviso}{Título}  ... regra que corrige um abuso, borda vinho
%     \begin{exemplo}{Título}... exemplo jogado na mesa, borda dourada
% ---------------------------------------------------------------------------
\tcbset{
    moshokubase/.style = {
        enhanced, breakable,
        boxrule = 0pt, arc = 2pt, outer arc = 2pt,
        left = 8pt, right = 8pt, top = 6pt, bottom = 6pt,
        toptitle = 2pt, bottomtitle = 2pt,
        fonttitle = \sffamily\bfseries\small,
        coltitle = parchment900,
        before skip = 9pt, after skip = 9pt,
    }
}

\newtcolorbox{nota}[1]{moshokubase,
    colback = parchment100, colbacktitle = parchment200,
    borderline west = {2pt}{0pt}{gold300},
    title = {#1}}

\newtcolorbox{aviso}[1]{moshokubase,
    colback = wine600!5, colbacktitle = wine600!12,
    borderline west = {2pt}{0pt}{wine500},
    coltitle = wine600,
    title = {#1}}

\newtcolorbox{exemplo}[1]{moshokubase,
    colback = gold300!12, colbacktitle = gold300!25,
    borderline west = {2pt}{0pt}{gold500},
    coltitle = gold600,
    title = {#1}}

% Fórmula em destaque — usada nos Cálculos Vitais.
\newtcolorbox{formula}{moshokubase,
    colback = parchment50, colframe = gold300, boxrule = 0.8pt,
    halign = center, fontupper = \displayfont\large}

% ---------------------------------------------------------------------------
%  8. Bloco de estatísticas — o macro que o livro mais usa.
%
%  \node{Nome}{rótulos}{corpo}
%     rótulos: linha de metadados já formatada (custo, alcance, ações)
%
%  \magia{Nome}{◆ ou vazio}{PA}{PM}{Ações}{Alcance}{Efeito}{Cântico}
%  \tecnica{Nome}{◆}{PA}{PT}{Ações}{Alcance}{Efeito}
%  \talento{Nome}{PA}{Efeito}
%  \maestria{Nome}{Efeito}
% ---------------------------------------------------------------------------
\newcommand{\assinatura}{{\color{gold500}$\blacklozenge$}}
\newcommand{\simbmaestria}{{\color{wine500}$\blacklozenge$}}

\newcommand{\moshoku@meta}[1]{%
    {\sffamily\scriptsize\color{parchment600}#1\par}\vspace{2pt}}

% Bloco genérico. Fica junto na quebra de página sempre que cabe.
\newenvironment{statblock}[2]{%
    \par\needspace{3.5\baselineskip}\vspace{5pt}%
    \noindent{\sffamily\bfseries\color{wine600}#1}%
    \par\moshoku@meta{#2}%
    \begingroup\small\setlength{\parindent}{0pt}%
}{\endgroup\par\vspace{3pt}}

\newcommand{\magia}[8]{%
    \begin{statblock}{#1\ifx\relax#2\relax\else\ \assinatura\fi}%
        {#3~PA \textbullet\ \ifx\relax#4\relax sem custo de PM\else #4~PM\fi
         \textbullet\ #5 \textbullet\ #6}%
        #7%
        \ifx\relax#8\relax\else\par\vspace{2pt}{\itshape\color{parchment600}\enquote{#8}}\fi
    \end{statblock}}

\newcommand{\tecnica}[7]{%
    \begin{statblock}{#1\ifx\relax#2\relax\else\ \assinatura\fi}%
        {#3~PA \textbullet\ \ifx\relax#4\relax sem custo de PT\else #4~PT\fi
         \textbullet\ #5 \textbullet\ #6}%
        #7%
    \end{statblock}}

\newcommand{\talento}[3]{%
    \begin{statblock}{#1}{#2~PA \textbullet\ Talento}#3\end{statblock}}

\newcommand{\maestria}[2]{%
    \begin{statblock}{\simbmaestria\ #1}{Maestria \textbullet\ gratuita, automática, não conta como conhecimento}#2\end{statblock}}

% ---------------------------------------------------------------------------
%  9. Cabeçalho de árvore e de patamar
% ---------------------------------------------------------------------------
\newtcolorbox{arvorecard}[3]{moshokubase,
    colback = parchment100, colframe = gold300, boxrule = 0.6pt,
    title = {#1 \normalfont\sffamily\footnotesize\color{parchment600}— #2},
    after title = {}, fontupper = \small,
    before upper = {\textbf{Atributo-chave:} #3\par}}

\newcommand{\patamar}[2]{%
    \par\needspace{5\baselineskip}\vspace{9pt}%
    \noindent\colorbox{wine600}{\makebox[\linewidth-2\fboxsep][l]{%
        \strut\sffamily\bfseries\small\color{parchment50}\,#1%
        \hfill{\normalfont\sffamily\scriptsize\color{parchment200}#2\,}}}%
    \par\vspace{5pt}}

% ---------------------------------------------------------------------------
%  10. Tabelas — um único visual, sem linhas verticais.
%      \begin{tabelalivro}{colunas}{Legenda} ... \end{tabelalivro}
% ---------------------------------------------------------------------------
\newcolumntype{L}[1]{>{\RaggedRight\arraybackslash}p{#1}}
\newcolumntype{C}[1]{>{\Centering\arraybackslash}p{#1}}

\newenvironment{tabelalivro}[2]{%
    \par\vspace{7pt}%
    \ifx\relax#2\relax\else{\sffamily\bfseries\small\color{parchment800}#2\par\vspace{3pt}}\fi
    \small\rowcolors{2}{parchment50}{white}%
    \begin{longtable}{#1}\toprule
}{%
    \bottomrule\end{longtable}\vspace{5pt}%
}
\newcommand{\cabtabela}[1]{\rowcolor{parchment200}#1\\\midrule\endhead}

% ---------------------------------------------------------------------------
%  11. Auxiliares de texto
% ---------------------------------------------------------------------------
\newcommand{\termo}[1]{\textbf{#1}}                                  % termo definido
\newcommand{\cond}[1]{{\sffamily\bfseries\color{wine500}#1}}         % condição do glossário
\newcommand{\rec}[1]{{\sffamily\bfseries\color{gold600}#1}}          % PV/PM/PT/PP/PA
\newcommand{\dado}[1]{{\ttfamily #1}}                                % 2d6+3
\newcommand{\ref}[1]{{\footnotesize\color{parchment600}(#1)}}        % (Cap. 4, §1)

\endinput
