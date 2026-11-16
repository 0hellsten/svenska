/* Gong Heng. Original animated lakeside and recognizable Swedish fish silhouettes. */
(function () {
  'use strict';
  const tree = (x, y, size, color) => `<path d="m${x} ${y} ${-size*.38} ${size*.8}h${size*.18}l${-size*.24} ${size*.36}h${size}l${-size*.24} ${-size*.36}h${size*.18}Z" fill="${color}"/>`;
  function scene() {
    const farTrees = Array.from({length:31}, (_,i) => tree(i*22-25,113-Math.sin(i*.64)*15,34+(i%5)*7,['#718d85','#7f998c','#68877e'][i%3])).join('');
    const nearTrees = Array.from({length:12}, (_,i) => tree(i*56-19,141-Math.cos(i*.7)*10,25+(i%3)*9,['#507667','#5f806b','#769071'][i%3])).join('');
    return `<svg class="gf-landscape" viewBox="0 0 600 480" fill="none" role="img" aria-label="ท่าไม้ริมทะเลสาบในสวนเบิร์ช มีแสงอุ่นบนผิวน้ำและป่าอยู่ไกล ๆ">
      <defs>
        <linearGradient id="gf-sky" x2="0" y2="1"><stop stop-color="#f0c9b3"/><stop offset=".55" stop-color="#f6e2b9"/><stop offset="1" stop-color="#d7dfca"/></linearGradient>
        <linearGradient id="gf-water" x2=".25" y2="1"><stop stop-color="#b3c8b7"/><stop offset=".46" stop-color="#81aca5"/><stop offset="1" stop-color="#416f73"/></linearGradient>
        <linearGradient id="gf-sun-trail" x2="0" y2="1"><stop stop-color="#fff2c2" stop-opacity=".8"/><stop offset="1" stop-color="#f6e5ae" stop-opacity="0"/></linearGradient>
        <linearGradient id="gf-planks" x2="1" y2=".4"><stop stop-color="#b58454"/><stop offset=".55" stop-color="#d1a56f"/><stop offset="1" stop-color="#a1744d"/></linearGradient>
        <linearGradient id="gf-shore" x2="0" y2="1"><stop stop-color="#a5ad75"/><stop offset="1" stop-color="#596e46"/></linearGradient>
        <radialGradient id="gf-sun-glow"><stop stop-color="#fff5cb" stop-opacity=".8"/><stop offset="1" stop-color="#ffe4b0" stop-opacity="0"/></radialGradient>
        <clipPath id="gf-lake-clip"><path d="M0 158H600V480H0Z"/></clipPath>
      </defs>
      <path fill="url(#gf-sky)" d="M0 0h600v480H0Z"/>
      <circle cx="418" cy="75" r="85" fill="url(#gf-sun-glow)"/><circle cx="418" cy="75" r="24" fill="#fff2c3"/>
      <g class="gf-clouds" fill="#fff4d9" opacity=".65"><path d="M47 46q12-17 31-7 6-16 24-6 16-7 25 10 19-2 23 6H47Z"/><path d="M267 30q14-12 23-2 14-16 30-1 20-1 25 9h-91Z"/></g>
      <path d="M0 118q56-35 106-12t99-5q66-26 121-9t124 7q65-30 150 4v71H0Z" fill="#9aafa0"/>
      ${farTrees}
      <path d="M0 155q75-17 128-4 66-12 124 0 61-12 121 1 117-20 227-2v32H0Z" fill="#678872"/>
      ${nearTrees}
      <path d="M0 171q139 9 294 1t306-1v309H0Z" fill="url(#gf-water)"/>
      <g clip-path="url(#gf-lake-clip)">
        <path d="m402 173-46 267h159l-79-267Z" fill="url(#gf-sun-trail)" opacity=".65"/>
        <g class="gf-water-shimmer" stroke="#f5e8b8" stroke-linecap="round" opacity=".68"><path d="M394 182h38m-42 8h48m-58 13h67m-80 12h82m-78 19h100m-122 21h124m-120 23h136m-152 27h165m-179 30h182" stroke-width="2"/><path d="M386 196h14m-30 29h26m31 19h31m-67 22h24m36 27h22m-73 24h21" stroke-width="4"/></g>
        <g class="gf-water-lines" stroke="#d6e5cc" stroke-width="1.6" stroke-linecap="round" opacity=".44"><path d="M6 189q20-4 42 0m84 4h28m32-10q27 3 44 0m278 1h39M37 216q33-5 65 0m71 7h36m57-13h49m186 10q30-5 66 0M4 249q24 4 49 0m61-6q26-4 46 0m70 14h49m244-8q26 4 62 0M52 287q25-5 57 0m74 10h36m57-12q30 4 57 0m178 2h40M14 329q25 4 52 0m61 4h32m45-5h35m235 5q41-4 74 0M65 358h40m54 7q31 4 63 0m259-12h44"/></g>
        <g class="gf-water-lines gf-water-lines-two" stroke="#3e7879" stroke-width="2" stroke-linecap="round" opacity=".3"><path d="M27 204h23m211 28h28m-85 38h25m290-26h35M75 310h32m218 31h38m164-27h25m-269 60h56m142 11h38"/></g>
        <g class="gf-swimming-fish gf-swimming-one" transform="translate(289 290)" fill="#3c6f6b" opacity=".27"><path d="M-18 0q15-12 33 0-18 13-33 0l-12-7v14Z"/><path d="m-4-4 4-8 6 8"/></g>
        <g class="gf-swimming-fish gf-swimming-two" transform="translate(495 319)" fill="#376a69" opacity=".23"><path d="M-13 0q14-9 27 0-15 10-27 0l-10-6v12Z"/></g>
        <g class="gf-fish-shadow" transform="translate(390 280)" opacity="0"><ellipse rx="25" ry="8" fill="#244f4f" opacity=".4"/><path d="m-20 0-12-8v16Z" fill="#244f4f" opacity=".4"/></g>
        <ellipse class="gf-lake-ripple gf-ripple-one" cx="177" cy="267" rx="21" ry="5" stroke="#e9eed4" stroke-width="1.4" opacity=".4"/>
        <ellipse class="gf-lake-ripple gf-ripple-two" cx="462" cy="224" rx="18" ry="4" stroke="#e9eed4" stroke-width="1.4" opacity=".4"/>
        <ellipse class="gf-cast-ring" cx="390" cy="255" rx="23" ry="6" stroke="#f8efcb" stroke-width="2" opacity="0"/>
        <g class="gf-splash" transform="translate(390 255)" opacity="0"><ellipse rx="24" ry="6" stroke="#fff3cf" stroke-width="3"/><path d="M-9-5q-7-17-10-9m20 8 2-23m8 24q6-18 13-18" stroke="#ebf5dd" stroke-width="3" stroke-linecap="round"/><circle cx="-24" cy="-14" r="2.5" fill="#edf3dc"/><circle cx="27" cy="-12" r="2" fill="#edf3dc"/></g>
      </g>
      <g class="gf-birds" stroke="#6b7b6e" stroke-width="2" stroke-linecap="round"><path d="M220 64q6-7 12 0 6-7 12 0m16-13q4-4 8 0 4-4 8 0"/></g>
      <path d="M0 329q33-2 66 36 22 6 42 33l44 82H0Z" fill="url(#gf-shore)"/>
      <path d="M600 299q-27 0-38 30-31-6-56 36l-40 115h134Z" fill="url(#gf-shore)"/>
      <g class="gf-reeds gf-reeds-right" stroke="#486a4e" stroke-width="3" stroke-linecap="round"><path d="M570 357q-15-62-1-95m1 95q7-58 21-65m-36 67q-16-43-8-73m30 67q16-37 20-39m-37 47q-25-36-33-36"/><path d="m570 266 1-15m-24 37-2-16m44 22 6-16" stroke="#906c46" stroke-width="7"/></g>
      <g class="gf-reeds gf-reeds-left" stroke="#53734f" stroke-width="3" stroke-linecap="round"><path d="M44 379q-5-48-18-63m18 62q13-57 4-82m-11 82q-16-34-30-36m38 40q22-36 27-40"/><path d="m49 298-2-15m-20 35-6-13" stroke="#a18350" stroke-width="6"/></g>
      <g stroke="#704d36" stroke-linejoin="round"><path d="M65 372h27v95H65Zm278 17h26v91h-26Z" fill="#77573b" stroke-width="3"/><path d="m93 350 231 5 110 125H29Z" fill="#5e5940" opacity=".25" stroke="none"/>
        <path d="m103 344 216 6 93 130H26Z" fill="url(#gf-planks)" stroke-width="3"/><path d="m91 363 245 5m-260 18 274 5m-288 20 306 5m-323 24 342 5m-357 24 377 5" fill="none" stroke-width="3"/>
        <path d="m159 346-19 134m97-132 34 132m-97-115-3 21m28 6 1 18m90 13 6 22m-181-13-4 19m155 5 8 18" fill="none" stroke="#9b7148" stroke-width="2"/>
        <path d="m109 355 28 1m92 3 36 1m-167 16 36 2m131 21 35 1m-213 27 39 1m167 20 33 2" stroke="#e6c18a" stroke-width="2" stroke-linecap="round"/>
        <path d="M74 342q9-7 20 0v35q-10 7-20 0Zm260 9q9-7 20 0v40q-9 6-20 0Z" fill="#b58a5c" stroke-width="2.5"/><ellipse cx="84" cy="342" rx="10" ry="4" fill="#dcc092"/><ellipse cx="344" cy="351" rx="10" ry="4" fill="#dcc092"/>
      </g>
      <g transform="translate(270 429) rotate(7)" stroke="#70573b" stroke-width="2"><path d="M-27-20h54l-6 43h-42Z" fill="#b2955f"/><ellipse cy="-20" rx="27" ry="9" fill="#cbb07e"/><path d="M-22-11q23 6 44 0m-41 11q20 6 39 0m-36 11q17 6 32 0m-25-24 3 32m8-31v31m8-32-3 32" stroke="#8b764e"/><path d="M-25-18q-3-40 25-39 27 1 25 39" fill="none" stroke="#b49967" stroke-width="5"/></g>
      <g class="gf-rod" stroke-linecap="round"><path d="M112 448Q158 353 172 262" stroke="#463b31" stroke-width="7"/><path d="M112 448Q158 353 172 262" stroke="#b9814e" stroke-width="4"/><path d="m114 447 16-35" stroke="#7b5740" stroke-width="10"/><path d="m115 445 14-31" stroke="#bc9766" stroke-width="6"/><circle cx="137" cy="414" r="12" fill="#9ba38a" stroke="#40564a" stroke-width="3"/><circle cx="137" cy="414" r="6" fill="#c9c8a3" stroke="#546252" stroke-width="2"/><path d="m143 420 10 5" stroke="#40564a" stroke-width="4"/><g class="gf-rod-tip" transform="translate(172 262)"><circle r="3" fill="#d4bd8b" stroke="#495d4c" stroke-width="1.8"/></g></g>
      <path class="gf-line" d="M172 262Q280 225 390 255" stroke="#fff4c8" stroke-width="1.7" fill="none" opacity=".92"/>
      <g class="gf-float" transform="translate(390 255)"><g class="gf-float-body"><ellipse cy="8" rx="10" ry="2.5" fill="#3d7673" opacity=".35"/><path d="M0-19V10" stroke="#615b40" stroke-width="1.8"/><path d="M-4-8q4-8 8 0v9q-4 5-8 0Z" fill="#f2e6b3" stroke="#6b694b" stroke-width="1.2"/><path d="M-4-8q4-8 8 0v4h-8Z" fill="#d78563" stroke="#9b6046" stroke-width="1"/><path d="M0-19v5" stroke="#c06449" stroke-width="2.5"/></g></g>
      <g class="gf-dragonfly" transform="translate(514 288)"><path d="M-1-5v13" stroke="#4c6d6a" stroke-width="2"/><path d="M-1-3q-16-11-15-3 2 8 15 6m1-3q16-11 15-3-2 8-15 6" fill="#dfead4" opacity=".8"/><circle cy="-7" r="2" fill="#3d5f5d"/></g>
      <g fill="#e8e3bc"><ellipse cx="558" cy="414" rx="2" ry="3"/><ellipse cx="35" cy="391" rx="2" ry="3"/></g>
    </svg>`;
  }
  const profiles = {
    abborre:{ body:'#92a270', belly:'#e0d49c', fin:'#ce8250', back:'#64764e', shape:'perch', markings:'stripes' },
    gadda:{ body:'#8a9b69', belly:'#ddd49b', fin:'#a28e57', back:'#5c734c', shape:'pike', markings:'spots' },
    mort:{ body:'#b6c7bc', belly:'#eee5c4', fin:'#bd7461', back:'#809b8c', shape:'roach', markings:'silver', eye:'#b7654e' },
    braxen:{ body:'#bca56c', belly:'#e9d5a3', fin:'#8c8e74', back:'#8e8d59', shape:'bream', markings:'scales' },
    sutare:{ body:'#8b9860', belly:'#c5bf7c', fin:'#6b7952', back:'#626f46', shape:'tench', markings:'scales', eye:'#bb7e4e' },
    sarv:{ body:'#c2b878', belly:'#f0e2ab', fin:'#be6a4e', back:'#8a9b67', shape:'roach', markings:'scales', eye:'#d4ad52' },
    gos:{ body:'#a8ad76', belly:'#e5ddaf', fin:'#9c9e6e', back:'#73875a', shape:'zander', markings:'stripes' },
    oring:{ body:'#b2a273', belly:'#ead5a5', fin:'#b49a6b', back:'#7e8b62', shape:'trout', markings:'trout' }
  };
  const aliases = { perch:'abborre',pike:'gadda',roach:'mort',bream:'braxen',tench:'sutare',rudd:'sarv',zander:'gos',trout:'oring',gädda:'gadda',mört:'mort',gös:'gos',öring:'oring' };
  function fish(id) {
    const item = profiles[aliases[id] || id] || profiles.abborre;
    const long = ['pike','zander'].includes(item.shape), high = item.shape === 'bream';
    const body = high ? 'M32 53q11-34 57-35 35 0 62 30l9 5-9 7q-29 28-63 26-43-2-56-33Z' : long ? 'M29 53q23-20 73-18 28 1 49 11l16 7-16 7q-34 17-70 12-31-3-52-19Z' : 'M29 53q16-27 61-28 43 0 67 27-23 28-66 28-44 0-62-27Z';
    const eyeX = long ? 146 : 144, eyeY = high ? 46 : 48;
    let markings = '';
    if (item.markings === 'stripes') markings = [53,68,83,98,113].map((x,i)=>`<path d="M${x} ${long ? 39 : 32+(i%2)*2}q-6 18 1 ${long ? 22 : 34}" stroke="${item.back}" stroke-width="5.5" opacity=".72" fill="none"/>`).join('');
    if (item.markings === 'spots') markings = [[53,46],[72,42],[90,46],[112,43],[66,56],[91,58],[116,56]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3.5" ry="1.9" fill="#dbd6a0"/>`).join('');
    if (item.markings === 'trout') markings = [[48,40],[62,35],[80,39],[101,37],[122,40],[56,52],[77,49],[97,51],[117,51]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3===0?2.7:2}" fill="${i%3===0?'#b76750':'#686e4e'}" stroke="#e0d5a9" stroke-width=".6"/>`).join('');
    if (['scales','silver'].includes(item.markings)) markings = `<path d="m51 42 8 6-8 6m18-14 8 7-8 7m18-16 8 8-8 8m18-18 8 8-8 8" fill="none" stroke="${item.belly}" stroke-width="1.4" opacity=".65"/>`;
    const upperFin = item.shape === 'pike' ? `<path d="m58 38-12-17 30 16"/>` : item.shape === 'zander' ? '<path d="m48 40 2-18 8 6 4-10 8 10 6-8 5 11 5-6 6 11m9-1 7-17 8 6 5-4 6 18"/>' : high ? '<path d="m65 25 9-20 15 15 9-3 8 9"/>' : '<path d="m55 35 3-17 8 5 4-10 8 10 8-6 9 13 10-5 6 10"/>';
    return `<svg class="gf-fish-art" viewBox="0 0 180 100" fill="none" stroke="#53624a" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><ellipse cx="89" cy="90" rx="62" ry="5" fill="#617a4b" opacity=".10"/><g fill="${item.fin}"><path d="m38 52-28-21 6 22-6 23 29-21Z"/>${upperFin}<path d="m67 ${high?77:72}-5 15 20-12m28-2 14 9 8-15"/></g><path d="${body}" fill="${item.body}"/><path d="${high?'M39 62q43 30 111-6-30 33-62 30-36-2-49-24Z':long?'M36 58q54 19 115-1-33 21-70 15-28-3-45-14Z':'M35 61q53 23 116-3-21 23-60 22-37 0-56-19Z'}" fill="${item.belly}" stroke="none"/>${markings}<path d="M130 37q-9 17 0 30" fill="none" stroke="${item.back}" stroke-width="2"/><path d="m94 58 24-2-17 15Z" fill="${item.fin}"/><circle cx="${eyeX}" cy="${eyeY}" r="5.1" fill="${item.eye || '#d3c78d'}"/><circle cx="${eyeX+1}" cy="${eyeY}" r="2.3" fill="#333e30" stroke="none"/><path d="m${long?159:153} 56h7" stroke="#4b5a42" stroke-linecap="round"/>${item.shape==='tench'?'<path d="m158 57 4 7" fill="none" stroke="#7a8055"/>':''}<path d="M39 45q30-18 74-8" stroke="#f0e4b8" stroke-width="2" stroke-linecap="round" opacity=".55"/></svg>`;
  }
  function bait(id) {
    const shrimp = '<path d="M34 14q-17-3-23 12-8 23 17 31 23 5 28-13 5-20-14-24-12-2-14 10-2 8 8 10l7-1q-3 13-16 5-12-7-7-19 5-10 14-11Z" fill="#d99168"/><path d="m39 19-1-9 7 6 9-6-4 12m-23-3 5 6m-14 0 7 5m-9 4 8 3m-4 8 7-3m1 13 1-7m10 9-3-8m10 5-5-7" stroke="#a36448"/><path d="M34 16q5-14 22-12M33 17Q28 2 17 4" fill="none"/><circle cx="33" cy="15" r="1.7" fill="#4a4234" stroke="none"/>';
    const worm = '<path d="M14 46q-2-23 12-22 15-1 9 18-4 14 8 12 14-3 7-20-6-17-1-22" stroke="#b87763" stroke-width="11" fill="none"/><path d="m12 42 8 1m-8-9 8 3m-4-13 7 5m3-7 3 7m3 6 8 2m-7 7 8 3m1 8 1-7m7 1 5-4m-6-2 8-3m-10-8 8-2m-10-6 8-2m-10-6 8 1" stroke="#925c50" stroke-width="1.4"/>';
    const bread = '<path d="M12 27Q3 13 19 9q13-8 25 0 20 2 12 20v28H12Z" fill="#b98550"/><path d="M17 29q-10-13 4-15 10-6 20 0 15 2 10 14v24H17Z" fill="#efdbab"/><path d="m21 29 5-2m15 3 4-2m-14 9 3 1m-13 8 4-2m15 2 3 1" stroke="#d6bb85" stroke-width="2"/>';
    return `<svg class="gf-bait-art" viewBox="0 0 64 64" fill="none" stroke="#8f6247" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${id==='worm'?worm:id==='bread'?bread:shrimp}</svg>`;
  }
  window.FarmFishingArt = { scene, fish, bait };
})();
