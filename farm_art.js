/* Original vector pieces placed over the painted Björkbacken map. */
(function () {
  'use strict';
  const svg = (art, className = '') => `<svg class="${className}" viewBox="0 0 120 84" aria-hidden="true" fill="none" stroke="#554532" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${art}</svg>`;
  const figures = {
    hen:'<path d="m46 61-2 13m22-13 3 13m-31 0h13m13 0h12" stroke="#a26836"/><path d="M31 48 16 29q-1 22 11 29 13 14 34 9 24-5 25-30 3-13-8-20-10-5-17 5l-4 17q-18-7-26 9Z" fill="#f4dfbd"/><path d="M61 23q-2-13 6-13 4 0 5 5 8-8 12 1l-4 8" fill="#bc5f4f"/><path d="m84 29 13 6-13 4" fill="#d6a147"/><path d="M35 50q11-7 25 3-13 12-25-3Z" fill="#dcc3a3"/><circle cx="75" cy="29" r="2" fill="#42382e" stroke="none"/>',
    cow:'<path d="M28 53v22h9l3-22m36 0v22h9l5-26" fill="#efe3ce"/><path d="M27 39Q9 32 11 60m0-1 4 8" stroke="#6b5541"/><path d="M25 37q0-11 18-12h37l13 23-11 12H38q-16-1-13-23Z" fill="#f5e9d4"/><path d="M39 26q10 0 14 12t-8 13q-14 1-17-11m32 20q-6-17 8-20l12 2 5 17" fill="#76604d" stroke="none"/><path d="m84 25-4-13 10 8m10 0 12-6-4 13" fill="#dec89f"/><path d="M82 32q0-13 14-13t15 14l-3 18H88Z" fill="#f3e3cc"/><rect x="84" y="42" width="29" height="14" rx="7" fill="#e8b7ab"/><circle cx="92" cy="35" r="1.8" fill="#42382e" stroke="none"/><circle cx="104" cy="35" r="1.8" fill="#42382e" stroke="none"/>',
    pig:'<path d="M27 49q-12 0-12-8 0-6 7-4 4 2 1 6" stroke="#b97870"/><path d="M27 56 26 72h11l4-15m28 0 3 15h11l-1-19" fill="#e6a499"/><path d="M23 48q0-20 31-20t38 23q-7 18-35 16-28 0-34-19Z" fill="#eeb2a6"/><path d="M73 34 69 16q13 2 18 13m8 0q4-12 16-12l-5 18" fill="#e8a399"/><path d="M73 38q7-16 21-10 15 4 15 17 1 15-17 17-24 0-19-24Z" fill="#f6c6b9"/><ellipse cx="101" cy="49" rx="12" ry="8" fill="#e89990"/><path d="M97 48v2m8-2v2m-20-9v1m15-2v1" stroke="#744e45"/>',
    duck:'<path d="M9 62q21 7 42 1t60-1M20 72q26 5 51 0t33 0" stroke="#6ca5ac"/><path d="m20 48-9-14 22 9q17-8 31-2l6-10q-3-14 7-20 16-7 23 9l-1 11q-3 12-14 15-9 16-35 16-21 0-30-14Z" fill="#eee3bc"/><path d="M71 31q-5-18 7-22 17-6 23 14l-8 12Z" fill="#6e967b"/><path d="m96 23 16 4-3 7-14-2" fill="#e7b44d"/><path d="M31 48q18-9 31 2-11 13-31-2Z" fill="#c3aa83"/><circle cx="88" cy="21" r="1.8" fill="#3c3228" stroke="none"/>',
    sheep:'<path d="M31 54v21h9l2-19m34 0 2 19h9l4-25" fill="#796453"/><path d="M25 47q-9-10-1-16-1-14 13-14 7-9 17-4 8-9 18-1 14-2 20 10 13 0 12 14 8 9-1 16-1 12-16 11-11 7-23 1-14 6-24-2-13 0-15-15Z" fill="#f3e7cf"/><path d="M78 29q-10-9-15-4 2 13 13 15m17-12q10-8 16-2-2 11-15 13" fill="#7b6552"/><ellipse cx="86" cy="39" rx="13" ry="15" fill="#9f8268"/><path d="M82 36v1m9-1v1m-9 9q4 3 8 0" stroke="#473c32"/>',
    horse:'<path d="M26 37q-17 4-15 25l-4 7m31-18-3 24h9l7-23m24 0-1 23h9l5-30" fill="#b98660"/><path d="M27 37q6-10 26-8l24 2 8-19 12 2-3 12 14 15q4 9-6 12l-17-6-12 11H42q-18 0-15-21Z" fill="#bb845f"/><path d="M74 33q2-13 9-24 10-4 16 4l-13 9-4 18" fill="#6f4f3c"/><path d="m87 14 2-12 6 11m6 33 3 1m-7-12v1" stroke="#47392f"/>',
    foal:'<path d="M32 43q-17 6-13 19m21-6-3 19m9-19-1 19m28-20 3 20m4-21 6 21" stroke="#a6795e" stroke-width="5"/><path d="M29 46q6-12 26-10l15 1 9-21 13 2 10 17q4 7-4 10l-12-2-5 14-30 3q-20-1-22-14Z" fill="#d8aa80"/><path d="m78 18 1-12 7 9 7-7v12" fill="#c39373"/><path d="M70 37q4-15 10-20l8 2-6 17" fill="#98694f"/><path d="M91 29v1m5 8h2" stroke="#47392f"/>'
  };
  const symbols = { carrot:'🥕', potato:'🥔', wheat:'🌾', berry:'🍓', pumpkin:'🎃', egg:'🥚', milk:'🥛', duckegg:'🥚', truffle:'🍄', wool:'🧶', flour:'🌾', bread:'🍞', jam:'🫙', butter:'🧈', flowers:'🌷', lantern:'🏮', bench:'🪑', seed:'✦', water:'💧', harvest:'🧺' };
  function animal(id) { return svg(`<ellipse cx="60" cy="73" rx="44" ry="7" fill="#5e503025" stroke="none"/>${figures[id]}`, 'fb-animal-art'); }
  function plant(id, stage) {
    if (stage === 'empty') return '<span class="fb-furrows"></span>';
    if (stage === 'dry') return '<span class="fb-furrows"></span><span class="fb-seeds">· · ·</span>';
    if (stage === 'growing') return `<span class="fb-furrows"></span>${svg('<path d="M60 67V39m0 10q-20 3-27-17 22-3 27 14m0-1q3-21 25-24-2 23-25 26" fill="#91ae55" stroke="#52693c" stroke-width="4"/>', 'fb-sprout')}`;
    return `<span class="fb-furrows"></span><span class="fb-ripe" aria-hidden="true">${symbols[id]}</span>`;
  }
  function flag(step, up) {
    const height = 57 * up;
    return svg(`<ellipse cx="58" cy="74" rx="31" ry="5" fill="#8f9f6d" stroke="none"/><path d="M52 72V8" stroke="#887553" stroke-width="5"/><path d="M52 72V8" stroke="#fff9dc" stroke-width="3"/><circle cx="52" cy="7" r="3" fill="#dba446"/><path d="M52 14q10 0 10 11v${step ? 44 : 21}${step ? 'q-7 5-10 0' : 'm0 8v13l-6 4'}" stroke="#b5925f"/><g transform="translate(0 ${61-height})"><path d="M53 0q11 3 36 0v18q-20 3-36 0Z" fill="#3d7694"/><path d="M53 8q12 3 36 0M63 1v18" stroke="#eac45f" stroke-width="4"/></g>`, 'fb-flag-art');
  }
  window.FarmArt = { animal, plant, flag, symbols };
})();
