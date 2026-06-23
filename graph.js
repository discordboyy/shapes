// ============================================================
// ГРАФ: физика + рендеринг на canvas + интерактивность
// ============================================================

(function () {
  const canvas = document.getElementById('graph');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('canvas-wrap');

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- Build node/link objects with physics state ----------
  const GROUP_RADIUS = { root: 14, category: 9, shape: 6 };
  const GROUP_COLOR = { root: '#7b7fff', category: '#c9cad1', shape: '#8d8f99' };

  const nodes = GRAPH_DATA.nodes.map((n, i) => ({
    ...n,
    x: W / 2 + (Math.random() - 0.5) * 400,
    y: H / 2 + (Math.random() - 0.5) * 400,
    vx: 0, vy: 0,
    r: GROUP_RADIUS[n.group] || 6,
    fixed: false
  }));

  const nodeById = {};
  nodes.forEach(n => nodeById[n.id] = n);

  const links = GRAPH_DATA.links.map(l => ({
    source: nodeById[l.source],
    target: nodeById[l.target]
  })).filter(l => l.source && l.target);

  // Pin root roughly center to start
  nodeById['root'].x = W / 2;
  nodeById['root'].y = H / 2;

  document.getElementById('node-count').textContent =
    `${nodes.length} узлов · ${links.length} связей`;

  // ---------- Camera (pan & zoom) ----------
  const camera = { x: 0, y: 0, scale: 1 };

  function screenToWorld(sx, sy) {
    return {
      x: (sx - W / 2) / camera.scale + W / 2 - camera.x,
      y: (sy - H / 2) / camera.scale + H / 2 - camera.y
    };
  }

  // ---------- Force simulation (simple custom force-directed layout) ----------
  const REPULSION = 2600;
  const LINK_DIST = 90;
  const LINK_STRENGTH = 0.02;
  const CENTER_STRENGTH = 0.0006;
  const DAMPING = 0.86;

  function step() {
    // Repulsion between all pairs (n is small enough, ~25 nodes, O(n^2) is fine)
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 0.01) { dx = (Math.random() - 0.5); dy = (Math.random() - 0.5); distSq = 1; }
        const dist = Math.sqrt(distSq);
        const force = REPULSION / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!a.dragging) { a.vx += fx; a.vy += fy; }
        if (!b.dragging) { b.vx -= fx; b.vy -= fy; }
      }
    }

    // Link spring force
    links.forEach(l => {
      const a = l.source, b = l.target;
      let dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const diff = (dist - LINK_DIST) * LINK_STRENGTH;
      const fx = (dx / dist) * diff;
      const fy = (dy / dist) * diff;
      if (!a.dragging) { a.vx += fx; a.vy += fy; }
      if (!b.dragging) { b.vx -= fx; b.vy -= fy; }
    });

    // Weak centering force so the graph doesn't drift away
    nodes.forEach(n => {
      if (n.dragging) return;
      const dx = (W / 2) - n.x;
      const dy = (H / 2) - n.y;
      n.vx += dx * CENTER_STRENGTH;
      n.vy += dy * CENTER_STRENGTH;
    });

    // Integrate
    nodes.forEach(n => {
      if (n.dragging) return;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
    });
  }

  // ---------- Rendering ----------
  let hoveredNode = null;
  let selectedNode = null;

  function worldToScreen(x, y) {
    return {
      x: (x - W / 2 + camera.x) * camera.scale + W / 2,
      y: (y - H / 2 + camera.y) * camera.scale + H / 2
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // links
    links.forEach(l => {
      const p1 = worldToScreen(l.source.x, l.source.y);
      const p2 = worldToScreen(l.target.x, l.target.y);
      const isHighlighted = selectedNode && (l.source === selectedNode || l.target === selectedNode);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = isHighlighted ? 'rgba(123,127,255,0.55)' : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = isHighlighted ? 1.6 : 1;
      ctx.stroke();
    });

    // nodes
    nodes.forEach(n => {
      const p = worldToScreen(n.x, n.y);
      const r = n.r * camera.scale;
      const isSel = n === selectedNode;
      const isHover = n === hoveredNode;
      const isNeighbor = selectedNode && links.some(l =>
        (l.source === selectedNode && l.target === n) ||
        (l.target === selectedNode && l.source === n)
      );

      // glow for selected
      if (isSel) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(123,127,255,0.18)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      let color = GROUP_COLOR[n.group] || '#8d8f99';
      if (isSel) color = '#7b7fff';
      else if (selectedNode && !isNeighbor && n !== selectedNode) color = 'rgba(140,142,152,0.35)';
      ctx.fillStyle = color;
      ctx.fill();

      if (isHover || isSel) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }

      // label
      const dim = selectedNode && !isNeighbor && n !== selectedNode;
      ctx.font = `${n.group === 'root' ? 600 : 500} ${Math.max(10, 12 * Math.min(camera.scale, 1.4))}px Inter, sans-serif`;
      ctx.fillStyle = dim ? 'rgba(231,231,236,0.25)' : (n.group === 'root' ? '#fff' : '#d7d8de');
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const lines = n.label.split('\n');
      const lh = 14 * Math.min(camera.scale, 1.3);
      const totalH = lh * (lines.length - 1);
      lines.forEach((line, i) => {
        ctx.fillText(line, p.x + r + 8, p.y - totalH / 2 + i * lh);
      });
    });
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- Hit testing ----------
  function nodeAtScreen(sx, sy) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const p = worldToScreen(n.x, n.y);
      const r = Math.max(n.r * camera.scale, 10);
      const dx = sx - p.x, dy = sy - p.y;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  }

  // ---------- Mouse / touch interaction ----------
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let cameraStart = { x: 0, y: 0 };
  let draggedNode = null;
  let dragOffset = { x: 0, y: 0 };
  let mouseDownPos = null;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    mouseDownPos = { x: sx, y: sy };
    const n = nodeAtScreen(sx, sy);
    if (n) {
      draggedNode = n;
      n.dragging = true;
      const w = screenToWorld(sx, sy);
      dragOffset.x = n.x - w.x;
      dragOffset.y = n.y - w.y;
    } else {
      isPanning = true;
      panStart = { x: e.clientX, y: e.clientY };
      cameraStart = { x: camera.x, y: camera.y };
    }
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;

    if (draggedNode) {
      const w = screenToWorld(sx, sy);
      draggedNode.x = w.x + dragOffset.x;
      draggedNode.y = w.y + dragOffset.y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else if (isPanning) {
      const dx = (e.clientX - panStart.x) / camera.scale;
      const dy = (e.clientY - panStart.y) / camera.scale;
      camera.x = cameraStart.x + dx;
      camera.y = cameraStart.y + dy;
    } else {
      const n = nodeAtScreen(sx, sy);
      hoveredNode = n;
      canvas.style.cursor = n ? 'pointer' : 'grab';
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (draggedNode) {
      // Was it a click (not a drag)?
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      const moved = mouseDownPos && (Math.abs(sx - mouseDownPos.x) > 4 || Math.abs(sy - mouseDownPos.y) > 4);
      if (!moved) {
        selectNode(draggedNode);
      }
      draggedNode.dragging = false;
      draggedNode = null;
    }
    isPanning = false;
  });

  // Zoom with wheel
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const worldBefore = screenToWorld(sx, sy);

    const zoomFactor = Math.exp(-e.deltaY * 0.001);
    camera.scale = Math.min(Math.max(camera.scale * zoomFactor, 0.3), 3.5);

    const worldAfter = screenToWorld(sx, sy);
    camera.x += (worldAfter.x - worldBefore.x);
    camera.y += (worldAfter.y - worldBefore.y);
  }, { passive: false });

  // Touch support (basic single-touch pan/drag, pinch zoom)
  let touchMode = null;
  let lastTouchDist = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const rect = canvas.getBoundingClientRect();
      const sx = e.touches[0].clientX - rect.left, sy = e.touches[0].clientY - rect.top;
      mouseDownPos = { x: sx, y: sy };
      const n = nodeAtScreen(sx, sy);
      if (n) {
        draggedNode = n;
        n.dragging = true;
        const w = screenToWorld(sx, sy);
        dragOffset.x = n.x - w.x;
        dragOffset.y = n.y - w.y;
        touchMode = 'drag-node';
      } else {
        touchMode = 'pan';
        panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        cameraStart = { x: camera.x, y: camera.y };
      }
    } else if (e.touches.length === 2) {
      touchMode = 'pinch';
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (touchMode === 'drag-node' && draggedNode && e.touches.length === 1) {
      const rect = canvas.getBoundingClientRect();
      const sx = e.touches[0].clientX - rect.left, sy = e.touches[0].clientY - rect.top;
      const w = screenToWorld(sx, sy);
      draggedNode.x = w.x + dragOffset.x;
      draggedNode.y = w.y + dragOffset.y;
      draggedNode.vx = 0; draggedNode.vy = 0;
    } else if (touchMode === 'pan' && e.touches.length === 1) {
      const dx = (e.touches[0].clientX - panStart.x) / camera.scale;
      const dy = (e.touches[0].clientY - panStart.y) / camera.scale;
      camera.x = cameraStart.x + dx;
      camera.y = cameraStart.y + dy;
    } else if (touchMode === 'pinch' && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / (lastTouchDist || dist);
      camera.scale = Math.min(Math.max(camera.scale * factor, 0.3), 3.5);
      lastTouchDist = dist;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (touchMode === 'drag-node' && draggedNode) {
      const rect = canvas.getBoundingClientRect();
      const t = e.changedTouches[0];
      const sx = t.clientX - rect.left, sy = t.clientY - rect.top;
      const moved = mouseDownPos && (Math.abs(sx - mouseDownPos.x) > 6 || Math.abs(sy - mouseDownPos.y) > 6);
      if (!moved) selectNode(draggedNode);
      draggedNode.dragging = false;
      draggedNode = null;
    }
    touchMode = null;
  });

  // ---------- SVG shape renderers for the side panel ----------
  const SVG_STROKE = '#c9cad1';
  const SVG_FILL = 'rgba(123,127,255,0.12)';

  function svgWrap(inner) {
    return `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <g fill="${SVG_FILL}" stroke="${SVG_STROKE}" stroke-width="2.5" stroke-linejoin="round">
        ${inner}
      </g>
    </svg>`;
  }

  function regularPolygonPoints(cx, cy, r, sides, rotationDeg = -90) {
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const angle = (rotationDeg + (360 / sides) * i) * Math.PI / 180;
      pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
    }
    return pts.join(' ');
  }

  const SHAPE_RENDERERS = {
    triangle_equilateral: () => svgWrap(`<polygon points="${regularPolygonPoints(70, 75, 55, 3)}"/>`),
    triangle_isosceles: () => svgWrap(`<polygon points="70,20 20,120 120,120"/>`),
    triangle_right: () => svgWrap(`<polygon points="25,20 25,120 120,120"/>`),
    triangle_scalene: () => svgWrap(`<polygon points="30,25 125,70 55,120"/>`),

    square: () => svgWrap(`<rect x="25" y="25" width="90" height="90"/>`),
    rectangle: () => svgWrap(`<rect x="15" y="40" width="110" height="60"/>`),
    rhombus: () => svgWrap(`<polygon points="70,15 120,70 70,125 20,70"/>`),
    parallelogram: () => svgWrap(`<polygon points="40,30 130,30 100,110 10,110"/>`),
    trapezoid: () => svgWrap(`<polygon points="45,25 95,25 125,110 15,110"/>`),

    circle: () => svgWrap(`<circle cx="70" cy="70" r="55"/>`),
    semicircle: () => svgWrap(`<path d="M 15 75 A 55 55 0 0 1 125 75 Z"/>`),
    ellipse: () => svgWrap(`<ellipse cx="70" cy="70" rx="58" ry="36"/>`),

    pentagon: () => svgWrap(`<polygon points="${regularPolygonPoints(70, 72, 55, 5)}"/>`),
    hexagon: () => svgWrap(`<polygon points="${regularPolygonPoints(70, 70, 55, 6, -30)}"/>`),
    octagon: () => svgWrap(`<polygon points="${regularPolygonPoints(70, 70, 55, 8, -90+22.5)}"/>`)
  };

  // ---------- Panel ----------
  const panel = document.getElementById('panel');
  const closeBtn = document.getElementById('close-panel');

  function selectNode(n) {
    selectedNode = n;
    openPanel(n);
  }

  function openPanel(n) {
    document.getElementById('panel-eyebrow').textContent = n.eyebrow || '';
    document.getElementById('panel-title').textContent = n.label.replace('\n', ' ');
    document.getElementById('panel-desc').textContent = n.desc || '';

    const renderHost = document.getElementById('shape-render');
    if (n.svg && SHAPE_RENDERERS[n.svg]) {
      renderHost.innerHTML = SHAPE_RENDERERS[n.svg]();
      renderHost.style.display = 'flex';
    } else {
      renderHost.innerHTML = '';
      renderHost.style.display = 'none';
    }

    const areaBlock = document.getElementById('area-block');
    const perimBlock = document.getElementById('perimeter-block');
    if (n.area) {
      areaBlock.style.display = 'block';
      document.getElementById('area-formula').textContent = n.area;
    } else {
      areaBlock.style.display = 'none';
    }
    if (n.perimeter) {
      perimBlock.style.display = 'block';
      document.getElementById('perimeter-formula').textContent = n.perimeter;
    } else {
      perimBlock.style.display = 'none';
    }

    const propsList = document.getElementById('props-list');
    propsList.innerHTML = '';
    (n.props || []).forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      propsList.appendChild(li);
    });

    const relatedWrap = document.getElementById('related-wrap');
    const relatedTags = document.getElementById('related-tags');
    relatedTags.innerHTML = '';
    const related = getRelated(n.id).filter(id => id !== n.id);
    if (related.length > 0) {
      relatedWrap.style.display = 'block';
      related.forEach(id => {
        const target = nodeById[id];
        if (!target) return;
        const tag = document.createElement('span');
        tag.className = 'related-tag';
        tag.textContent = target.label.replace('\n', ' ');
        tag.addEventListener('click', () => selectNode(target));
        relatedTags.appendChild(tag);
      });
    } else {
      relatedWrap.style.display = 'none';
    }

    panel.classList.add('open');
  }

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    selectedNode = null;
  });

  // Escape key closes panel
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      panel.classList.remove('open');
      selectedNode = null;
    }
  });

})();