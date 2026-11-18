(function () {
  'use strict';

  // The mesh warps a single painted texture. Each influence fades near its joint
  // so the lacquer and floral detail stay continuous through the movement.
  const VERTEX = `
    attribute vec2 texCoord;
    uniform vec4 rect;  // texture rectangle in the source portrait
    uniform vec2 joint; // rigid attachment point, or (-1, -1) for the horse
    uniform bool hanging;
    uniform vec4 frame;
    uniform vec4 body;  // tilt, lift, squash, chest
    uniform vec4 parts; // head, front hoof, tail, ears
    uniform vec3 face;  // blink, muzzle, far hoof
    varying vec2 paint;

    vec2 turn(vec2 point, vec2 pivot, float angle) {
      vec2 delta = point - pivot;
      float s = sin(angle);
      float c = cos(angle);
      return pivot + vec2(c * delta.x - s * delta.y, s * delta.x + c * delta.y);
    }

    vec2 posed(vec2 point, vec2 uv) {
      float sourceY = point.y;
      float head = (1.0 - smoothstep(.35, .62, uv.x)) * (1.0 - smoothstep(.32, .58, uv.y));
      point = mix(point, turn(point, vec2(.36, .40), parts.x), head);
      float ears = (1.0 - smoothstep(.08, .18, uv.y)) * (1.0 - smoothstep(.31, .46, uv.x));
      point.x += ears * parts.w * (1.0 - uv.y);

      float tail = smoothstep(.77, .92, uv.x) * smoothstep(.25, .49, uv.y);
      point = mix(point, turn(point, vec2(.80, .42), parts.z), tail);
      float foot = smoothstep(.55, .89, uv.y);
      float nearHoof = smoothstep(.26, .31, uv.x) * (1.0 - smoothstep(.43, .53, uv.x));
      float farHoof = 1.0 - smoothstep(.22, .29, uv.x);
      point = mix(point, turn(point, vec2(.34, .60), parts.y), foot * nearHoof);
      point = mix(point, turn(point, vec2(.22, .60), face.z), foot * farHoof);
      point.y += foot * (nearHoof * parts.y * .18 + farHoof * face.z * .16);

      vec2 eye = (uv - vec2(.246, .233)) / vec2(.040, .033);
      float blink = 1.0 - smoothstep(.28, 1.2, length(eye));
      point.y -= (uv.y - .233) * face.x * blink;
      float mouth = (1.0 - smoothstep(.02, .10, distance(uv, vec2(.126, .358)))) * smoothstep(.326, .372, uv.y);
      point.y += face.y * mouth;
      point.x += body.w * (1.0 - smoothstep(.53, .98, uv.y)) * (1.0 - uv.x);
      point.y += body.z * (.94 - sourceY);
      point = turn(point, vec2(.78, .90), body.x);
      point.y -= body.y;
      return point;
    }

    void main() {
      paint = texCoord;
      vec2 point = rect.xy + texCoord * rect.zw;
      if (hanging) {
        vec2 aspect = vec2(760.0 / 695.0, 1.0);
        vec2 offset = turn((point - joint) * aspect, vec2(0.), .12 * (body.x + parts.x));
        point = posed(joint, joint) + offset / aspect;
      } else {
        point = posed(point, joint.x < 0.0 ? point : joint);
      }
      point = frame.xy + point * frame.zw;
      gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
    }
  `;

  const FRAGMENT = `
    precision mediump float;
    uniform sampler2D artwork;
    varying vec2 paint;
    void main() {
      gl_FragColor = texture2D(artwork, paint);
    }
  `;

  const moves = {
    idle: 6400, wave: 1420, rear: 1710, jump: 1200, bow: 1350,
    speaking: 980, listening: 1850
  };
  const repeating = new Set(['idle', 'speaking', 'listening']);
  const smooth = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const lift = (time, start, peak, end) => (
    time < peak ? smooth((time - start) / (peak - start)) : smooth((end - time) / (end - peak))
  );

  function pose(move, t) {
    const beat = Math.sin(t * Math.PI * 2);
    switch (move) {
      case 'wave': {
        const paw = lift(t, .04, .42, .95);
        return [0, 0, .04 * paw, 0, .12 * paw, (-.65 + .30 * Math.sin(t * 22)) * paw, -.1 * paw, .05 * paw, 0, 0, 0];
      }
      case 'rear': {
        const rise = lift(t, .12, .50, .93);
        const settle = lift(t, .81, .91, 1);
        return [.36 * rise, .028 * rise, .09 * (lift(t, 0, .13, .28) + settle), 0,
          -.21 * rise, -.57 * rise, .16 * rise, -.055 * rise, 0, 0, -.37 * rise];
      }
      case 'jump': {
        const jump = lift(t, .15, .42, .69) + .37 * lift(t, .71, .82, .95);
        const push = lift(t, 0, .13, .27) + .8 * lift(t, .59, .71, .84);
        return [.12 * jump, .14 * jump, .12 * push - .07 * jump, 0, -.15 * jump,
          -.43 * jump, .19 * jump, -.07 * jump, 0, 0, -.32 * jump];
      }
      case 'bow': {
        const bow = lift(t, .02, .44, .96);
        return [-.045 * bow, 0, .02 * bow, -.03 * bow, -.39 * bow, -.13 * bow,
          .08 * bow, -.02 * bow, .58 * bow, 0, 0];
      }
      case 'speaking':
        return [0, 0, .011 * beat, .016, .082 * beat, 0, .045 * beat, .035 * beat,
          0, .017 * (1 + Math.sin(t * 12.566)), 0];
      case 'listening':
        return [.034, 0, 0, .025, .13 + .025 * beat, 0, .045 * beat,
          .11 + .055 * beat, 0, 0, 0];
      default:
        return [0, 0, .016 * beat, .018 * beat, .022 * beat, 0, .07 * Math.sin(t * 12.566),
          .035 * lift(t, .6, .64, .71), .98 * lift(t, .76, .775, .802), 0, 0];
    }
  }

  function makeMesh() {
    const cells = 52;
    const coords = [];
    const triangles = [];
    for (let y = 0; y <= cells; y++) {
      for (let x = 0; x <= cells; x++) {
        coords.push(x / cells, y / cells);
        if (x === cells || y === cells) continue;
        const top = y * (cells + 1) + x;
        const bottom = top + cells + 1;
        triangles.push(top, top + 1, bottom, top + 1, bottom + 1, bottom);
      }
    }
    return { coords: new Float32Array(coords), triangles: new Uint16Array(triangles) };
  }

  let mesh;

  function buildRenderer(canvas, image, garment, accessory) {
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, powerPreference: 'low-power' });
    if (!gl) return null;
    const program = gl.createProgram();
    for (const [kind, code] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]]) {
      const shader = gl.createShader(kind);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    gl.useProgram(program);
    mesh ||= makeMesh();
    const vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.coords, gl.STATIC_DRAW);
    const uv = gl.getAttribLocation(program, 'texCoord');
    gl.enableVertexAttribArray(uv);
    gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
    const indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.triangles, gl.STATIC_DRAW);
    function textureFor(artwork) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, artwork);
      return texture;
    }
    const layers = [{ texture: textureFor(image), rect: [0, 0, 1, 1], joint: [-1, -1] }];
    if (garment && accessory) {
      const [x, y, width, height] = accessory.rect;
      const [jx, jy] = accessory.joint;
      const layer = {
        texture: textureFor(garment),
        rect: [x / image.naturalWidth, y / image.naturalHeight, width / image.naturalWidth, height / image.naturalHeight],
        joint: [jx / image.naturalWidth, jy / image.naturalHeight],
        hanging: accessory.hanging
      };
      if (accessory.behind) layers.unshift(layer);
      else layers.push(layer);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    const frame = gl.getUniformLocation(program, 'frame');
    const rect = gl.getUniformLocation(program, 'rect');
    const joint = gl.getUniformLocation(program, 'joint');
    const hanging = gl.getUniformLocation(program, 'hanging');
    const body = gl.getUniformLocation(program, 'body');
    const parts = gl.getUniformLocation(program, 'parts');
    const face = gl.getUniformLocation(program, 'face');
    function draw(poseValues) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
      const w = Math.round(canvas.clientWidth * ratio);
      const h = Math.round(canvas.clientHeight * ratio);
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const [tilt, rise, squash, chest, head, hoof, tail, ears, blink, muzzle, farHoof] = poseValues;
      // Keep the ears in frame while the body rises, without moving the grounded hoof.
      const headroom = .12 * Math.max(0, tilt) + .30 * rise;
      const scale = Math.min(.94 * w / image.naturalWidth, (.86 - headroom) * h / image.naturalHeight);
      const width = image.naturalWidth * scale / w;
      const height = image.naturalHeight * scale / h;
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform4f(frame, (1 - width) / 2, .96 - height, width, height);
      gl.uniform4f(body, tilt, rise, squash, chest);
      gl.uniform4f(parts, head, hoof, tail, ears);
      gl.uniform3f(face, blink, muzzle, farHoof);
      for (const layer of layers) {
        gl.bindTexture(gl.TEXTURE_2D, layer.texture);
        gl.uniform4fv(rect, layer.rect);
        gl.uniform2fv(joint, layer.joint);
        gl.uniform1i(hanging, layer.hanging ? 1 : 0);
        gl.drawElements(gl.TRIANGLES, mesh.triangles.length, gl.UNSIGNED_SHORT, 0);
      }
    }
    function dispose() {
      for (const layer of layers) gl.deleteTexture(layer.texture);
      gl.deleteBuffer(vertices);
      gl.deleteBuffer(indices);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    return { draw, dispose };
  }

  const neutral = pose('idle', 0);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mounted = new WeakMap();

  function mount(wrapper, initial = 'idle') {
    const image = wrapper.querySelector('.dala-horse-image');
    const canvas = wrapper.querySelector('.dala-horse-canvas');
    const still = wrapper.querySelector('.dala-still');
    const garment = wrapper.querySelector('.dala-wardrobe');
    const accessory = garment && window.VisualEngine.Mascot.getStageAccessory();
    let renderer = null;
    let move = 'idle';
    let visible = true;
    let disposed = false;
    let request = 0;
    let started = 0;
    let previous = 0;
    let currentPose = neutral;
    let fallback;
    let basketSwing;

    function applyPose(values) {
      currentPose = values;
      renderer?.draw(values);
    }

    function tick(time) {
      request = 0;
      if (disposed || !visible || reduced.matches || !wrapper.isConnected) return;
      if (time - previous < 31) {
        request = requestAnimationFrame(tick);
        return;
      }
      previous = time;
      const fraction = (time - started) / moves[move];
      if (fraction >= 1 && !repeating.has(move)) {
        play('idle');
        return;
      }
      applyPose(pose(move, Math.max(0, fraction % 1)));
      request = requestAnimationFrame(tick);
    }

    function play(next) {
      // Ambient breathing and speech run during lessons. Tricks require the same
      // purchase here as on the big stage, including when feedback mounts a new horse.
      const available = repeating.has(next) || window.WilawanMoves?.owns(next);
      move = available && Object.hasOwn(moves, next) ? next : 'idle';
      wrapper.dataset.motion = move;
      started = performance.now();
      fallback?.cancel();
      basketSwing?.cancel();
      if (request) cancelAnimationFrame(request);
      request = 0;
      if (reduced.matches || !visible) {
        applyPose(neutral);
        return;
      }
      if (renderer) {
        request = requestAnimationFrame(tick);
      } else if (move !== 'idle' && still?.animate) {
        // Keep the painted mascot usable anywhere hardware rendering is unavailable.
        const basketFrames = [];
        const frames = Array.from({ length: 11 }, (_, index) => {
          const [rotation, rise, squash, , head] = pose(move, index / 10);
          const angle = (rotation + head * .30) * 180 / Math.PI;
          if (accessory?.hanging) basketFrames.push({ transform: `rotate(${-.88 * angle}deg)` });
          return { transform: `translateY(${-rise * 88}%) rotate(${angle}deg) scaleY(${1 - squash})` };
        });
        const timing = { duration: moves[move], iterations: repeating.has(move) ? Infinity : 1 };
        const animation = still.animate(frames, timing);
        if (accessory?.hanging) {
          const [x, y, w, h] = accessory.rect;
          const [jx, jy] = accessory.joint;
          garment.style.transformOrigin = `${100 * (jx - x) / w}% ${100 * (jy - y) / h}%`;
          basketSwing = garment.animate(basketFrames, timing);
        }
        fallback = animation;
        animation.onfinish = () => {
          if (fallback === animation) play('idle');
        };
      }
    }

    function contextLost(event) {
      if (disposed) return;
      event.preventDefault();
      renderer = null;
      wrapper.dataset.renderer = 'image';
      play(move);
    }

    function ready() {
      if (disposed || !wrapper.isConnected || !image.naturalWidth) return;
      wrapper.closest('.home-hero-art')?.classList.add('has-animated-mascot');
      if (garment && !garment.naturalWidth) return;
      if (!reduced.matches && canvas && !renderer) {
        try {
          renderer = buildRenderer(canvas, image, garment, accessory);
        } catch {
          // The still artwork is already in place if texture upload fails.
        }
      }
      wrapper.dataset.renderer = renderer ? 'mesh' : 'image';
      applyPose(neutral);
      play(move);
    }

    function motionPreferenceChanged() {
      if (reduced.matches) {
        wrapper.dataset.renderer = 'image';
        play(move);
      } else {
        ready();
      }
    }

    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      play(move);
    });
    intersection.observe(wrapper);
    const resize = new ResizeObserver(() => renderer?.draw(currentPose));
    resize.observe(wrapper);
    canvas?.addEventListener('webglcontextlost', contextLost);
    canvas?.addEventListener('webglcontextrestored', ready);
    reduced.addEventListener('change', motionPreferenceChanged);
    image.addEventListener('load', ready, { once: true });
    garment?.addEventListener('load', ready, { once: true });
    play(initial);
    if (image.complete) ready();

    mounted.set(wrapper, {
      play,
      destroy() {
        disposed = true;
        intersection.disconnect();
        resize.disconnect();
        reduced.removeEventListener('change', motionPreferenceChanged);
        image.removeEventListener('load', ready);
        garment?.removeEventListener('load', ready);
        canvas?.removeEventListener('webglcontextlost', contextLost);
        canvas?.removeEventListener('webglcontextrestored', ready);
        cancelAnimationFrame(request);
        fallback?.cancel();
        basketSwing?.cancel();
        renderer?.dispose();
        mounted.delete(wrapper);
      }
    });
  }

  window.DalaMotion = {
    mount,
    play(wrapper, move) { mounted.get(wrapper)?.play(move); },
    unmount(wrapper) { mounted.get(wrapper)?.destroy(); }
  };
})();
