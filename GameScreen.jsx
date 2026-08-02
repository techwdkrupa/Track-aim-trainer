import { useEffect, useRef, useState } from "react";
import "./GameScreen.css";

const LOGICAL = 560; // logical px, canvas is square LOGICAL x LOGICAL
const TRAIL_LENGTH = 42;
const SAMPLE_INTERVAL_MS = 250;

export default function GameScreen({ config, onFinish }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [phase, setPhase] = useState("ready"); // ready | running
  const [hud, setHud] = useState({ timeLeft: config.duration, score: 0, accuracy: 0 });

  // mutable game state kept in refs so the render loop never depends on React state
  const target = useRef({ x: LOGICAL / 2, y: LOGICAL / 2, angle: Math.random() * Math.PI * 2 });
  const reticle = useRef({ x: LOGICAL / 2, y: LOGICAL / 2 });
  const trail = useRef([]);
  const hitTime = useRef(0);
  const elapsed = useRef(0);
  const currentlyHit = useRef(false);
  const history = useRef([]);
  const rafId = useRef(null);
  const lastTs = useRef(null);
  const finishedRef = useRef(false);

  const speedPxPerSec = 46 + config.targetSpeed * 24;
  const radius = config.targetRadius;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (document.pointerLockElement) document.exitPointerLock();
    const total = elapsed.current || 1;
    onFinish({
      score: Math.round(hitTime.current * 118),
      accuracy: (hitTime.current / total) * 100,
      duration: total,
      history: history.current,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LOGICAL * dpr;
    canvas.height = LOGICAL * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    let sampleAcc = 0;

    const step = (ts) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = Math.min((ts - lastTs.current) / 1000, 0.05);
      lastTs.current = ts;

      if (phase === "running" && !finishedRef.current) {
        elapsed.current += dt;

        // steer target with a gentle random walk, bounce off scope walls
        target.current.angle += (Math.random() - 0.5) * 1.5 * dt;
        let nx = target.current.x + Math.cos(target.current.angle) * speedPxPerSec * dt;
        let ny = target.current.y + Math.sin(target.current.angle) * speedPxPerSec * dt;
        const margin = radius + 6;
        if (nx < margin || nx > LOGICAL - margin) {
          target.current.angle = Math.PI - target.current.angle;
          nx = Math.max(margin, Math.min(LOGICAL - margin, nx));
        }
        if (ny < margin || ny > LOGICAL - margin) {
          target.current.angle = -target.current.angle;
          ny = Math.max(margin, Math.min(LOGICAL - margin, ny));
        }
        target.current.x = nx;
        target.current.y = ny;

        trail.current.push({ x: nx, y: ny });
        if (trail.current.length > TRAIL_LENGTH) trail.current.shift();

        const dist = Math.hypot(reticle.current.x - nx, reticle.current.y - ny);
        currentlyHit.current = dist <= radius;
        if (currentlyHit.current) hitTime.current += dt;

        sampleAcc += dt * 1000;
        if (sampleAcc >= SAMPLE_INTERVAL_MS) {
          sampleAcc = 0;
          history.current.push(currentlyHit.current ? 1 : 0);
        }

        const remaining = Math.max(0, config.duration - elapsed.current);
        if (Math.floor(remaining * 4) !== Math.floor((remaining + dt) * 4)) {
          setHud({
            timeLeft: remaining,
            score: Math.round(hitTime.current * 118),
            accuracy: elapsed.current > 0 ? (hitTime.current / elapsed.current) * 100 : 0,
          });
        }
        if (remaining <= 0) {
          finish();
          return;
        }
      }

      draw(ctx);
      rafId.current = requestAnimationFrame(step);
    };

    const draw = (ctx) => {
      ctx.clearRect(0, 0, LOGICAL, LOGICAL);

      // trail
      trail.current.forEach((p, i) => {
        const a = (i / trail.current.length) * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(2, radius * 0.18), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 176, 0, ${a})`;
        ctx.fill();
      });

      // target
      const t = target.current;
      const hit = currentlyHit.current;
      ctx.beginPath();
      ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = hit ? "rgba(77, 255, 234, 0.22)" : "rgba(255, 176, 0, 0.14)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = hit ? "#4dffea" : "#ffb000";
      ctx.shadowColor = hit ? "rgba(77,255,234,0.8)" : "rgba(255,176,0,0.6)";
      ctx.shadowBlur = hit ? 18 : 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = hit ? "#4dffea" : "#ffb000";
      ctx.fill();

      // reticle
      const r = reticle.current;
      ctx.strokeStyle = "#4dffea";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.x - 14, r.y);
      ctx.lineTo(r.x - 4, r.y);
      ctx.moveTo(r.x + 4, r.y);
      ctx.lineTo(r.x + 14, r.y);
      ctx.moveTo(r.x, r.y - 14);
      ctx.lineTo(r.x, r.y - 4);
      ctx.moveTo(r.x, r.y + 4);
      ctx.lineTo(r.x, r.y + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r.x, r.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#4dffea";
      ctx.fill();
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const handleMove = (e) => {
      if (document.pointerLockElement === canvasRef.current) {
        reticle.current.x = Math.max(
          0,
          Math.min(LOGICAL, reticle.current.x + e.movementX * config.sensitivity)
        );
        reticle.current.y = Math.max(
          0,
          Math.min(LOGICAL, reticle.current.y + e.movementY * config.sensitivity)
        );
      } else if (phase === "ready") {
        const rect = canvasRef.current.getBoundingClientRect();
        reticle.current.x = ((e.clientX - rect.left) / rect.width) * LOGICAL;
        reticle.current.y = ((e.clientY - rect.top) / rect.height) * LOGICAL;
      }
    };
    const handleLockChange = () => {
      if (document.pointerLockElement === canvasRef.current) {
        setPhase("running");
      } else if (phase === "running" && !finishedRef.current) {
        finish();
      }
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("pointerlockchange", handleLockChange);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("pointerlockchange", handleLockChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const requestLock = () => {
    canvasRef.current.requestPointerLock?.();
  };

  return (
    <div className="game-screen" ref={containerRef}>
      <div className="game-hud">
        <div className="hud-block">
          <span className="hud-label">Time</span>
          <span className="hud-value">{hud.timeLeft.toFixed(1)}s</span>
        </div>
        <div className="hud-block">
          <span className="hud-label">Score</span>
          <span className="hud-value">{hud.score}</span>
        </div>
        <div className="hud-block">
          <span className="hud-label">Accuracy</span>
          <span className="hud-value">{hud.accuracy.toFixed(0)}%</span>
        </div>
      </div>

      <div className="game-scope-wrap">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{ width: LOGICAL, height: LOGICAL }}
          onClick={requestLock}
        />
        {phase === "ready" && (
          <button className="lock-overlay" onClick={requestLock}>
            <span className="eyebrow">Pointer lock required</span>
            <span className="lock-overlay__title">Click to begin tracking</span>
            <span className="hud-label">Esc exits early and ends the run</span>
          </button>
        )}
      </div>
    </div>
  );
}
