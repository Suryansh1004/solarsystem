import { useState, useEffect, useRef, useCallback } from 'react';
import { planets, PlanetData } from './data/planets';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [angles, setAngles] = useState<number[]>(() =>
    planets.map(() => Math.random() * Math.PI * 2)
  );
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 700 });

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        setAngles((prev) =>
          prev.map((angle, i) => angle + planets[i].orbitalSpeed * speed * delta * 0.5)
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speed]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 950;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw stars with subtle twinkle
    const time = Date.now() / 1000;
    drawStars(ctx, width, height, time);

    // Draw orbit paths
    planets.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, planet.orbitRadius * scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35 * scale);
    sunGradient.addColorStop(0, '#fff7a0');
    sunGradient.addColorStop(0.3, '#ffdd00');
    sunGradient.addColorStop(0.7, '#ff8c00');
    sunGradient.addColorStop(1, '#ff4500');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30 * scale, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 25 * scale, centerX, centerY, 60 * scale);
    glowGradient.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60 * scale, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Draw planets
    planets.forEach((planet, i) => {
      const x = centerX + Math.cos(angles[i]) * planet.orbitRadius * scale;
      const y = centerY + Math.sin(angles[i]) * planet.orbitRadius * scale;
      const radius = (planet.size / 2) * scale;

      // Planet shadow/glow
      if (selectedPlanet?.id === planet.id) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }

      if (hoveredPlanet === planet.id) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      }

      // Planet body
      const planetGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      planetGradient.addColorStop(0, lightenColor(planet.color, 30));
      planetGradient.addColorStop(1, planet.color);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();

      // Saturn rings
      if (planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, radius * 1.8, radius * 0.5, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(232, 213, 163, 0.6)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      }

      // Planet label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = `${Math.max(10, 11 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, x, y + radius + 14 * scale);
    });
  }, [angles, canvasSize, selectedPlanet, hoveredPlanet]);

  // Handle click on canvas
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const scale = Math.min(canvasSize.width, canvasSize.height) / 950;

      let clicked: PlanetData | null = null;
      let minDist = Infinity;

      planets.forEach((planet, i) => {
        const x = centerX + Math.cos(angles[i]) * planet.orbitRadius * scale;
        const y = centerY + Math.sin(angles[i]) * planet.orbitRadius * scale;
        const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
        const hitRadius = Math.max(planet.size / 2 * scale + 10, 20);

        if (dist < hitRadius && dist < minDist) {
          minDist = dist;
          clicked = planet;
        }
      });

      if (clicked) {
        setSelectedPlanet(clicked);
      } else {
        setSelectedPlanet(null);
      }
    },
    [angles, canvasSize]
  );

  // Handle mouse move for hover
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const scale = Math.min(canvasSize.width, canvasSize.height) / 950;

      let hovered: string | null = null;

      planets.forEach((planet, i) => {
        const x = centerX + Math.cos(angles[i]) * planet.orbitRadius * scale;
        const y = centerY + Math.sin(angles[i]) * planet.orbitRadius * scale;
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        const hitRadius = Math.max(planet.size / 2 * scale + 10, 20);

        if (dist < hitRadius) {
          hovered = planet.id;
        }
      });

      setHoveredPlanet(hovered);
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    },
    [angles, canvasSize]
  );

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl">🌌</span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-200 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
              Solar System Explorer
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">Click on any planet to learn more</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 hidden md:block">
          Interactive Learning Demo
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Solar System Canvas */}
        <div className="flex-1 relative" ref={containerRef}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ width: canvasSize.width, height: canvasSize.height }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="absolute inset-0"
          />

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <polygon points="3,1 14,8 3,15" />
                </svg>
              )}
            </button>

            {/* Speed Controls */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Speed:</span>
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    speed === s
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40 backdrop-blur-sm overflow-y-auto">
          {selectedPlanet ? (
            <PlanetInfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🪐</div>
              <h2 className="text-lg font-semibold text-gray-200 mb-2">Select a Planet</h2>
              <p className="text-sm text-gray-400 mb-6">
                Click on any planet in the solar system view to see detailed information about it.
              </p>
              <div className="space-y-2 w-full">
                {planets.map((planet) => (
                  <button
                    key={planet.id}
                    onClick={() => setSelectedPlanet(planet)}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span className="text-sm text-gray-300">{planet.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanetInfoPanel({ planet, onClose }: { planet: PlanetData; onClose: () => void }) {
  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: planet.color }}>
          {planet.name}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Planet visual */}
      <div className="flex justify-center mb-6">
        <div
          className="rounded-full shadow-lg"
          style={{
            width: Math.max(60, planet.size * 3),
            height: Math.max(60, planet.size * 3),
            background: `radial-gradient(circle at 35% 35%, ${lightenColorCSS(planet.color, 40)}, ${planet.color})`,
            boxShadow: `0 0 30px ${planet.color}40, inset -5px -5px 15px rgba(0,0,0,0.3)`,
          }}
        />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-6 leading-relaxed">{planet.description}</p>

      {/* Stats */}
      <div className="space-y-3">
        <InfoRow label="Diameter" value={planet.realDiameter} icon="📏" />
        <InfoRow label="Distance from Sun" value={planet.distanceFromSun} icon="☀️" />
        <InfoRow label="Orbital Period" value={planet.orbitalPeriod} icon="🔄" />
      </div>

      {/* Fun fact section */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Did you know?</p>
        <p className="text-sm text-gray-300">{getFunFact(planet.id)}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-200">{value}</p>
      </div>
    </div>
  );
}

function getFunFact(id: string): string {
  const facts: Record<string, string> = {
    mercury: 'A year on Mercury is just 88 Earth days, but a single day (sunrise to sunrise) lasts 176 Earth days!',
    venus: 'Venus rotates so slowly that its day is longer than its year. It also spins backwards compared to most planets.',
    earth: 'Earth is the only planet not named after a Greek or Roman god. Its name comes from Germanic/Old English words meaning "ground".',
    mars: 'Mars has seasons like Earth because its axis is tilted at a similar angle. It also has polar ice caps!',
    jupiter: 'Jupiter\'s Great Red Spot is a storm that has been raging for at least 350 years and is larger than Earth.',
    saturn: 'Saturn\'s density is so low that it would float in water if you could find a bathtub big enough!',
    uranus: 'Uranus was the first planet discovered with a telescope, by William Herschel in 1781.',
    neptune: 'Neptune was the first planet found through mathematical prediction rather than observation, in 1846.',
  };
  return facts[id] || '';
}

// Star field cache
let starCache: { x: number; y: number; r: number; b: number; twinkleOffset: number }[] = [];
let lastStarWidth = 0;
let lastStarHeight = 0;

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  if (starCache.length === 0 || lastStarWidth !== width || lastStarHeight !== height) {
    starCache = [];
    lastStarWidth = width;
    lastStarHeight = height;
    for (let i = 0; i < 200; i++) {
      starCache.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.3,
        b: Math.random() * 0.5 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  starCache.forEach((star) => {
    const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 1.5 + star.twinkleOffset));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.b * twinkle})`;
    ctx.fill();
  });
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenColorCSS(hex: string, percent: number): string {
  return lightenColor(hex, percent);
}

export default App;
