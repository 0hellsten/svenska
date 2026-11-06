/* Painted scene assets and code-native game chrome. */
(function () {
  'use strict';
  const sources = {
    forest: 'assets/zoo/forest.webp', wetland: 'assets/zoo/wetland.webp',
    greenhouse: 'assets/zoo/greenhouse.webp', animals: 'assets/zoo/animals.webp'
  };
  const icons = {
    moon: '<path d="M20 14A8 8 0 0 1 10 4 8 8 0 1 0 20 14Z"/>',
    book: '<path d="M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14"/>',
    lamp: '<path d="M8 5h8l3 14H5zM9 5V3h6v2M4 21h16M12 9q-5 7 0 8 5-1 0-8z"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m0 6 3-3"/>',
    leaf: '<path d="M20 3Q3 2 4 14q3 11 12 2 4-5 4-13ZM3 22 16 8"/>',
    water: '<path d="M12 2Q-1 18 12 22 25 18 12 2ZM5 16q7 4 14 0"/>',
    flower: '<path d="M12 8C3-7-5 14 7 13c-12 9 10 18 9 5 13 2 12-19 0-10-1-13-14-8-4 0Z"/><circle cx="12" cy="12" r="3"/>',
    lens: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6m-3-3h6"/>',
    sound: '<path d="M3 9h4l5-5v16l-5-5H3zm13-2q6 5 0 10m3-13q8 8 0 16"/>',
    lock: '<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
    eye: '<path d="M2 12q10-15 20 0-10 15-20 0Z"/><circle cx="12" cy="12" r="3"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-3 5-5 3 3-5z"/>',
    check: '<path d="m5 12 5 5L20 6"/>',
    flag: '<path d="M5 22V3q6-4 14 0v11q-8-4-14 0"/>'
  };
  function icon(id) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id] || icons.leaf}</svg>`; }
  function animal(id, extra = '') {
    const index = window.ZooCore.animals.findIndex(item => item.id === id);
    return `<span class="ze-animal-art ${extra}" style="background-image:url('${sources.animals}');background-position:${index % 4 * 100 / 3}% ${Math.floor(index / 4) * 50}%" aria-hidden="true"></span>`;
  }
  function image(room, cls = '') { return `<img class="${cls}" src="${sources[room]}" alt="" draggable="false">`; }
  function cover() {
    return `<div class="mg-cover ze-cover">${image('forest')}<div class="ze-cover-shade"></div><span class="ze-cover-kicker">ETT SVENSKT MYSTERIUM</span><strong>Nattnyckeln<span>BJÖRKGLÄNTANS DJURPARK</span></strong><span class="ze-cover-moon">${icon('moon')}</span></div>`;
  }
  function portrait() {
    return `<svg class="ze-portrait" viewBox="0 0 100 112" fill="none" aria-hidden="true"><path d="M6 112q2-35 44-35t44 35" fill="#40565c" stroke="#192c34" stroke-width="2"/><path d="m27 85 22 17 25-17" fill="#af8b58"/><path d="M43 71h15v17q-7 9-15 0" fill="#e9ba9a"/><path d="M24 45Q8 12 45 7q39-1 33 43l-2 32-13-4 4-28-39-1-3 30-9-4z" fill="#c0a270" stroke="#554a42" stroke-width="1.5"/><path d="M27 40q0-23 24-23 24 0 24 25v17q-2 24-24 26-24-4-24-27z" fill="#f0d0b1" stroke="#8e6c59" stroke-width="1"/><path d="M24 44q8-2 13-17 15 14 37 12l3-9Q62 3 39 16q-14 9-15 28z" fill="#c3a775" stroke="#79654d" stroke-width="1.4"/><path d="M32 48q7-5 14 0m12 0q7-5 13-1" stroke="#79644b" stroke-width="1.7"/><path d="M33 54q6-8 13 0-6 9-13 0Zm25 0q6-8 12-1-5 9-12 1Z" fill="#fff8e7" stroke="#4c4a48" stroke-width="1.1"/><ellipse cx="40" cy="54" rx="3" ry="4" fill="#69898c"/><ellipse cx="64" cy="53" rx="3" ry="4" fill="#69898c"/><circle cx="41" cy="52" r="1" fill="#fff"/><circle cx="65" cy="51" r="1" fill="#fff"/><path d="m51 58-1 6 3 1m-9 7q7 4 14-1" stroke="#ba8c76" stroke-width="1.2" stroke-linecap="round"/><path d="M24 72q-4 23 4 28m-3-20 7 6-8 5 6 6" stroke="#b99a65" stroke-width="7" stroke-linecap="round"/><path d="m77 83 5 17-16 5-5-18z" fill="#688780" stroke="#203a3e"/><path d="m67 91 8-1m-6 6 8-1" stroke="#d6c9a5" stroke-width="1.5"/></svg>`;
  }
  // Reuse actual background pixels for the occluding leaves, bark and water.
  // The masks never introduce flat patches into the painted scene.
  function foreground(roomId) {
    const animals = window.ZooCore.animals.filter(animal => animal.room === roomId);
    const masks = animals.map(animal => {
      let shape = '<path d="M0 100Q12 58 34 48q3 26-17 33 23-9 36-34 10 24-9 41 23-19 43-18-3 21-25 28z"/>';
      if (animal.id === 'owl') shape = '<path d="M0 100V18l12-12-2 64 20 12 55 3 15 15z"/>';
      if (animal.id === 'heron') shape = '<path d="M20 100 12 3m27 97L48 7m15 93L81 0m3 100L66 25" fill="none" stroke="white" stroke-width="7"/>';
      if (animal.id === 'otter') shape = '<path d="M0 74q12-7 24 0t24 0 24 0 28 0v26H0z"/>';
      return `<g transform="translate(${animal.x - animal.w / 2} ${animal.y - animal.h / 2}) scale(${animal.w / 100} ${animal.h / 100})">${shape}</g>`;
    }).join('');
    return `<svg class="ze-foreground" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="ze-foreground-${roomId}">${masks}</clipPath></defs><image href="${sources[roomId]}" width="1200" height="800" clip-path="url(#ze-foreground-${roomId})"/></svg>`;
  }
  window.ZooArt = { sources, icon, animal, image, cover, portrait, foreground };
})();
