import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'DOC-RENAME — Renommage documentaire par métier',
  description:
    "Choisissez un profil métier puis appliquez une structure de nommage claire à vos fichiers. Traitement local, sans upload.",
  metadataBase: new URL('https://bimdoc-renamer.vercel.app'),
  openGraph: {
    type: 'website',
    title: 'DOC-RENAME — Renommer vos documents selon votre métier',
    description:
      'Profils BIM, finance, RH, santé, administratif, juridique, industrie, immobilier ou convention personnalisée. Tout se passe dans le navigateur, sans upload.',
    url: 'https://bimdoc-renamer.vercel.app',
    siteName: 'DOC-RENAME',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOC-RENAME',
    description: 'Renommage documentaire local par profils métier, sans compte.',
  },
  alternates: {
    canonical: 'https://bimdoc-renamer.vercel.app',
    languages: {
      fr: 'https://bimdoc-renamer.vercel.app',
      'x-default': 'https://bimdoc-renamer.vercel.app',
    },
  },
  other: {
    'theme-color': '#F4ECDC',
    'color-scheme': 'light',
  },
};

const LANDING_CSS = `
  :root{
    --paper:#F2F4EF;
    --paper-2:#E7EEE7;
    --paper-3:#D5DFDA;
    --ink:#2B2218;
    --ink-soft:#5A4B3A;
    --ink-mute:#897965;
    --brick:#B84A35;
    --brick-deep:#8C3722;
    --gold:#B98A32;
    --gold-soft:#D6AC58;
    --olive:#5C6B3A;
    --line:#C9D4CB;
    --line-2:#AEBFB4;
    --shadow-soft: 0 1px 2px rgba(43,34,24,.08), 0 20px 50px -28px rgba(43,34,24,.30);
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  html{scroll-behavior:smooth}
  :focus-visible{
    outline:3px solid var(--gold);
    outline-offset:4px;
  }
  body{
    background:var(--paper);
    color:var(--ink);
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-weight:400;
    font-size:17px;
    line-height:1.55;
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
    overflow-x:hidden;
    position:relative;
  }

  /* warm paper texture via SVG noise */
  body::before{
    content:"";
    position:fixed;inset:0;
    pointer-events:none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='5' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .1  0 0 0 .12 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/></svg>");
    opacity:.5;
    mix-blend-mode:multiply;
    z-index:0;
  }
  body::after{
    /* warm vignette */
    content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
    background: radial-gradient(ellipse at 50% 20%, transparent 50%, rgba(112,82,46,.10) 100%);
  }

  .frame{
    position:relative;z-index:1;
    max-width:1320px;
    margin:0 auto;
    padding:0 clamp(22px,5vw,72px);
  }

  /* ---------- NAV ---------- */
  nav.top{
    display:flex;align-items:center;justify-content:space-between;
    padding:34px 0 0;
    position:relative;z-index:5;
  }
  .brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);}
  .brand .logo-mark{
    display:inline-flex;align-items:center;justify-content:center;
    width:32px;height:32px;
    background:var(--ink);
    color:var(--paper);
    border-radius:6px;
    border:1px solid rgba(43,34,24,.2);
    flex:none;
  }
  .brand .logo-mark svg{width:18px;height:18px}
  .brand .wm{font-family:'Geist',sans-serif;font-weight:600;letter-spacing:-.01em;font-size:18px}
  .brand .small{font-family:'Geist',sans-serif;font-style:normal;font-size:13px;color:var(--ink-mute);margin-left:4px;font-weight:400}
  nav.top .menu{
    list-style:none;display:flex;gap:30px;margin:0;padding:0;
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-size:15px;font-weight:500;
  }
  nav.top .menu a{
    color:var(--ink);text-decoration:none;
    border-bottom:1px solid transparent;padding-bottom:2px;
    transition:border-color .2s ease, color .2s ease;
  }
  nav.top .menu a:hover{border-color:var(--brick);color:var(--brick)}
  nav.top .cta-mini{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:600;
    font-size:14.5px;
    background:var(--ink);color:var(--paper);
    padding:11px 18px;border-radius:999px;
    text-decoration:none;display:inline-flex;align-items:center;gap:8px;
    transition:transform .2s ease, background .2s ease;
  }
  nav.top .cta-mini:hover{background:var(--brick);transform:translateY(-1px)}

  /* ---------- HERO ---------- */
  header.hero{
    padding:clamp(70px,12vh,160px) 0 clamp(50px,8vh,100px);
    position:relative;
  }
  .badge-no-account{
    display:inline-flex;align-items:center;gap:10px;
    background:var(--paper-2);
    border:1px solid var(--line);
    padding:8px 14px 8px 10px;
    border-radius:999px;
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-size:13.5px;font-weight:500;color:var(--ink-soft);
    margin-bottom:28px;
  }
  .badge-no-account .dot{
    width:8px;height:8px;border-radius:50%;background:var(--olive);
    box-shadow:0 0 0 4px rgba(92,107,58,.15);
  }
  .badge-no-account em{
    font-style:italic;color:var(--brick);font-weight:500;
    margin:0 4px;
  }

  h1.display{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-weight:300;
    font-size:clamp(48px,8vw,118px);
    line-height:.92;
    letter-spacing:-.035em;
    margin:0 0 32px;
    color:var(--ink);
    max-width:14ch;
  }
  h1.display em{
    font-family:var(--font-newsreader),serif;
    font-style:italic;
    font-weight:400;
    color:var(--brick);
    letter-spacing:-.015em;
  }
  h1.display .scribble{
    position:relative;display:inline-block;
  }
  h1.display .scribble svg{
    position:absolute;left:-4%;bottom:-12%;width:108%;height:36%;
    pointer-events:none;
  }
  h1.display .scribble svg path{
    fill:none;stroke:var(--gold);stroke-width:6;stroke-linecap:round;
    stroke-dasharray:600;stroke-dashoffset:600;
    animation:draw 1.4s ease-out 0.6s forwards;
  }
  @keyframes draw{to{stroke-dashoffset:0}}

  .lede{
    max-width:560px;
    font-size:clamp(18px,1.4vw,21px);
    line-height:1.5;
    color:var(--ink-soft);
    margin:0 0 36px;
  }
  .lede strong{color:var(--ink);font-weight:600}
  .lede .accent{
    font-style:italic;
    color:var(--brick);
    font-weight:500;
  }

  .hero-cta{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
  .btn{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-weight:500;font-size:15.5px;
    display:inline-flex;align-items:center;gap:10px;
    padding:15px 26px;
    border-radius:999px;
    text-decoration:none;
    border:1.5px solid var(--ink);
    cursor:pointer;background:none;color:var(--ink);
    transition:transform .25s ease, background .25s ease, color .25s ease, border-color .25s ease;
  }
  .btn-primary{background:var(--ink);color:var(--paper)}
  .btn-primary:hover{background:var(--brick);border-color:var(--brick);transform:translateY(-1px)}
  .btn-ghost:hover{background:var(--ink);color:var(--paper)}
  .btn .arrow{transition:transform .25s ease;font-style:italic;font-size:1.1em}
  .btn:hover .arrow{transform:translateX(4px)}

  .hero-note{
    margin-top:18px;
    font-style:italic;font-weight:500;font-size:18px;
    color:var(--brick);
    display:inline-flex;align-items:center;gap:10px;
  }
  .hero-note svg{width:32px;height:24px;flex:none}
  .hero-note svg path{fill:none;stroke:var(--brick);stroke-width:2;stroke-linecap:round}

  /* hero decorative mark, top right */
  .stamp{
    position:absolute;
    right:clamp(20px,5vw,72px);top:clamp(120px,16vh,200px);
    width:clamp(110px,11vw,160px);
    aspect-ratio:1;
    border:1.5px solid var(--brick);
    border-radius:50%;
    color:var(--brick);
    display:grid;place-items:center;
    transform:rotate(-12deg);
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    text-align:center;font-size:11px;letter-spacing:.16em;font-weight:600;
    line-height:1.6;
    opacity:.85;
  }
  .stamp::before{
    content:"";position:absolute;inset:6px;border:1px dashed var(--brick);border-radius:50%;
    opacity:.4;
  }
  .stamp em{
    font-style:italic;display:block;
    font-size:22px;letter-spacing:0;margin-top:4px;font-weight:400;
  }

  /* ---------- SECTION COMMON ---------- */
  section{
    padding:clamp(70px,10vh,130px) 0;
    position:relative;
    content-visibility:auto;
    contain-intrinsic-size:auto 780px;
  }
  .div-rule{
    width:100%;height:1px;background:var(--line-2);
    position:relative;
  }
  .div-rule::before{
    content:"";
    position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:14px;height:14px;background:var(--paper);
    border:1px solid var(--line-2);border-radius:50%;
  }
  .div-rule::after{
    content:"";
    position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:6px;height:6px;background:var(--brick);border-radius:50%;
  }

  .kicker{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:13px;
    letter-spacing:.04em;text-transform:uppercase;
    color:var(--brick);
    display:inline-block;margin-bottom:14px;
  }
  .kicker .num{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:600;
    font-size:14px;color:var(--ink-mute);letter-spacing:.04em;
    background:var(--paper-2);padding:3px 8px;border-radius:6px;margin-right:8px;
    transform:rotate(1deg);display:inline-block;
  }
  .section-title{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-weight:400;
    font-size:clamp(36px,5vw,62px);
    line-height:1.03;letter-spacing:-.028em;
    margin:0 0 22px;color:var(--ink);
    max-width:18ch;
  }
  .section-title em{
    font-family:var(--font-newsreader),serif;font-style:italic;font-weight:400;color:var(--brick);
  }
  .section-sub{
    max-width:620px;
    font-size:18px;line-height:1.55;color:var(--ink-soft);
    margin:0;
  }
  .mt-problem{margin-top:54px}
  .mt-how{margin-top:60px}
  .mt-norms,.mt-manifesto{margin-top:50px}
  .mb-demo-sub{margin-bottom:36px}
  .mb-feats-sub{margin-bottom:46px}

  /* ---------- PROBLEM ---------- */
  .problem-wrap{
    display:grid;grid-template-columns: 1.1fr .9fr;gap:clamp(36px,5vw,80px);
    align-items:start;
  }
  .problem-text p{
    font-size:19px;line-height:1.65;color:var(--ink-soft);margin:0 0 22px;
  }
  .problem-text p strong{color:var(--ink);font-weight:600}
  .problem-text p em{color:var(--brick);font-style:italic}
  .problem-text .pull{
    font-family:var(--font-newsreader),serif;font-style:italic;
    font-size:26px;line-height:1.35;color:var(--ink);
    margin:36px 0 0;padding-left:28px;
    border-left:3px solid var(--brick);
  }

  .file-mess{
    background:#fff;
    border:1px solid var(--line);
    padding:24px 26px;
    border-radius:6px;
    box-shadow:var(--shadow-soft);
    transform:rotate(1.5deg);
    position:relative;
  }
  .file-mess::before{
    content:"vu dans la vraie vie ✶";
    position:absolute;top:-14px;left:18px;
    background:var(--gold);color:var(--ink);
    font-style:italic;font-weight:600;font-size:16px;
    padding:2px 14px 4px;border-radius:4px;
  }
  .file-mess ul{
    list-style:none;margin:18px 0 0;padding:0;
    display:flex;flex-direction:column;gap:11px;
  }
  .file-mess li{
    font-size:15.5px;
    color:var(--ink-soft);
    padding-left:24px;position:relative;
    line-height:1.45;
  }
  .file-mess li::before{
    content:"☐";position:absolute;left:0;top:0;
    color:var(--ink-mute);font-size:18px;
  }
  .file-mess li.cross{
    color:var(--ink-mute);
    text-decoration:line-through;text-decoration-color:var(--brick);
    text-decoration-thickness:1.5px;
  }
  .file-mess li.cross::before{content:"✗";color:var(--brick)}
  .file-mess .doodle{
    position:absolute;right:-30px;bottom:-30px;
    font-style:italic;color:var(--brick);font-size:18px;
    max-width:170px;text-align:center;
  }
  .file-mess .doodle svg{
    display:block;margin:6px auto -8px;
  }
  .file-mess .doodle svg path{fill:none;stroke:var(--brick);stroke-width:2;stroke-linecap:round}

  /* ---------- PLAYGROUND ---------- */
  .pg-wrap{
    background:#fff;
    border:1px solid var(--line);
    border-radius:8px;
    box-shadow:var(--shadow-soft);
    overflow:hidden;
    position:relative;
  }
  .pg-wrap::before{
    content:"démo en direct — sans compte";
    position:absolute;top:14px;right:18px;z-index:3;
    font-style:italic;font-weight:500;font-size:16px;
    color:var(--brick);
  }
  .pg-head{
    padding:22px 28px;
    border-bottom:1px solid var(--line);
    background:var(--paper);
    display:flex;flex-wrap:wrap;align-items:center;gap:14px;justify-content:space-between;
  }
  .pg-head .label{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-weight:600;font-size:14px;color:var(--ink-mute);letter-spacing:.06em;
    text-transform:uppercase;
  }
  .pg-chips{display:flex;flex-wrap:wrap;gap:8px}
  .pg-chip{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:14px;
    padding:8px 14px;border-radius:999px;
    border:1.5px solid var(--line-2);
    background:transparent;color:var(--ink-soft);cursor:pointer;
    transition:all .2s ease;
  }
  .pg-chip:hover{border-color:var(--ink);color:var(--ink)}
  .pg-chip.active{background:var(--ink);color:var(--paper);border-color:var(--ink)}
  .pg-chip.active:hover{background:var(--brick);border-color:var(--brick)}

  .pg-body{
    display:grid;grid-template-columns:1fr 1fr;gap:0;
    min-height:340px;
  }
  .pg-col{padding:24px 28px}
  .pg-col + .pg-col{border-left:1px dashed var(--line)}
  .pg-col h4{
    font-style:italic;font-weight:500;
    font-size:20px;color:var(--ink);margin:0 0 12px;
  }
  .pg-field-label{
    display:block;
    font-style:italic;
    font-weight:500;
    font-size:20px;
    color:var(--ink);
    margin:0 0 12px;
  }
  .pg-field-label .tag{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-style:normal;
    font-size:11px;
    letter-spacing:.1em;
    text-transform:uppercase;
    background:var(--paper-2);
    color:var(--ink-mute);
    padding:3px 7px;
    border-radius:4px;
    margin-left:8px;
    vertical-align:middle;
    font-weight:600;
  }
  .pg-col h4 .tag{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:normal;font-size:11px;
    letter-spacing:.1em;text-transform:uppercase;
    background:var(--paper-2);color:var(--ink-mute);padding:3px 7px;
    border-radius:4px;margin-left:8px;vertical-align:middle;font-weight:600;
  }
  textarea#pgInput{
    width:100%;min-height:240px;
    font-size:15px;line-height:1.55;
    color:var(--ink);background:var(--paper);
    border:1px solid var(--line);border-radius:4px;
    padding:14px;
    outline:none;resize:vertical;
  }
  textarea#pgInput:focus{border-color:var(--brick);background:#fff}
  #pgOutput{
    list-style:none;margin:0;padding:0;
    display:flex;flex-direction:column;gap:8px;
    max-height:280px;overflow-y:auto;
  }
  #pgOutput li{
    font-size:14.5px;line-height:1.5;color:var(--ink);
    padding:10px 12px;background:var(--paper);
    border:1px solid var(--line);border-radius:3px;
    word-break:break-all;
  }
  #pgOutput li.err{
    background:#FCE9E1;border-color:#E7BCAB;color:var(--brick-deep);
  }
  #pgOutput li code{
    font-style:italic;
    color:var(--brick);font-weight:500;
  }
  #pgOutput .empty{
    color:var(--ink-mute);font-style:italic;
    background:transparent;border:1px dashed var(--line-2);
  }
  .pg-warning{
    color:var(--brick-deep);
    font-style:italic;
  }
  .pg-foot{
    padding:14px 28px;
    background:var(--paper-2);
    border-top:1px solid var(--line);
    display:flex;flex-wrap:wrap;justify-content:space-between;gap:14px;align-items:center;
    font-size:14px;color:var(--ink-soft);
  }
  .pg-foot strong{font-weight:600;color:var(--ink)}
  .pg-foot .reset{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-size:13.5px;
    color:var(--brick);text-decoration:underline;text-underline-offset:3px;
    background:none;border:none;cursor:pointer;padding:0;
  }
  .pg-foot .reset:hover{color:var(--brick-deep)}

  /* ---------- HOW (NARRATIVE) ---------- */
  .how-grid{
    display:grid;grid-template-columns:repeat(3,1fr);
    gap:clamp(20px,3vw,42px);
  }
  .how-step{
    position:relative;
    padding-top:30px;
  }
  .how-step .big-num{
    font-style:italic;
    font-weight:400;font-size:140px;
    line-height:.8;
    color:var(--brick);
    margin-bottom:14px;letter-spacing:-.03em;
    display:block;
  }
  .how-step:nth-child(2) .big-num{color:var(--olive)}
  .how-step:nth-child(3) .big-num{color:var(--gold)}
  .how-step h3{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;
    font-size:24px;line-height:1.15;letter-spacing:-.015em;
    margin:0 0 10px;color:var(--ink);
  }
  .how-step h3 em{
    font-family:var(--font-newsreader),serif;font-style:italic;font-weight:500;color:var(--brick);
  }
  .how-step p{
    font-size:16px;line-height:1.6;
    color:var(--ink-soft);margin:0;
  }
  .how-step .hand-note{
    margin-top:14px;
    font-style:italic;font-size:15px;
    color:var(--ink-mute);display:inline-block;
  }

  /* ---------- NORMS ---------- */
  .norms{
    display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.4vw,30px);
  }
  .norm{
    background:#fff;
    border:1px solid var(--line);
    border-radius:4px;
    padding:28px 28px 26px;
    position:relative;
    box-shadow:var(--shadow-soft);
    transition:transform .35s ease;
  }
  .norm:nth-child(odd){transform:rotate(-.6deg)}
  .norm:nth-child(even){transform:rotate(.5deg)}
  .norm:hover{transform:rotate(0deg) translateY(-3px)}
  .norm .ribbon{
    position:absolute;top:-12px;left:18px;
    background:var(--brick);color:var(--paper);
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:600;
    font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;
    padding:5px 12px;border-radius:3px;
    transform:rotate(-2deg);
  }
  .norm:nth-child(2) .ribbon{background:var(--olive)}
  .norm:nth-child(3) .ribbon{background:var(--gold);color:var(--ink)}
  .norm h4{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;
    font-size:30px;letter-spacing:-.02em;
    margin:18px 0 4px;color:var(--ink);
  }
  .norm h4 em{
    font-family:var(--font-newsreader),serif;font-style:italic;font-weight:500;color:var(--brick);
  }
  .norm .sub{
    font-style:italic;font-size:15px;color:var(--ink-mute);
    margin-bottom:14px;
  }
  .norm p{
    font-size:15.5px;line-height:1.55;
    color:var(--ink-soft);margin:0 0 16px;
  }
  .norm .ex-label{
    font-style:italic;font-size:15px;color:var(--brick);
    margin-bottom:4px;display:inline-block;
  }
  .norm .ex{
    display:block;
    font-size:14px;
    background:var(--paper);
    padding:10px 12px;border-radius:3px;
    border:1px dashed var(--line-2);
    color:var(--ink);word-break:break-all;
  }

  /* ---------- FEATURES (CHIPS GRID) ---------- */
  .feats{
    display:grid;grid-template-columns:repeat(4,1fr);gap:14px;
  }
  .feat{
    background:#fff;
    border:1px solid var(--line);
    border-radius:6px;
    padding:22px 22px 20px;
    transition:transform .25s ease,box-shadow .25s ease;
    display:flex;flex-direction:column;gap:8px;
  }
  .feat:hover{transform:translateY(-3px);box-shadow:var(--shadow-soft)}
  .feat .ico{
    font-style:italic;font-weight:500;font-size:26px;
    color:var(--brick);line-height:1;margin-bottom:6px;
  }
  .feat h5{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:600;
    font-size:17px;letter-spacing:-.01em;margin:0;color:var(--ink);
  }
  .feat p{
    font-size:14.5px;line-height:1.5;
    color:var(--ink-soft);margin:0;
  }

  /* ---------- MANIFESTO ---------- */
  .manifesto{
    display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(36px,6vw,80px);
    align-items:start;
  }
  .manifesto ul{list-style:none;margin:0;padding:0}
  .manifesto li{
    padding:22px 0;
    border-bottom:1px solid var(--line);
    display:grid;grid-template-columns:80px 1fr;gap:18px;
  }
  .manifesto li:first-child{border-top:1px solid var(--line)}
  .manifesto .k{
    font-style:italic;font-weight:500;
    font-size:34px;color:var(--brick);line-height:.9;
  }
  .manifesto .v strong{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:550;font-size:20px;letter-spacing:-.01em;
    color:var(--ink);display:block;margin-bottom:4px;
  }
  .manifesto .v span{
    font-size:15.5px;line-height:1.55;color:var(--ink-soft);
  }
  .ledger{
    background:var(--ink);color:var(--paper);
    padding:36px 32px;border-radius:6px;
    position:sticky;top:24px;
    transform:rotate(-.5deg);
    box-shadow:var(--shadow-soft);
  }
  .ledger .openq{
    font-style:italic;font-weight:300;
    font-size:80px;line-height:.6;color:var(--gold);margin-bottom:14px;
    display:block;
  }
  .ledger blockquote{
    margin:0 0 22px;
    font-family:var(--font-newsreader),serif;font-style:italic;font-weight:400;
    font-size:23px;line-height:1.35;color:var(--paper);
  }
  .ledger blockquote em{color:var(--gold-soft);font-weight:500}
  .ledger .by{
    font-style:italic;font-size:16px;color:var(--gold-soft);
    display:inline-block;
  }

  /* ---------- FINAL CTA ---------- */
  .final{
    margin:60px 0 0;
    padding:clamp(60px,10vh,110px) clamp(28px,5vw,72px);
    background:
      radial-gradient(circle at 80% 20%, rgba(196,149,69,.22) 0%, transparent 50%),
      radial-gradient(circle at 20% 90%, rgba(184,74,53,.18) 0%, transparent 50%),
      var(--ink);
    color:var(--paper);
    border-radius:10px;
    position:relative;overflow:hidden;
  }
  .final::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='8' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .12 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/></svg>");
    mix-blend-mode:overlay;opacity:.6;
  }
  .final-inner{position:relative;z-index:1;display:grid;grid-template-columns:1.3fr 1fr;gap:50px;align-items:center}
  .final .kicker{color:var(--gold-soft)}
  .final .kicker .num{background:rgba(244,236,220,.1);color:var(--gold-soft)}
  .final h2{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:300;
    font-size:clamp(40px,5.5vw,76px);
    line-height:.98;letter-spacing:-.03em;
    margin:0 0 22px;color:var(--paper);max-width:13ch;
  }
  .final h2 em{font-family:var(--font-newsreader),serif;font-style:italic;font-weight:400;color:var(--gold-soft)}
  .final p{font-size:18px;line-height:1.55;color:rgba(244,236,220,.82);margin:0 0 28px;max-width:540px}
  .final .btn-primary{background:var(--gold);color:var(--ink);border-color:var(--gold)}
  .final .btn-primary:hover{background:var(--paper);border-color:var(--paper);transform:translateY(-1px)}
  .final .btn-ghost{color:var(--paper);border-color:rgba(244,236,220,.4)}
  .final .btn-ghost:hover{background:var(--paper);color:var(--ink);border-color:var(--paper)}
  .final-side{
    border:1px dashed rgba(244,236,220,.3);
    padding:28px 26px;border-radius:6px;
    background:rgba(244,236,220,.04);
    transform:rotate(.8deg);
  }
  .final-side h6{
    font-style:italic;font-weight:500;font-size:20px;color:var(--gold-soft);
    margin:0 0 16px;display:inline-block;
  }
  .final-side ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
  .final-side li{
    display:flex;align-items:flex-start;gap:12px;
    font-size:16px;line-height:1.4;color:var(--paper);
  }
  .final-side li::before{
    content:"✓";color:var(--gold);font-weight:700;font-size:17px;flex:none;margin-top:1px;
  }
  .bullets{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
  .bullets li{
    display:flex;align-items:flex-start;gap:10px;
    font-size:15.5px;line-height:1.4;color:rgba(244,236,220,.9);
  }
  .bullets li::before{
    content:"✓";color:var(--gold-soft);font-weight:700;font-size:16px;flex:none;margin-top:1px;
  }

  /* ---------- FOOTER ---------- */
  footer{
    padding:54px 0 36px;
    border-top:1px solid var(--line-2);
    margin-top:80px;
  }
  .foot{
    display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px;
  }
  .foot h6{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:600;font-size:13px;letter-spacing:.06em;
    text-transform:uppercase;color:var(--ink-mute);margin:0 0 14px;
  }
  .foot ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px}
  .foot a{color:var(--ink);text-decoration:none;font-size:15.5px;
    border-bottom:1px solid transparent;padding-bottom:1px;transition:border-color .2s ease, color .2s ease}
  .foot a:hover{color:var(--brick);border-color:var(--brick)}
  .foot .blurb{
    font-size:15px;line-height:1.55;color:var(--ink-soft);
    max-width:34ch;margin:14px 0 0;
  }
  .foot-bot{
    display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;
    margin-top:42px;padding-top:22px;border-top:1px solid var(--line);
    font-size:14.5px;color:var(--ink-mute);gap:14px;
  }
  .foot-bot .lang{display:flex;gap:14px}
  .foot-bot .lang a{
    font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-size:13.5px;
    color:var(--ink-mute);text-decoration:none;font-weight:500;
    padding:3px 10px;border-radius:999px;
    border:1px solid transparent;
  }
  .foot-bot .lang a.on{color:var(--ink);border-color:var(--ink-mute)}
  .foot-bot .lang a:hover{color:var(--brick)}
  .foot-bot .signature{
    font-style:italic;font-size:17px;color:var(--brick);
  }

  /* ---------- RESPONSIVE ---------- */
  @media (max-width: 980px){
    nav.top .menu{display:none}
    .problem-wrap{grid-template-columns:1fr;gap:42px}
    .file-mess{transform:rotate(0deg);max-width:480px}
    .pg-body{grid-template-columns:1fr}
    .pg-col + .pg-col{border-left:none;border-top:1px dashed var(--line)}
    .how-grid{grid-template-columns:1fr;gap:48px}
    .how-step .big-num{font-size:110px}
    .norms{grid-template-columns:1fr;gap:30px}
    .norm{transform:rotate(0deg) !important}
    .feats{grid-template-columns:repeat(2,1fr)}
    .manifesto{grid-template-columns:1fr}
    .ledger{position:relative;top:0;transform:rotate(0deg)}
    .final-inner{grid-template-columns:1fr;gap:32px}
    .final-side{transform:rotate(0deg)}
    .stamp{display:none}
    .foot{grid-template-columns:1fr 1fr}
  }
  @media (max-width: 560px){
    .feats{grid-template-columns:1fr}
    .foot{grid-template-columns:1fr}
    h1.display{font-size:54px}
  }
  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto}
    *,*::before,*::after{
      animation-duration:.01ms !important;
      animation-iteration-count:1 !important;
      scroll-behavior:auto !important;
      transition-duration:.01ms !important;
    }
    .r{opacity:1;transform:none}
  }

  /* ---------- REVEAL ---------- */
  .r{opacity:0;transform:translateY(14px);transition:opacity .9s ease, transform .9s ease}
  .r.in{opacity:1;transform:none}
`;

const SOFTWARE_APPLICATION_JSONLD = `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "DOC-RENAME",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Any",
  "description": "Outil local de renommage de documents selon des conventions métier et conventions projet.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
}`;

const FAQ_JSONLD = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Faut-il créer un compte ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Non. L'outil est accessible directement, sans inscription et sans carte bleue. Vos préférences (champs actifs, séparateur, thème) sont sauvegardées dans votre navigateur via localStorage."
      }
    },
    {
      "@type": "Question",
      "name": "Mes fichiers sont-ils envoyés sur un serveur ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Non. Tout le traitement — extraction ZIP, lecture des fichiers, renommage, visionneuse PDF/DOCX/XLSX — se fait entièrement dans votre navigateur. Aucun fichier, aucun contenu, aucune métadonnée n'est transmis à un serveur externe."
      }
    },
    {
      "@type": "Question",
      "name": "Quels profils métier sont supportés ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "L'application propose des profils BIM / Construction, finance, RH, santé, administratif, juridique, industrie, immobilier et convention personnalisée. Les templates BIM sont inspirés de pratiques de nommage, sans certification de conformité."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de fichiers puis-je traiter ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "L'outil a été testé avec plus de 1 000 fichiers en une seule passe. Vous pouvez déposer des fichiers individuels, un dossier entier, ou une archive ZIP — l'arborescence est préservée dans le ZIP de sortie."
      }
    },
    {
      "@type": "Question",
      "name": "L'outil est-il payant ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La version actuelle fonctionne sans compte et sans paiement intégré. Les fonctions cloud, équipe et paiement ne sont pas disponibles dans cette version locale."
      }
    },
    {
      "@type": "Question",
      "name": "Puis-je prévisualiser mes fichiers avant de renommer ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui — la visionneuse intégrée affiche PDF (avec zoom et pagination), DOCX (rendu HTML via mammoth.js), XLSX / CSV / ODS (grille avec onglets par feuille), DXF (rendu SVG), images (PNG/JPG/WebP/GIF), et texte brut. Aucun upload — tout est lu en local dans le navigateur."
      }
    }
  ]
}`;

const LANDING_JS = `
(function() {
  /* ---------- REVEAL ON SCROLL ---------- */
  var revealEls = document.querySelectorAll('.r');
  if('IntersectionObserver' in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    },{threshold:.10, rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(function(el){ obs.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }
  // staggered hero
  document.querySelectorAll('header.hero .r').forEach(function(el,i){
    setTimeout(function(){ el.classList.add('in'); }, 80 + i*180);
  });

  /* ---------- LIVE RENAMER DEMO ---------- */
  var DISCIPLINES = [
    { code:'ARC', kws:['arc','archi','plan','facade','coupe','etage','niveau','elev'] },
    { code:'STR', kws:['str','struct','beton','arma','poutre','dalle','fondation','note de calcul','calcul'] },
    { code:'CVC', kws:['cvc','ventilation','clim','chauf','vmc','synoptique','fluide','heat'] },
    { code:'ELE', kws:['ele','elec','tableau','electrique','courant','synop','lumi','luminaire'] },
    { code:'SAN', kws:['san','sanit','plombe','plomberie','evacuation','eu','ev'] },
    { code:'SEC', kws:['sec','secu','securit','incendie','feu','psc','pv'] },
    { code:'FAC', kws:['fa\\u00e7','facade','enveloppe','bardage'] },
    { code:'GEN', kws:[] }
  ];

  function detectDiscipline(name){
    var n = name.toLowerCase();
    for(var i=0;i<DISCIPLINES.length;i++){
      var d=DISCIPLINES[i];
      if(d.code === 'GEN') continue;
      if(new RegExp('\\\\b'+d.code+'\\\\b','i').test(name)) return d.code;
    }
    for(var i=0;i<DISCIPLINES.length;i++){
      var d=DISCIPLINES[i];
      for(var j=0;j<d.kws.length;j++){
        if(n.indexOf(d.kws[j])!==-1) return d.code;
      }
    }
    return 'GEN';
  }

  function detectLevel(name){
    var m = name.match(/n(\\d{1,2})|niveau\\s*(\\d{1,2})|etage\\s*(\\d{1,2})|n0?(\\d{1,2})/i);
    if(m){
      var num = m[1]||m[2]||m[3]||m[4]||'0';
      return 'N' + String(num).padStart(2,'0');
    }
    return 'NXX';
  }
  function detectZone(name){
    var m = name.match(/\\bz(\\d{1,2})\\b/i);
    if(m) return 'Z' + m[1].padStart(1,'0');
    return 'ZZ';
  }
  function getExt(name){
    var m = name.match(/\\.([a-z0-9]{2,5})$/i);
    return m ? '.'+m[1].toLowerCase() : '.pdf';
  }

  var TEMPLATES = {
    iso: function(idx, parts){ return 'P001-XX-'+parts.disc+'-DR-'+parts.disc[0]+'R-'+String(idx).padStart(3,'0')+'-S2-P01'+parts.ext; },
    sia: function(idx, parts){ return 'ABC-PROJ-'+parts.disc+'-DRA-'+parts.zone+'-'+parts.level+'-DR-'+parts.disc[0]+'-'+String(idx).padStart(4,'0')+parts.ext; },
    frfr: function(idx, parts){ return 'PRJ_'+parts.disc+'_PLN_'+parts.level+'_R01_'+String(idx).padStart(3,'0')+parts.ext; },
    custom: function(idx, parts){ return '[PROJET]_'+parts.disc+'_'+parts.level+'_'+parts.zone+'_r01_'+String(idx).padStart(3,'0')+parts.ext; }
  };

  var SAMPLE = 'Plan_etage1_FINAL_def_v2_corrig\\u00e9(JR).pdf\\ncoupe AA - rev_03 - copie.dwg\\nfacade nord ARC OK VALID\\u00c9.pdf\\nnote de calcul structure (STR).pdf\\nsynoptique CVC - phase APD.pdf\\nplan electrique tableau N02.dwg\\nPV reception securite incendie.pdf';

  var $input  = document.getElementById('pgInput');
  var $output = document.getElementById('pgOutput');
  var $chips  = document.getElementById('pgChips');
  var $reset  = document.getElementById('pgReset');
  var currentTpl = 'iso';

  function render(){
    if(!$input||!$output) return;
    var lines = $input.value.split(/\\r?\\n/).map(function(l){return l.trim();}).filter(Boolean);
    $output.replaceChildren();
    if(!lines.length){
      var empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = '— Collez quelques noms \\u00e0 gauche pour voir la magie.';
      $output.append(empty);
      return;
    }
    var frag = document.createDocumentFragment();
    lines.forEach(function(line, i){
      var parts = {
        disc: detectDiscipline(line),
        level: detectLevel(line),
        zone: detectZone(line),
        ext: getExt(line)
      };
      var renamed = TEMPLATES[currentTpl](i+1, parts);
      var ok = parts.disc !== 'GEN';
      var item = document.createElement('li');
      if(!ok) item.className = 'err';

      var original = document.createElement('code');
      original.textContent = line;
      item.append(original, document.createElement('br'), '\\u2192 ' + renamed);

      if(!ok){
        var warning = document.createElement('em');
        warning.className = 'pg-warning';
        warning.textContent = ' \\u2014 discipline non d\\u00e9tect\\u00e9e, code GEN appliqu\\u00e9';
        item.append(warning);
      }
      frag.append(item);
    });
    $output.append(frag);
  }

  if($input) $input.addEventListener('input', render);
  if($chips) $chips.addEventListener('click', function(e){
    var btn = e.target.closest('.pg-chip');
    if(!btn) return;
    $chips.querySelectorAll('.pg-chip').forEach(function(c){
      c.classList.remove('active');
      c.setAttribute('aria-pressed','false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed','true');
    currentTpl = btn.dataset.tpl;
    render();
  });
  if($reset) $reset.addEventListener('click', function(){
    $input.value = SAMPLE;
    render();
  });
  render();
})();
`;

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SOFTWARE_APPLICATION_JSONLD }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }} />

      <div className="frame">

        {/* ========== NAV ========== */}
        <nav className="top" aria-label="Navigation principale">
          <Link href="/" className="brand" aria-label="DOC-RENAME — accueil">
            <span className="logo-mark" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </span>
            <span><span className="wm">DOC</span><span className="small"> · RENAME</span></span>
          </Link>
          <ul className="menu">
            <li><a href="#probleme">Pourquoi</a></li>
            <li><a href="#profils">Profils</a></li>
            <li><a href="#fonctionnalites">Fonctionnalités</a></li>
            <li><a href="#demo">Démo</a></li>
            <li><a href="#comment">Comment</a></li>
          </ul>
          <a className="cta-mini" href="/app">Essayer le renamer →</a>
        </nav>

        {/* ========== HERO ========== */}
        <header className="hero">
          <div className="stamp r in">
            <span>SANS COMPTE<br /><em>libre</em><br />SANS UPLOAD</span>
          </div>

          <div className="r in">
            <span className="badge-no-account">
              <span className="dot"></span>
              Traitement local. <em>—</em> Aucun upload nécessaire.
            </span>

            <h1 className="display">
              Renommez vos<br />
              documents selon<br />
              <span className="scribble">les règles
                <svg viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <path d="M5,28 Q60,8 130,22 T290,18" />
                </svg>
              </span><br />
              <em>de votre métier.</em>
            </h1>

            <p className="lede">
              Choisissez un profil — <strong>BIM, finance, santé, RH, administratif, juridique, industrie ou immobilier</strong> —
              puis appliquez une structure de nommage claire à vos fichiers avant transmission, archivage ou dépôt.
              <span className="accent"> Vos fichiers ne quittent pas votre navigateur.</span>
            </p>

            <div className="hero-cta">
              <a className="btn btn-primary" href="/app">Essayer le renamer <span className="arrow">→</span></a>
              <a className="btn btn-ghost" href="#profils">Voir les profils métier</a>
            </div>

            <div className="hero-note">
              <svg viewBox="0 0 40 24" aria-hidden="true" focusable="false">
                <path d="M2,8 Q12,2 22,12 Q30,18 38,10 M30,14 L38,10 L34,4" />
              </svg>
              né du BIM, maintenant structuré par profils métier
            </div>
          </div>
        </header>

        <div className="div-rule"></div>

        {/* ========== PROBLEM ========== */}
        <section id="probleme" aria-labelledby="titre-probleme">
          <span className="kicker"><span className="num">01</span>le problème</span>
          <h2 className="section-title" id="titre-probleme">Une convention documentaire, <em>ça se respecte.</em></h2>
          <p className="section-sub">
            DOC-RENAME est né du BIM, mais le problème dépasse la construction : chaque métier a ses codes,
            ses types de documents, ses entités et ses versions. Le danger commence quand tout est mélangé.
          </p>

          <div className="problem-wrap mt-problem">
            <div className="problem-text r">
              <p>
                Sur un projet BIM, financier, RH ou juridique, vous manipulez vite <strong>des centaines de fichiers</strong>.
                Chacun doit porter les bons champs : projet, client, service, type, date, statut, version ou indice.
                <em>Le vocabulaire doit rester propre à chaque métier.</em>
              </p>
              <p>
                Finance ne doit pas afficher des maquettes IFC. RH ne doit pas afficher des rapports de chantier.
                BIM ne doit pas proposer des bulletins de paie. Le moteur adapte les champs, types, abréviations,
                entités et templates au profil choisi.
              </p>
              <blockquote className="pull">
                « Le produit est utile uniquement si la convention affichée correspond vraiment au métier choisi. »
              </blockquote>
            </div>

            <aside className="file-mess r" aria-label="Exemples de noms de fichiers désordonnés">
              <ul>
                <li className="cross">Plan_etage1_FINAL_def_v2_corrigé(JR).pdf</li>
                <li className="cross">coupe AA - rev_03 - copie.dwg</li>
                <li className="cross">DOSSIER PRO - VERSION POUR ENVOI.zip</li>
                <li className="cross">IMG_4523.jpg (un détail STR)</li>
                <li className="cross">facade nord OK VALIDÉ.pdf</li>
                <li className="cross">~$nomenclature.xlsx</li>
              </ul>
              <div className="doodle">
                <svg width="60" height="40" viewBox="0 0 60 40" aria-hidden="true" focusable="false">
                  <path d="M5,30 Q20,5 50,15 M44,8 L50,15 L42,18" />
                </svg>
                ça vous parle ?
              </div>
            </aside>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== PLAYGROUND ========== */}
        <section id="demo" aria-labelledby="titre-demo">
          <span className="kicker"><span className="num">02</span>essayez tout de suite</span>
          <h2 className="section-title" id="titre-demo">Collez vos noms, <em>regardez ce que ça donne.</em></h2>
          <p className="section-sub mb-demo-sub">
            Aucune inscription. Aucun upload. Tout se passe dans votre navigateur, là, maintenant.
            Modifiez la liste à gauche, le résultat s&apos;affiche à droite.
          </p>

          <div className="pg-wrap r">
            <div className="pg-head">
              <span className="label">Choisir une norme</span>
              <div className="pg-chips" id="pgChips" role="group" aria-label="Norme de renommage">
                <button className="pg-chip active" type="button" data-tpl="iso" aria-pressed="true">ISO 19650</button>
                <button className="pg-chip" type="button" data-tpl="sia" aria-pressed="false">Norme SIA (CH)</button>
                <button className="pg-chip" type="button" data-tpl="frfr" aria-pressed="false">BIM France</button>
                <button className="pg-chip" type="button" data-tpl="custom" aria-pressed="false">Convention maison</button>
              </div>
            </div>

            <div className="pg-body">
              <div className="pg-col">
                <label className="pg-field-label" htmlFor="pgInput">Vos fichiers <span className="tag">à gauche</span></label>
                <textarea id="pgInput" spellCheck={false} defaultValue={`Plan_etage1_FINAL_def_v2_corrigé(JR).pdf\ncoupe AA - rev_03 - copie.dwg\nfacade nord ARC OK VALIDÉ.pdf\nnote de calcul structure (STR).pdf\nsynoptique CVC - phase APD.pdf\nplan electrique tableau N02.dwg\nPV reception securite incendie.pdf`}></textarea>
              </div>

              <div className="pg-col">
                <h4 id="pg-output-title">Renommé <span className="tag">en direct</span></h4>
                <div role="status" aria-live="polite" aria-labelledby="pg-output-title">
                  <ul id="pgOutput"></ul>
                </div>
              </div>
            </div>

            <div className="pg-foot">
              <span>Détection auto de la discipline d&apos;après les mots-clés (<strong>ARC</strong>, <strong>STR</strong>, <strong>CVC</strong>, <strong>ELE</strong>, <strong>SEC</strong>…).</span>
              <button className="reset" id="pgReset" type="button">↻ remettre les exemples</button>
            </div>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== HOW ========== */}
        <section id="comment" aria-labelledby="titre-comment">
          <span className="kicker"><span className="num">03</span>la manière</span>
          <h2 className="section-title" id="titre-comment">Trois mouvements. <em>Pas un de plus.</em></h2>
          <p className="section-sub">
            Ça tient sur une serviette de café. Mais ça vous fait gagner les jeudis soirs.
          </p>

          <div className="how-grid mt-how">
            <div className="how-step r">
              <span className="big-num">i.</span>
              <h3>Composez la <em>nomenclature</em>.</h3>
              <p>Choisissez un template prêt (SIA, ISO 19650, BIM France) ou construisez le vôtre par glisser-déposer. Aperçu en temps réel, sauvegardé par projet.</p>
              <span className="hand-note">— ou prenez l&apos;ISO 19650 et zou.</span>
            </div>
            <div className="how-step r">
              <span className="big-num">ii.</span>
              <h3>Déposez vos <em>fichiers</em>.</h3>
              <p>Un fichier, un dossier, ou une archive ZIP. L&apos;outil extrait, détecte la discipline, applique le template. Vous pouvez corriger ligne par ligne avant validation.</p>
              <span className="hand-note">— testé jusqu&apos;à 1000 fichiers.</span>
            </div>
            <div className="how-step r">
              <span className="big-num">iii.</span>
              <h3>Téléchargez le <em>ZIP</em>.</h3>
              <p>Un clic. Le ZIP renommé arrive dans vos téléchargements, arborescence intacte. Aucun fichier n&apos;a quitté votre machine.</p>
              <span className="hand-note">— et vous récupérez votre soirée.</span>
            </div>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== PROFILES ========== */}
        <section id="profils" aria-labelledby="titre-profils">
          <span className="kicker"><span className="num">04</span>profils métier</span>
          <h2 className="section-title" id="titre-profils">Un moteur commun. <em>Des conventions séparées.</em></h2>
          <p className="section-sub">
            BIM reste le cas d&apos;usage le plus avancé, avec des templates inspirés ISO 19650, SIA et BIM France.
            Les autres profils disposent de leurs propres types, champs, abréviations, entités et exemples.
          </p>

          <div className="norms mt-norms">
            <article className="norm r">
              <span className="ribbon">Vertical principal</span>
              <h4>BIM / <em>Construction</em></h4>
              <div className="sub">Plans, maquettes, rapports, lots, disciplines, CDE</div>
              <p>Templates BIM inspirés ISO 19650, SIA et BIM France. Ne constitue pas une certification de conformité.</p>
              <span className="ex-label">exemple →</span>
              <code className="ex">PROJET_BET_STRUCTURE_DOCTECH_NIV01_REV01.pdf</code>
            </article>

            <article className="norm r">
              <span className="ribbon">Back-office</span>
              <h4>Finance · RH · <em>Admin</em></h4>
              <div className="sub">Factures, paie, attestations, courriers, dossiers</div>
              <p>Chaque profil garde ses propres types de documents et entités. Pas de types BIM dans Finance, pas de fiches de paie dans BIM.</p>
              <span className="ex-label">exemple →</span>
              <code className="ex">CLIENT_2026_05_RAPFIN_VALIDE_V01.xlsx</code>
            </article>

            <article className="norm r">
              <span className="ribbon">Opérations</span>
              <h4>Santé · Juridique · Industrie · <em>Immobilier</em></h4>
              <div className="sub">Procédures, contrats, équipements, baux, diagnostics</div>
              <p>Des conventions de départ contextualisées pour structurer les lots documentaires avant transmission ou archivage.</p>
              <span className="ex-label">exemple →</span>
              <code className="ex">SERVICE_QUALITE_PROC_HYGIENE_V03.pdf</code>
            </article>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== FEATURES ========== */}
        <section id="fonctionnalites" aria-labelledby="titre-fonctionnalites">
          <span className="kicker"><span className="num">05</span>ce qu&apos;il y a dedans</span>
          <h2 className="section-title" id="titre-fonctionnalites">Petit, mais <em>complet.</em></h2>
          <p className="section-sub mb-feats-sub">
            Pas une suite. Un outil. Qui fait une chose, et qui la fait bien.
          </p>

          <div className="feats">
            <div className="feat r"><div className="ico">↓</div><h5>Drag &amp; drop fichiers + archives</h5><p>Fichiers, dossiers ou archives ZIP, RAR, 7z, TAR, GZIP. Extraction automatique, arborescence préservée.</p></div>
            <div className="feat r"><div className="ico">⌘</div><h5>Profils métier</h5><p>BIM, finance, santé, RH, administratif, juridique, industrie, immobilier et convention personnalisée.</p></div>
            <div className="feat r"><div className="ico">◎</div><h5>Catégorisation par type</h5><p>Fichiers regroupés à l&apos;arrivée par catégorie — documents, CAO, BIM, images, archives — pour un repérage instantané.</p></div>
            <div className="feat r"><div className="ico">▤</div><h5>Visionneuse intégrée</h5><p>PDF · DOCX · XLSX · DXF · images · texte — aperçu directement dans l&apos;outil, sans upload.</p></div>
            <div className="feat r"><div className="ico">∑</div><h5>Renaming en lot</h5><p>1 000+ fichiers renommés en quelques secondes. Sélection partielle ou lot complet.</p></div>
            <div className="feat r"><div className="ico">⟂</div><h5>Préfixes intelligents</h5><p>Détection automatique des préfixes communs. Suppression, remplacement ou mapping vers les champs.</p></div>
            <div className="feat r"><div className="ico">⊞</div><h5>Entités par profil</h5><p>Import par copier-coller : entreprises BIM, clients finance, collaborateurs RH, sites industriels ou biens immobiliers.</p></div>
            <div className="feat r"><div className="ico">¶</div><h5>Normalisation stricte</h5><p>Majuscules, accents supprimés, séparateurs propres, abréviations métier et aperçu avant export ZIP.</p></div>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== LIMITS ========== */}
        <section aria-labelledby="titre-limites">
          <span className="kicker"><span className="num">06</span>ce que l&apos;outil ne prétend pas faire</span>
          <h2 className="section-title" id="titre-limites">Un renamer précis. <em>Pas une plateforme métier complète.</em></h2>
          <p className="section-sub">
            L&apos;application se concentre sur une mission : structurer et renommer des lots de documents.
            Elle ne remplace pas une GED, une CDE, un ERP, un SIRH ou une plateforme de validation.
          </p>
          <div className="feats" style={{ marginTop: '42px' }}>
            <div className="feat r"><div className="ico">!</div><h5>Pas de certification</h5><p>Les templates BIM sont inspirés de pratiques de nommage. Ils ne certifient pas une conformité réglementaire.</p></div>
            <div className="feat r"><div className="ico">!</div><h5>Pas de validation métier</h5><p>L&apos;outil n&apos;approuve pas le contenu d&apos;un fichier et ne remplace pas une revue technique, juridique ou qualité.</p></div>
            <div className="feat r"><div className="ico">!</div><h5>Pas de cloud équipe</h5><p>La version actuelle ne fournit pas de compte, collaboration, historique cloud, workflow d&apos;approbation ou paiement intégré.</p></div>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== MANIFESTO ========== */}
        <section aria-labelledby="titre-engagements">
          <span className="kicker"><span className="num">07</span>confidentialité</span>
          <h2 className="section-title" id="titre-engagements">Vos fichiers <em>ne quittent pas</em> votre machine.</h2>
          <p className="section-sub">
            Conçu pour des pros qui manipulent des documents sensibles. Voici les règles que l&apos;outil respecte.
          </p>

          <div className="manifesto mt-manifesto">
            <ul>
              <li>
                <span className="k">i</span>
                <span className="v">
                  <strong>Client-side d&apos;abord.</strong>
                  <span>Extraction ZIP, lecture des fichiers, renommage : tout se fait dans votre navigateur. Aucun fichier envoyé sur un serveur.</span>
                </span>
              </li>
              <li>
                <span className="k">ii</span>
                <span className="v">
                  <strong>Le local d&apos;abord.</strong>
                  <span>Vos templates et conventions personnalisées sont stockées dans votre navigateur (localStorage). Pas de cloud, pas de compte requis.</span>
                </span>
              </li>
              <li>
                <span className="k">iii</span>
                <span className="v">
                  <strong>Pas de verrouillage.</strong>
                  <span>Vos templates s&apos;exportent en JSON. Vous partez quand vous voulez avec vos conventions.</span>
                </span>
              </li>
              <li>
                <span className="k">iv</span>
                <span className="v">
                  <strong>Open by default.</strong>
                  <span>Le code est ouvert. Vous pouvez auditer exactement ce que l&apos;outil fait à vos fichiers.</span>
                </span>
              </li>
            </ul>

            <aside className="ledger" aria-label="Citation sur le cahier des charges">
              <span className="openq">&quot;</span>
              <blockquote>
                Le traitement local est volontaire : import, aperçu, renommage et export ZIP se font dans le navigateur.
                L&apos;outil ne nécessite pas d&apos;upload pour accomplir sa mission.
              </blockquote>
              <span className="by">— principe de fonctionnement actuel</span>
            </aside>
          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== TARIFS ========== */}
        <section id="tarifs" aria-labelledby="titre-tarifs">
          <span className="kicker"><span className="num">08</span>tarifs</span>
          <h2 className="section-title" id="titre-tarifs">Version locale, <em>sans paiement intégré.</em></h2>
          <p className="section-sub">
            La version actuelle fonctionne sans compte et sans paiement. Les fonctions cloud, équipe,
            historique partagé ou abonnement ne sont pas disponibles dans cette version locale.
          </p>
          <p style={{ marginTop: '24px', fontSize: '15px', color: 'var(--ink-mute)' }}>
            Pour être tenu au courant : <a href="mailto:contact@bimdoc-renamer.com" style={{ color: 'var(--brick)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>contact@bimdoc-renamer.com</a>
          </p>
        </section>

        <div className="div-rule"></div>

        {/* ========== FAQ ========== */}
        <section id="faq" aria-labelledby="titre-faq">
          <span className="kicker"><span className="num">09</span>questions fréquentes</span>
          <h2 className="section-title" id="titre-faq">Tout ce qu&apos;on <em>nous demande.</em></h2>

          <div className="faq-list" style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '0' }}>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                Faut-il créer un compte ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                Non. L&apos;outil est accessible directement, sans inscription et sans carte bleue.
                Vos préférences (champs actifs, séparateur, thème) sont sauvegardées dans votre navigateur via localStorage.
              </p>
            </details>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                Mes fichiers sont-ils envoyés sur un serveur ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                Non. Tout le traitement — extraction ZIP, lecture des fichiers, renommage, visionneuse PDF/DOCX/XLSX — se fait entièrement dans votre navigateur.
                Aucun fichier, aucun contenu, aucune métadonnée n&apos;est transmis à un serveur externe.
              </p>
            </details>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                Quels profils métier sont supportés ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                L&apos;application propose des profils <strong>BIM / Construction</strong>, finance, santé, RH, administratif, juridique, industrie, immobilier et convention personnalisée.
                Les templates BIM sont inspirés de pratiques de nommage et ne constituent pas une certification de conformité.
              </p>
            </details>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                Combien de fichiers puis-je traiter ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                L&apos;outil a été testé avec plus de 1 000 fichiers en une seule passe. Vous pouvez déposer des fichiers individuels, un dossier entier, ou une archive ZIP — l&apos;arborescence est préservée dans le ZIP de sortie.
              </p>
            </details>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                L&apos;outil est-il payant ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                La version actuelle fonctionne sans compte et sans paiement intégré. Les fonctions cloud, équipe, historique partagé et abonnement ne sont pas disponibles dans cette version locale.
                Écrivez à <a href="mailto:contact@bimdoc-renamer.com" style={{ color: 'var(--brick)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>contact@bimdoc-renamer.com</a> pour être tenu au courant.
              </p>
            </details>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                Est-ce une CDE, une GED ou un outil de conformité ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                Non. DOC-RENAME renomme et structure des lots de documents. Il ne remplace pas une CDE, une GED, un ERP, un SIRH, une validation métier ou une certification réglementaire.
              </p>
            </details>

            <details className="faq-item" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '22px 0' }}>
              <summary style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                Puis-je prévisualiser mes fichiers avant de renommer ?
                <span style={{ fontSize: '22px', color: 'var(--brick)', flex: 'none', fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: 1.65, color: 'var(--ink-soft)', maxWidth: '680px' }}>
                Oui — la visionneuse intégrée affiche <strong>PDF</strong> (avec zoom et pagination), <strong>DOCX</strong> (rendu HTML via mammoth.js), <strong>XLSX / CSV / ODS</strong> (grille avec onglets par feuille), <strong>DXF</strong> (rendu SVG), images (PNG/JPG/WebP/GIF), et texte brut.
                Aucun upload — tout est lu en local dans le navigateur.
              </p>
            </details>

          </div>
        </section>

        <div className="div-rule"></div>

        {/* ========== FINAL CTA ========== */}
        <section className="final" id="essayer" aria-labelledby="titre-essayer">
          <div className="final-inner">
            <div className="r">
              <span className="kicker"><span className="num">10</span>on commence ?</span>
              <h2 id="titre-essayer">Allez. <em>Trente</em> secondes.</h2>
              <p>
                Vous n&apos;avez besoin de rien. Pas d&apos;inscription, pas de carte bleue, pas de tutoriel.
                Collez vos noms de fichiers dans la démo et regardez. Ou glissez un ZIP — tout se passe dans votre navigateur.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="/app">Ouvrir l&apos;outil <span className="arrow">→</span></a>
                <a className="btn btn-ghost" href="#comment">Comprendre d&apos;abord</a>
              </div>
            </div>

            <aside className="final-side r" aria-label="une question, un retour ?">
              <h6>une question, un retour ?</h6>
              <p style={{ fontSize: '15.5px', lineHeight: 1.5, color: 'rgba(244,236,220,.86)', margin: '0 0 18px' }}>
                Le projet vit grâce aux retours des premiers utilisateurs. Si vous
                butez sur quelque chose, écrivez : <a href="mailto:contact@bimdoc-renamer.com" style={{ color: 'var(--gold-soft)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>contact@bimdoc-renamer.com</a>.
              </p>
              <ul className="bullets">
                <li>Sans inscription pour l&apos;instant</li>
                <li>Aucun upload de vos fichiers</li>
                <li>Profils métier séparés</li>
                <li>Visionneuse PDF / DOCX / XLSX intégrée</li>
              </ul>
            </aside>
          </div>
        </section>
      </div>

      {/* ========== FOOTER ========== */}
      <footer>
        <div className="frame">
          <div className="foot">
            <div>
              <Link href="/" className="brand" aria-label="DOC-RENAME — accueil">
                <span className="logo-mark" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </span>
                <span><span className="wm">DOC</span><span className="small"> · RENAME</span></span>
              </Link>
              <p className="blurb">
                Outil local de renommage documentaire par profils métier, né du BIM et extensible
                aux conventions internes.
              </p>
            </div>
            <div>
              <h6>Produit</h6>
              <ul>
                <li><a href="#comment">Comment ça marche</a></li>
                <li><a href="#profils">Profils métier</a></li>
                <li><a href="#demo">Démo</a></li>
                <li><a href="https://github.com/winterbim/bimcheck-rename/blob/main/web/CHANGELOG.md" target="_blank" rel="noopener noreferrer">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h6>Ressources</h6>
              <ul>
                <li><a href="https://github.com/winterbim/bimcheck-rename/blob/main/web/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="/app">Lancer l&apos;outil</a></li>
                <li><a href="https://github.com/winterbim/bimcheck-rename" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h6>Légal</h6>
              <ul>
                <li><a href="/privacy">Confidentialité</a></li>
                <li><a href="/privacy#conditions">Conditions</a></li>
                <li><a href="/privacy#rgpd">RGPD</a></li>
                <li><a href="mailto:contact@bimdoc-renamer.com">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bot">
            <div>© 2026 DOC-RENAME · Proprietary License</div>
            <span className="signature">par Jawani Fernandes —</span>
          </div>
        </div>
      </footer>

      <Script id="landing-demo" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: LANDING_JS }} />
    </>
  );
}
