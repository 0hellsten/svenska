/* Original inline vector illustrations: portable, crisp, and available offline. */
(function () {
  'use strict';
  const shapes = {
    flour: '<path d="M23 17h34l6 48q-23 8-46 0z" fill="#f7e9ce"/><path d="M23 17l4-7h26l4 7M22 26h36" fill="#dbac78"/><rect x="26" y="33" width="28" height="24" rx="5" fill="#fffaf1"/><path d="M40 53V35m0 6-7-4m7 10 7-5m-7 9-7-4" stroke="#bd905d"/>',
    sugar: '<path d="M23 13h34l5 53H18z" fill="#efd1ce"/><path d="M23 13l4-5h26l4 5M22 23h36" fill="#cf8b89"/><rect x="26" y="31" width="28" height="25" rx="5" fill="#fff8ed"/><path d="m33 40 8-4 8 4v10l-8 4-8-4zM33 40l8 4 8-4m-8 4v10" stroke="#c98f89" fill="#fff"/>',
    egg: '<ellipse cx="40" cy="66" rx="22" ry="4" fill="#d6bca1" opacity=".3"/><path d="M61 45c0 15-9 22-21 22s-21-7-21-22S31 9 40 9s21 21 21 36z" fill="#f2d8b1"/><path d="M29 30q-6 10-4 17" stroke="#fff4df" stroke-width="5"/>',
    butter: '<path d="m12 55 13-22h39l5 24-17 10H22z" fill="#ece7d3"/><path d="m22 34 15-12 28 6-15 13z" fill="#ffe8a0"/><path d="M22 34v20l28 7V41z" fill="#f5cc66"/><path d="m50 41 15-13v21L50 61z" fill="#dbac4e"/><path d="m12 55 10-1 30 7-9 6z" fill="#fff7e7"/>',
    milk: '<path d="m24 24 8-14h21l8 14v43H24z" fill="#f6f1df"/><path d="m24 24 12 8v35H24z" fill="#c4d9dc"/><path d="M36 32h25v23H36z" fill="#8ebbbd"/><path d="M32 10v13l-8 1m8-1h21l8 1M36 32l17-9" fill="none"/><path d="M47 36q-14 14 0 15 14-1 0-15z" fill="#fff9ec" stroke="none"/>',
    bakingpowder: '<rect x="22" y="20" width="36" height="47" rx="7" fill="#b7c6a0"/><rect x="20" y="12" width="40" height="13" rx="4" fill="#708b6e"/><rect x="28" y="33" width="24" height="22" rx="4" fill="#fff4d8"/><path d="m33 47 7-10 7 10z" fill="#d3b272"/>',
    vanilla: '<rect x="22" y="20" width="36" height="47" rx="7" fill="#f0d78d"/><rect x="20" y="12" width="40" height="13" rx="4" fill="#b18b5e"/><rect x="28" y="33" width="24" height="23" rx="4" fill="#fff8e2"/><path d="M37 51q5-15 10-13m-12 1q5 7 4 13" stroke="#a66e48"/><circle cx="35" cy="39" r="5" fill="#fff"/>',
    chocolate: '<path d="m19 15 37-4 8 53-37 5z" fill="#658da6"/><path d="m19 15 37-4 4 26-37 4z" fill="#704b3b"/><path d="m31 14 4 25m8-27 4 25M21 27l37-4" stroke="#a77a57"/><path d="m23 41 12-7 10 4 15-9 4 35-37 5z" fill="#729bb4"/><path d="m32 51 23-3" stroke="#f9e7ab" stroke-width="4"/>',
    cocoa: '<rect x="20" y="19" width="40" height="48" rx="6" fill="#ac7355"/><rect x="18" y="12" width="44" height="12" rx="3" fill="#754e3b"/><rect x="27" y="32" width="26" height="24" rx="4" fill="#efcd9e"/><ellipse cx="40" cy="44" rx="8" ry="10" fill="#8c5d43"/><path d="m37 51 6-15" stroke="#dfb17e"/>',
    strawberry: '<path d="M17 31q1-14 23-9 24-4 23 10-3 22-23 36Q19 52 17 31z" fill="#df7a70"/><path d="m40 27-15-9 13 1 4-12 5 13 13-1-13 11z" fill="#779367"/><g stroke="#ffe4a8" stroke-width="2.5"><path d="m28 36 1 3m18-3 1 3m-9 6 1 3m13-1 1 3m-23-2 1 3m9 5 1 3"/></g>',
    cream: '<path d="M24 25h35v42H24z" fill="#f9efdf"/><path d="m24 25 8-14h19l8 14-12 8z" fill="#f1c7c6"/><path d="M47 33v34h12V25" fill="#dfa6aa"/><path d="M31 46q0-5 6-6-3-5 4-9 1 7 7 10 8 10-4 12H32z" fill="#fff"/>',
    salt: '<path d="M28 28h24l7 36q-19 7-38 0z" fill="#d7e0d7"/><path d="M26 19q14-12 28 0v11H26z" fill="#8babab"/><path d="M32 20h1m6-3h1m6 3h1" stroke="#456866" stroke-width="3"/><rect x="30" y="43" width="20" height="14" rx="4" fill="#fff9e8"/>',
    honey: '<path d="M27 27h26q8 9 7 32-20 14-40 0-1-23 7-32z" fill="#e4ae52"/><rect x="24" y="16" width="32" height="13" rx="4" fill="#ad7d48"/><rect x="27" y="37" width="26" height="20" rx="4" fill="#fff0c2"/><path d="m35 47 5-7 5 7-5 7z" fill="#c9923e"/>',
    lemon: '<path d="M13 45q5-25 29-25 19 0 24 12 11 8-3 14-11 21-33 17-14-1-13-11z" fill="#f2d36e"/><path d="M31 27q9-7 20-3" stroke="#fff0b2" stroke-width="4"/><path d="M52 22q5-12 18-10-4 12-18 10z" fill="#92a36c"/>',
    blueberry: '<path d="M20 35q21 6 40 0l-6 31H26z" fill="#eee0bc"/><ellipse cx="40" cy="35" rx="20" ry="8" fill="#d6c3a5"/><g fill="#7b8da9"><circle cx="28" cy="31" r="9"/><circle cx="43" cy="26" r="10"/><circle cx="54" cy="35" r="8"/><circle cx="36" cy="38" r="9"/></g><path d="m39 25 4 2 3-3m-22 7 4 2 3-3m2 8 3 2 3-3" stroke="#b7c1d5"/>',
    raspberry: '<g fill="#d9898e"><circle cx="39" cy="25" r="9"/><circle cx="29" cy="34" r="10"/><circle cx="48" cy="34" r="10"/><circle cx="25" cy="46" r="9"/><circle cx="41" cy="46" r="10"/><circle cx="54" cy="46" r="8"/><circle cx="32" cy="58" r="8"/><circle cx="47" cy="58" r="8"/></g><path d="m29 20 10-9 4 11 12-6-6 12" fill="#8fa370"/>',
    banana: '<path d="M16 20q5 32 35 21 11-4 12-12 6 25-20 33Q13 68 10 29z" fill="#efd17a"/><path d="M16 20q-1-7-5-9l-4 4 3 14M31 56q23 1 30-18" fill="none"/>',
    apple: '<path d="M40 27q-21-15-27 8-5 20 16 31 7 4 12-1 7 6 15 0 21-18 11-33-10-13-27-5z" fill="#d48c7b"/><path d="M39 27q-1-14 7-19" fill="none"/><path d="M44 19q8-13 20-6-5 13-20 6z" fill="#91a077"/><path d="M23 36q-5 10 1 18" stroke="#f2b8a4" stroke-width="4"/>',
    carrot: '<path d="M20 64 32 26q8-12 20-2t4 18L23 67z" fill="#e7a06b"/><path d="m38 23-3-15m10 15 5-17m1 20L65 15" stroke="#88a575" stroke-width="5"/><path d="m30 38 8 5m3-12 9 6m-28 15 6 4" stroke="#c57e4e"/>',
    fish: '<path d="M55 34 70 23v33L55 47Q28 69 10 41q18-26 45-7z" fill="#9dbfc0"/><path d="M24 29q8 11 0 24m13-20q9 8 0 17" fill="none"/><circle cx="20" cy="39" r="2" fill="#526b66"/><path d="m37 28 6-11 10 14" fill="#85a7ac"/>',
    onion: '<path d="M34 22q-4-9-1-14m7 14V7m6 15 4-13" stroke="#a5ac79"/><path d="M34 21q-21 11-20 30 0 18 26 18t26-18Q66 32 46 21z" fill="#d9b48e"/><path d="M37 26q-15 30-5 40m13-40q13 27 3 40" stroke="#ecd0ab"/>',
    tomato: '<path d="M40 26q-22-9-27 14-5 26 27 28 30-1 28-23-3-26-28-19z" fill="#d97d69"/><path d="m40 31-15-10 11 1 5-11 5 12 12-5-9 13z" fill="#7e9465"/><path d="M23 39q-5 9 1 16" stroke="#f2ac90" stroke-width="4"/>',
    cheese: '<path d="m15 38 39-20 13 40-52 9z" fill="#efd08a"/><path d="m15 38 43 7 9 13-52 9z" fill="#e9bd66"/><path d="m15 38 43 7-4-27z" fill="#f9dda0"/><g fill="#d5a351" stroke="none"><circle cx="26" cy="53" r="4"/><circle cx="48" cy="55" r="5"/><ellipse cx="43" cy="33" rx="4" ry="2.5"/></g>',
    pepper: '<path d="M29 33q-9 12-7 32 18 7 36 0 2-20-7-32z" fill="#b69376"/><path d="M29 33V22h22v11z" fill="#8d7056"/><ellipse cx="40" cy="17" rx="13" ry="9" fill="#b69376"/><path d="M27 50h26m-26 5h26M40 5v3" fill="none"/>',
    rice: '<path d="M23 13h34l5 53H18z" fill="#b2bda2"/><path d="M23 13h34" stroke="#7f9071" stroke-width="6"/><rect x="27" y="30" width="26" height="26" rx="6" fill="#fff5dc"/><g stroke="#c5b795" stroke-width="3"><path d="m34 37 3 5m6-6 3 5m-13 6 3 4m7-6 3 5"/></g>',
    water: '<path d="m23 15 5 52h25l5-52z" fill="#e7f0e9"/><path d="m25 33 3 34h25l3-34q-15 6-31 0z" fill="#aed0d4"/><path d="m32 24 2 29" stroke="#fffaf1" stroke-width="4"/>',
    coffee: '<ellipse cx="38" cy="65" rx="28" ry="5" fill="#e7cbb0" stroke="none"/><path d="M57 31q20-3 12 14-4 6-12 4" fill="none" stroke-width="5"/><path d="M15 28h44v19q0 16-22 16T15 47z" fill="#d5a68d"/><ellipse cx="37" cy="28" rx="22" ry="7" fill="#fff3d8"/><ellipse cx="37" cy="29" rx="17" ry="4" fill="#785948"/><path d="M29 18q-6-7 0-13m14 13q-6-7 0-13" stroke="#b8b3a4" fill="none"/>',
    cinnamon: '<path d="m22 55 25-38q6-5 12 3L35 61q-7 7-13-6z" fill="#b98059"/><path d="m32 62 24-39m-34 32q7-8 13 6" fill="none"/><path d="m18 44 31-8q9 0 9 9l-34 8q-9 0-6-9z" fill="#c99368"/><path d="M24 53q-7-5-1-9l30-7" fill="none"/>',
    yeast: '<path d="m21 23 31-7 10 12v34l-31 7-10-12z" fill="#e8c993"/><path d="m21 23 10 13 31-8m-31 8v33" fill="none"/><path d="m21 23 31-7 10 12-31 8z" fill="#f6e3b9"/><path d="m38 43 16-4m-16 12 11-3" stroke="#b99865" stroke-width="3"/>',
    tea: '<path d="M57 31q20-3 12 14-4 6-12 4" fill="none" stroke-width="5"/><path d="M15 28h44v19q0 16-22 16T15 47z" fill="#aac0a5"/><ellipse cx="37" cy="28" rx="22" ry="7" fill="#f1e6ba"/><path d="M46 28v20l6 3v11h-13V51l7-3" fill="#f3d28c"/><path d="M29 18q-6-7 0-13" fill="none" stroke="#b0b7a1"/>',
    bun: '<ellipse cx="40" cy="62" rx="30" ry="6" fill="#e6d3b3" stroke="none"/><path d="M12 48q-3-25 28-28 32-1 29 28-1 17-29 17T12 48z" fill="#dca46a"/><path d="M27 52q-16-14 9-21 23-4 22 12-1 14-21 11-14-3-7-13 6-7 15-2 7 5-1 7" fill="none" stroke="#925d3b" stroke-width="4"/><g stroke="#fff1ce" stroke-width="3"><path d="m23 32 2 2m21-9 3 1m14 16 1 3m-14 14 2 1m-34-11 1 3"/></g>',
    cookies: '<ellipse cx="40" cy="66" rx="30" ry="5" fill="#e8d4b8" stroke="none"/><circle cx="29" cy="46" r="22" fill="#d2a06c"/><circle cx="51" cy="39" r="23" fill="#e0b27c"/><g fill="#795440" stroke="none"><path d="m39 28 7-3 2 7-8 2zm17 6 8 2-2 7-8-3zm-9 14 7-2 1 7-6 1zM25 51l7 2-2 7-7-3zm-8-13 8-2 1 7-8 1z"/></g>',
    slice: '<path d="m16 35 40-16 10 32-50 15z" fill="#ebbb9f"/><path d="M16 35v10l47-15-7-11z" fill="#fff1d8"/><path d="m16 52 49-14v8L16 60z" fill="#c97c76"/><path d="m16 35 40-16 7 11-47 15z" fill="#fff7e8"/><path d="M42 23q-8-13 2-13t6 10z" fill="#d88074"/>',
    house: '<path d="M14 37 40 14l26 23v30H14z" fill="#bd7770"/><path d="m7 38 33-29 33 29" fill="none" stroke="#825c52" stroke-width="6"/><path d="M32 67V45h16v22" fill="#e8caa3"/><path d="M20 37h12v13H20zm29 0h12v13H49z" fill="#c6dcdc"/><path d="M57 22V10h8v19" fill="#bf8d77"/>',
    cat: '<path d="M20 31 19 9l18 12h8L63 9l-3 24q17 35-20 36Q4 67 20 31z" fill="#d6ad85"/><path d="m24 19 9 7-9 3m31-10-8 7 8 3" fill="#e9c0af" stroke="none"/><path d="M27 41h1m24 0h1" stroke-width="4"/><path d="m37 47 4 3 4-3m-4 3v5m0 0-6 3m6-3 6 3M15 47l15 3m-15 7 15-3m22-4 15-3m-15 7 15 3" fill="none"/>',
    flower: '<path d="M39 68V35m1 20Q18 36 18 52q3 13 21 10m1-12q20-21 23-6 1 13-23 14" fill="#9aaf7d"/><g fill="#deb0a9"><ellipse cx="40" cy="15" rx="10" ry="13"/><ellipse cx="24" cy="25" rx="12" ry="10"/><ellipse cx="56" cy="25" rx="12" ry="10"/><ellipse cx="30" cy="40" rx="10" ry="12"/><ellipse cx="50" cy="40" rx="10" ry="12"/></g><circle cx="40" cy="28" r="11" fill="#efd38b"/>',
    sun: '<g stroke="#cba65d" stroke-width="3"><path d="M40 6v9m0 50v9M6 40h9m50 0h9M16 16l7 7m34 34 7 7M16 64l7-7m34-34 7-7"/></g><circle cx="40" cy="40" r="22" fill="#efd08a"/><path d="M31 37h1m16 0h1" stroke-width="3"/><path d="M33 46q7 7 14 0" fill="none"/>'
  };
  function icon(name, extraClass = '') {
    return `<svg class="mg-illustration ${extraClass}" viewBox="0 0 80 80" fill="none" stroke="#795f4e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.flower}</svg>`;
  }
  function polaroid(name, rotation) {
    return `<g transform="rotate(${rotation})"><rect x="-29" y="0" width="58" height="70" rx="2" fill="#fffaf0" stroke="#d9c5ac"/><rect x="-24" y="5" width="48" height="46" fill="#e7e9d6"/><svg x="-23" y="5" width="46" height="46" viewBox="0 0 80 80" fill="none" stroke="#795f4e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${shapes[name]}</svg><rect x="-3" y="-7" width="6" height="14" rx="1" fill="#b08b65"/></g>`;
  }
  function garland() {
    return `<svg viewBox="0 0 540 125" fill="none" class="mg-garland" aria-hidden="true"><path d="M-10 7Q270 105 550 7" stroke="#ac8b67" stroke-width="1.5"/><g transform="translate(105 36)">${polaroid('house', 9)}</g><g transform="translate(215 53)">${polaroid('flower', -6)}</g><g transform="translate(325 53)">${polaroid('cat', 6)}</g><g transform="translate(435 36)">${polaroid('sun', -9)}</g></svg>`;
  }
  let sceneNumber = 0;
  function kitchen() {
    const sceneId = 'mg-scene-' + (++sceneNumber);
    return `<svg viewBox="0 0 720 340" class="mg-kitchen-art" fill="none" aria-hidden="true">
      <defs><pattern id="${sceneId}-tiles" width="48" height="42" patternUnits="userSpaceOnUse"><rect width="48" height="42" fill="#f5eee1"/><path d="M48 0H0v42" stroke="#e7ddcb"/></pattern><linearGradient id="${sceneId}-daylight" x2="1" y2="1"><stop stop-color="#d8e9de"/><stop offset="1" stop-color="#f5e8bd"/></linearGradient></defs>
      <rect width="720" height="340" fill="url(#${sceneId}-tiles)"/><path d="m221 45 156 250h170L221 45" fill="#fffae1" opacity=".38"/>
      <rect x="34" y="24" width="174" height="180" rx="70" fill="#d5c5a8"/><rect x="43" y="32" width="156" height="162" rx="64" fill="url(#${sceneId}-daylight)"/>
      <path d="M43 163q50-54 92-10t64-14v55H43" fill="#b4c6a3"/><path d="M47 178q70-31 148-5v21H47" fill="#8faa8f"/>
      <path d="M121 33v164M43 111h156" stroke="#fef6e4" stroke-width="8"/><path d="M27 204h188" stroke="#b99b78" stroke-width="9" stroke-linecap="round"/>
      <path d="M49 32q-5 90-22 107h38q13-60 5-113m124 7q5 90 22 107h-38q-13-60-5-113" fill="#d6a99d" opacity=".75"/>
      <path d="M487 97h199" stroke="#bb9670" stroke-width="9" stroke-linecap="round"/>
      <g fill="#e1cbb0" stroke="#9d8065" stroke-width="1.5"><rect x="501" y="53" width="29" height="39" rx="5"/><rect x="540" y="43" width="32" height="49" rx="5"/><rect x="581" y="58" width="27" height="34" rx="5"/></g>
      <path d="M500 52h31m8-10h34m7 15h29" stroke="#88a191" stroke-width="7" stroke-linecap="round"/>
      <path d="M646 93V48m0 27q-30-25-20-32 18-6 20 22m1-5q24-32 30-16 0 17-30 22" stroke="#7f9b76" stroke-width="3" fill="#a6b68b"/><path d="m628 74 5 20h26l5-20z" fill="#cf9f89"/>
      <path d="M232 33q120 54 239 0" stroke="#b3926d" stroke-width="1.4"/>
      <g transform="translate(276 47) scale(.64)">${polaroid('house', 10)}</g><g transform="translate(352 56) scale(.64)">${polaroid('flower', -7)}</g><g transform="translate(425 45) scale(.64)">${polaroid('cat', 9)}</g>
      <rect y="250" width="720" height="18" rx="3" fill="#c6a37c"/><rect y="268" width="720" height="72" fill="#d9b68d"/>
      <path d="M0 278h720M12 322h155m47-26h132m44 32h218m28-33h84" stroke="#c49e73" opacity=".5"/>
      <path d="m40 239 24-26 71 15-17 20z" fill="#e4c39e"/><path d="m45 237 23-20 31 10-16 16zm38 6 16-16 31 4-15 14z" fill="#fff7e6" stroke="#c0a184"/><path d="m99 227-16 16" stroke="#a58866"/>
      <path d="M622 246v-65m0 30q-30-28-19-33 17-4 19 24m1 9q24-35 31-22 2 15-31 28" stroke="#819b72" stroke-width="3" fill="#a1b384"/><path d="m602 225 5 25h35l5-25z" fill="#b88d75"/>
      <ellipse cx="371" cy="295" rx="118" ry="11" fill="#a98763" opacity=".2"/>
    </svg>`;
  }
  function bowl() {
    return `<svg viewBox="0 0 240 180" fill="none" aria-hidden="true"><path class="mg-spoon" d="m143 68 45-56q9-7 15 1t-3 14l-52 50" fill="#c49f76" stroke="#947558" stroke-width="2"/><path d="M24 64h192q-6 94-96 101Q30 158 24 64z" fill="#98b6a9" stroke="#66897a" stroke-width="2"/><path d="M43 85q10 53 45 63" stroke="#bcd0bb" stroke-width="7" stroke-linecap="round"/><ellipse cx="120" cy="64" rx="98" ry="26" fill="#c3d2b9" stroke="#66897a" stroke-width="2"/><ellipse class="mg-batter" cx="120" cy="66" rx="80" ry="16" fill="#e8cea0"/><path d="M83 64q31-15 63 0t-26 12" stroke="#ceb080" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function cake(decorated = true) {
    return `<svg viewBox="0 0 240 180" fill="none" stroke="#8e6c55" stroke-width="2" aria-hidden="true"><ellipse cx="120" cy="157" rx="106" ry="15" fill="#efdfc6"/><path d="M43 72h154v64q-77 34-154 0z" fill="#d8ac7b"/><path d="M43 95q77 27 154 0v16q-77 27-154 0z" fill="#c7877e"/><ellipse cx="120" cy="72" rx="77" ry="24" fill="${decorated ? '#fff4dd' : '#e7c593'}"/>${decorated ? '<path d="M43 73q12 22 25 7 14 25 27 8 14 20 28 4 17 16 30-5 14 12 25-8 12 8 19-6v15q-77 35-154 0z" fill="#fff4dd"/><g fill="#d67b70"><path d="M71 60q-13-14 0-18 17 0 5 18zM116 52q-13-14 0-18 17 0 5 18zM157 64q-13-14 0-18 17 0 5 18z"/></g><path d="M119 40V15" stroke="#9ab5ad" stroke-width="7"/><path class="mg-flame" d="M119 11q-8-7 0-15 8 8 0 15z" fill="#e2b75c" stroke="none"/>' : ''}</svg>`;
  }
  function oven() {
    return `<svg viewBox="0 0 240 180" fill="none" stroke="#816d55" stroke-width="2" aria-hidden="true"><rect x="36" y="15" width="168" height="151" rx="13" fill="#dad8be"/><rect x="47" y="26" width="146" height="29" rx="6" fill="#f3e9cf"/><circle cx="64" cy="40" r="6" fill="#ae9472"/><circle cx="85" cy="40" r="6" fill="#ae9472"/><circle cx="174" cy="40" r="5" fill="#e2ae66"/><rect x="53" y="67" width="134" height="80" rx="8" fill="#796d58"/><rect x="61" y="75" width="118" height="62" rx="4" fill="#b59161"/><path d="M65 119h110" stroke="#ead7a8" stroke-width="3"/><path d="M81 115q0-23 39-23t39 23z" fill="#e1bd80"/><path d="M74 64h92" stroke="#a99272" stroke-width="7" stroke-linecap="round"/><path d="M95 86q-7-7 0-14m25 14q-7-7 0-14m25 14q-7-7 0-14" stroke="#e5c68c" stroke-linecap="round"/><path d="M50 166v6m140-6v6" stroke-width="6"/></svg>`;
  }
  function cover(type) {
    if (type === 'zoo') return window.ZooArt.cover();
    if (type === 'kitchen') return `<div class="mg-cover mg-cover-kitchen">${kitchen()}<div class="mg-cover-bowl">${bowl()}</div><div class="mg-cover-food mg-cover-food-one">${icon('egg')}</div><div class="mg-cover-food mg-cover-food-two">${icon('flour')}</div></div>`;
    if (type === 'cafe') return `<div class="mg-cover mg-cover-cafe"><div class="mg-cafe-awning"></div><span class="mg-cover-sign">LILLA FIKET</span><div class="mg-cover-cup">${icon('coffee')}</div><div class="mg-cover-bun">${icon('bun')}</div><div class="mg-cover-plant">${icon('flower')}</div></div>`;
    return `<div class="mg-cover mg-cover-memory">${garland()}<span class="mg-cover-note">ett litet ord, ett stort minne.</span></div>`;
  }
  window.MiniGameArt = { icon, garland, kitchen, bowl, cake, oven, cover };
})();
