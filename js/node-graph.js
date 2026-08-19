/* ============================================
   AUTOSCALE HQ — Node-Graph Animation Engine
   Canvas-based particle system with data-flow
   ============================================ */

class NodeGraph {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;
    this.mouse = { x: -9999, y: -9999, radius: 200 };
    this.isVisible = true;
    this.lastTime = 0;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Graph nodes representing automation pipeline
    this.nodes = [];
    this.connections = [];
    this.particles = [];
    this.dataPackets = [];
    this.ambientParticles = [];

    this.init();
  }

  init() {
    this.handleResize();
    this.createPipelineNodes();
    this.createAmbientParticles();

    // Events
    window.addEventListener('resize', () => this.handleResize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left);
      this.mouse.y = (e.clientY - rect.top);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Visibility observer — pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { this.isVisible = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(this.canvas);

    // Start animation loop
    if (!this.prefersReducedMotion) {
      requestAnimationFrame((t) => this.animate(t));
    } else {
      // Draw one static frame
      this.drawStaticFrame();
    }
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Recalculate node positions
    this.createPipelineNodes();
    this.createAmbientParticles();
  }

  createPipelineNodes() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const spread = Math.min(this.width * 0.38, 420);
    const vSpread = Math.min(this.height * 0.25, 180);

    // Pipeline nodes with labels and positions
    this.nodes = [
      { id: 'leads',      label: 'LEADS',       x: cx - spread,          y: cy - vSpread * 0.3, radius: 8, color: '#1B4FBF', glowColor: 'rgba(27, 79, 191, 0.4)' },
      { id: 'crm',        label: 'CRM',          x: cx - spread * 0.45,  y: cy - vSpread * 0.8, radius: 10, color: '#1B4FBF', glowColor: 'rgba(27, 79, 191, 0.4)' },
      { id: 'automation', label: 'AUTOMATION',    x: cx,                   y: cy,                 radius: 14, color: '#143D94', glowColor: 'rgba(20, 61, 148, 0.5)' },
      { id: 'sms',        label: 'SMS',           x: cx + spread * 0.35,  y: cy - vSpread * 0.9, radius: 7,  color: '#2E6AD6', glowColor: 'rgba(46, 106, 214, 0.3)' },
      { id: 'email',      label: 'EMAIL',         x: cx + spread * 0.4,   y: cy + vSpread * 0.5, radius: 7,  color: '#2E6AD6', glowColor: 'rgba(46, 106, 214, 0.3)' },
      { id: 'calendar',   label: 'BOOKED',        x: cx + spread * 0.75,  y: cy - vSpread * 0.2, radius: 9,  color: '#1B4FBF', glowColor: 'rgba(27, 79, 191, 0.4)' },
      { id: 'scale',      label: 'SCALE',         x: cx + spread,          y: cy + vSpread * 0.1, radius: 12, color: '#143D94', glowColor: 'rgba(20, 61, 148, 0.5)' },
    ];

    // Original positions for parallax
    this.nodes.forEach(n => {
      n.baseX = n.x;
      n.baseY = n.y;
      n.pulsePhase = Math.random() * Math.PI * 2;
    });

    // Connection paths (which nodes connect)
    this.connections = [
      { from: 0, to: 1 },  // leads -> crm
      { from: 0, to: 2 },  // leads -> automation
      { from: 1, to: 2 },  // crm -> automation
      { from: 2, to: 3 },  // automation -> sms
      { from: 2, to: 4 },  // automation -> email
      { from: 3, to: 5 },  // sms -> calendar
      { from: 4, to: 5 },  // email -> calendar
      { from: 5, to: 6 },  // calendar -> scale
      { from: 2, to: 5 },  // automation -> calendar (direct)
    ];
  }

  createAmbientParticles() {
    this.ambientParticles = [];
    const count = Math.floor(this.width * this.height / 15000);

    for (let i = 0; i < Math.min(count, 60); i++) {
      this.ambientParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
  }

  spawnDataPacket() {
    if (this.dataPackets.length > 15) return;

    const conn = this.connections[Math.floor(Math.random() * this.connections.length)];
    this.dataPackets.push({
      from: conn.from,
      to: conn.to,
      progress: 0,
      speed: 0.004 + Math.random() * 0.008,
      size: 2 + Math.random() * 2,
    });
  }

  update(dt) {
    const time = performance.now() / 1000;

    // Mouse parallax on nodes
    for (const node of this.nodes) {
      const dx = this.mouse.x - node.baseX;
      const dy = this.mouse.y - node.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 400;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 15;
        node.x = node.baseX + (dx / dist) * force;
        node.y = node.baseY + (dy / dist) * force;
      } else {
        node.x += (node.baseX - node.x) * 0.05;
        node.y += (node.baseY - node.y) * 0.05;
      }

      // Gentle floating
      node.y += Math.sin(time * 0.8 + node.pulsePhase) * 0.3;
    }

    // Ambient particles
    for (const p of this.ambientParticles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const distSq = dx * dx + dy * dy;
      const mRadius = this.mouse.radius * this.mouse.radius;

      if (distSq < mRadius && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / this.mouse.radius) * 1.5;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }
    }

    // Data packets
    for (let i = this.dataPackets.length - 1; i >= 0; i--) {
      const pkt = this.dataPackets[i];
      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) {
        this.dataPackets.splice(i, 1);
      }
    }

    // Spawn new packets periodically
    if (Math.random() < 0.04) {
      this.spawnDataPacket();
    }
  }

  draw(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw ambient particles
    for (const p of this.ambientParticles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(27, 79, 191, ${p.opacity})`;
      this.ctx.fill();
    }

    // Draw ambient connections (nearby particles)
    const maxDist = 120;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < this.ambientParticles.length; i++) {
      for (let j = i + 1; j < this.ambientParticles.length; j++) {
        const a = this.ambientParticles[i];
        const b = this.ambientParticles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / maxDist) * 0.08;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(27, 79, 191, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    // Draw pipeline connections (curved lines)
    for (const conn of this.connections) {
      const from = this.nodes[conn.from];
      const to = this.nodes[conn.to];

      // Bezier curve
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const cpOffset = 30;

      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.quadraticCurveTo(midX, midY - cpOffset, to.x, to.y);
      this.ctx.strokeStyle = 'rgba(27, 79, 191, 0.15)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Dashed overlay
      this.ctx.setLineDash([4, 8]);
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.quadraticCurveTo(midX, midY - cpOffset, to.x, to.y);
      this.ctx.strokeStyle = 'rgba(27, 79, 191, 0.08)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Draw data packets flowing along connections
    for (const pkt of this.dataPackets) {
      const from = this.nodes[pkt.from];
      const to = this.nodes[pkt.to];
      const t = pkt.progress;

      // Quadratic bezier interpolation
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 30;

      const px = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
      const py = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;

      // Glow trail
      const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, pkt.size * 4);
      gradient.addColorStop(0, 'rgba(27, 79, 191, 0.6)');
      gradient.addColorStop(0.5, 'rgba(27, 79, 191, 0.15)');
      gradient.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.arc(px, py, pkt.size * 4, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Core dot
      this.ctx.beginPath();
      this.ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1B4FBF';
      this.ctx.fill();
    }

    // Draw pipeline nodes
    for (const node of this.nodes) {
      const pulse = Math.sin(time / 1000 * 1.5 + node.pulsePhase) * 0.3 + 0.7;

      // Outer glow
      const glow = this.ctx.createRadialGradient(
        node.x, node.y, node.radius * 0.5,
        node.x, node.y, node.radius * 4
      );
      glow.addColorStop(0, node.glowColor);
      glow.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
      this.ctx.fillStyle = glow;
      this.ctx.globalAlpha = pulse * 0.5;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;

      // Ring
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
      this.ctx.strokeStyle = node.color;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.2;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;

      // Core
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();

      // Inner highlight
      this.ctx.beginPath();
      this.ctx.arc(node.x - node.radius * 0.2, node.y - node.radius * 0.2, node.radius * 0.4, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fill();

      // Label
      this.ctx.font = `500 ${Math.max(9, 10)}px 'JetBrains Mono', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillStyle = `rgba(26, 43, 95, ${0.35 + pulse * 0.15})`;
      this.ctx.fillText(node.label, node.x, node.y + node.radius + 10);
    }
  }

  drawStaticFrame() {
    // For reduced motion: draw a single static frame
    this.nodes.forEach(n => { n.x = n.baseX; n.y = n.baseY; });

    // Pre-populate some data packets
    for (let i = 0; i < 5; i++) {
      const conn = this.connections[i % this.connections.length];
      this.dataPackets.push({
        from: conn.from,
        to: conn.to,
        progress: Math.random(),
        speed: 0,
        size: 3,
      });
    }

    this.draw(0);
  }

  animate(currentTime) {
    if (!this.isVisible) {
      requestAnimationFrame((t) => this.animate(t));
      return;
    }

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw(currentTime);

    requestAnimationFrame((t) => this.animate(t));
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    window.nodeGraph = new NodeGraph('hero-canvas');
  }
});
