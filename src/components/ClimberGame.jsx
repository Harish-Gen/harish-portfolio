import React, { useEffect, useRef, useState, useCallback } from 'react';

const PLAYER_W = 14;
const PLAYER_H = 18;
const GRAVITY = 1450;
const MOVE_SPEED = 270;
const JUMP_VELOCITY = -560;
const DOUBLE_JUMP_VELOCITY = -510;
const MAX_FALL_SPEED = 780;
const MAX_SAFE_GAP = 145;

const PLATFORM_SELECTORS = [
  '.contact-form',
  '.social-link',
  '.experience-item',
  '.project-card',
  '.skill-tag',
  '.tech-pill',
  '.btn',
  '.section-title',
  '.hero-title',
  '.hero-tagline',
].join(', ');

/**
 * Scans visible DOM elements into one-way platform rectangles in document coordinates,
 * and inserts subtle stepping-stone nodes across large vertical gaps so the climb
 * from footer to hero is always completable on desktop and mobile.
 */
function buildLevelGeometry() {
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const docHeight = document.documentElement.scrollHeight;
  const viewWidth = document.documentElement.clientWidth;

  const platforms = [];
  const seen = new Set();

  document.querySelectorAll(PLATFORM_SELECTORS).forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 16 || rect.height < 12) return;
    const x = Math.round(rect.left + scrollX);
    const y = Math.round(rect.top + scrollY);
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const key = `${x},${y},${w},${h}`;
    if (seen.has(key)) return;
    seen.add(key);
    platforms.push({ x, y, w, h, kind: 'dom' });
  });

  // Floor at the bottom near the footer so the player has a solid starting ledge
  const floorY = docHeight - 64;
  platforms.push({
    x: 16,
    y: floorY,
    w: Math.max(240, viewWidth - 32),
    h: 12,
    kind: 'floor',
  });

  // Sort top-to-bottom to detect vertical gaps that exceed comfortable jump height
  const sorted = [...platforms].sort((a, b) => a.y - b.y);
  const steppingStones = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const upper = sorted[i];
    const lower = sorted[i + 1];
    const gap = lower.y - upper.y;
    if (gap > MAX_SAFE_GAP) {
      const steps = Math.ceil(gap / 120) - 1;
      for (let s = 1; s <= steps; s += 1) {
        const t = s / (steps + 1);
        const stoneY = Math.round(upper.y + gap * t);
        const stoneW = Math.min(74, Math.max(52, viewWidth * 0.14));
        const upperMid = upper.x + upper.w / 2;
        const lowerMid = lower.x + lower.w / 2;
        const center = upperMid + (lowerMid - upperMid) * t + (s % 2 === 0 ? 36 : -36);
        const stoneX = Math.round(Math.max(24, Math.min(viewWidth - stoneW - 24, center - stoneW / 2)));
        const stone = { x: stoneX, y: stoneY, w: stoneW, h: 6, kind: 'stone' };
        platforms.push(stone);
        steppingStones.push(stone);
      }
    }
  }

  // Climbable rail along .experience-list left border
  let rail = null;
  const expList = document.querySelector('.experience-list');
  if (expList) {
    const r = expList.getBoundingClientRect();
    rail = {
      x: Math.round(r.left + scrollX),
      top: Math.round(r.top + scrollY),
      bottom: Math.round(r.bottom + scrollY),
    };
  }

  // Summit target: top of .hero-title (or y = 140 fallback)
  const heroTitle = document.querySelector('.hero-title');
  const summitY = heroTitle
    ? Math.max(95, Math.round(heroTitle.getBoundingClientRect().top + scrollY + 8))
    : 140;

  return { platforms, steppingStones, rail, summitY, floorY, docHeight, viewWidth };
}

export default function ClimberGame({ active, onExit }) {
  const [hud, setHud] = useState({ altitude: 0, elapsed: 0, won: false });
  const [stones, setStones] = useState([]);
  const [summitY, setSummitY] = useState(140);
  const [runId, setRunId] = useState(0);

  const playerRef = useRef(null);
  const puffRef = useRef(null);
  const inputRef = useRef({ left: false, right: false, up: false });
  const jumpQueuedRef = useRef(false);
  const geometryRef = useRef(null);

  const triggerJump = useCallback(() => {
    jumpQueuedRef.current = true;
  }, []);

  const restartRun = useCallback(() => {
    setRunId((id) => id + 1);
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const geo = buildLevelGeometry();
    geometryRef.current = geo;

    const state = {
      x: Math.round(geo.viewWidth / 2 - PLAYER_W / 2),
      y: geo.floorY - PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
      onRail: false,
      coyoteTimer: 0,
      jumpsLeft: 2,
      facing: 1,
      won: false,
      startTime: performance.now(),
      lastFrame: performance.now(),
      lastHudUpdate: 0,
      puffTimer: 0,
    };

    // Scroll smoothly to the starting position near the footer
    window.scrollTo({
      top: Math.max(0, state.y - window.innerHeight * 0.65),
      behavior: 'auto',
    });

    const syncFrameId = window.requestAnimationFrame(() => {
      setStones(geo.steppingStones);
      setSummitY(geo.summitY);
      setHud({ altitude: 0, elapsed: 0, won: false });
    });

    const onResize = () => {
      const updated = buildLevelGeometry();
      geometryRef.current = updated;
      setStones(updated.steppingStones);
      setSummitY(updated.summitY);
      state.x = Math.max(8, Math.min(updated.viewWidth - PLAYER_W - 8, state.x));
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        if (!e.repeat) jumpQueuedRef.current = true;
        inputRef.current.up = true;
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inputRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inputRef.current.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        inputRef.current.up = false;
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let frameId;
    const tick = (now) => {
      const dt = Math.min(0.033, (now - state.lastFrame) / 1000);
      state.lastFrame = now;

      const currentGeo = geometryRef.current;
      if (!state.won && currentGeo) {
        const { left, right, up } = inputRef.current;

        // Horizontal movement
        let targetVx = 0;
        if (left) {
          targetVx -= MOVE_SPEED;
          state.facing = -1;
        }
        if (right) {
          targetVx += MOVE_SPEED;
          state.facing = 1;
        }
        state.vx += (targetVx - state.vx) * Math.min(1, dt * 16);

        // Check climbable .experience-list rail
        const rail = currentGeo.rail;
        const nearRail =
          rail &&
          Math.abs(state.x + PLAYER_W / 2 - rail.x) < 18 &&
          state.y + PLAYER_H >= rail.top &&
          state.y <= rail.bottom;

        if (nearRail && up) {
          state.onRail = true;
          state.vy = -210;
          state.jumpsLeft = 2;
        } else {
          state.onRail = false;
        }

        // Coyote time & jump handling
        if (state.onGround) {
          state.coyoteTimer = 0.1;
          state.jumpsLeft = 2;
        } else {
          state.coyoteTimer = Math.max(0, state.coyoteTimer - dt);
        }

        if (jumpQueuedRef.current) {
          jumpQueuedRef.current = false;
          if (state.coyoteTimer > 0) {
            state.vy = JUMP_VELOCITY;
            state.onGround = false;
            state.coyoteTimer = 0;
            state.jumpsLeft = 1;
          } else if (state.jumpsLeft > 0) {
            state.vy = DOUBLE_JUMP_VELOCITY;
            state.jumpsLeft -= 1;
            state.puffTimer = 0.22;
            if (puffRef.current) {
              puffRef.current.style.transform = `translate3d(${state.x - 4}px, ${state.y + PLAYER_H - 4}px, 0)`;
              puffRef.current.style.opacity = '1';
            }
          }
        }

        // Gravity
        if (!state.onRail) {
          state.vy = Math.min(MAX_FALL_SPEED, state.vy + GRAVITY * dt);
        }

        const prevBottom = state.y + PLAYER_H;
        state.x += state.vx * dt;
        state.y += state.vy * dt;

        // Clamp horizontal bounds
        if (state.x < 8) {
          state.x = 8;
          state.vx = 0;
        } else if (state.x > currentGeo.viewWidth - PLAYER_W - 8) {
          state.x = currentGeo.viewWidth - PLAYER_W - 8;
          state.vx = 0;
        }

        // One-way platform landing (only when falling)
        state.onGround = false;
        if (state.vy >= 0) {
          const newBottom = state.y + PLAYER_H;
          for (let i = 0; i < currentGeo.platforms.length; i += 1) {
            const p = currentGeo.platforms[i];
            const overlapsX = state.x + PLAYER_W - 2 > p.x && state.x + 2 < p.x + p.w;
            if (overlapsX && prevBottom <= p.y + 6 && newBottom >= p.y) {
              state.y = p.y - PLAYER_H;
              state.vy = 0;
              state.onGround = true;
              break;
            }
          }
        }

        // Safety floor clamp
        if (state.y > currentGeo.floorY - PLAYER_H) {
          state.y = currentGeo.floorY - PLAYER_H;
          state.vy = 0;
          state.onGround = true;
        }

        // Smooth camera follow
        const targetScroll = Math.max(
          0,
          Math.min(
            currentGeo.docHeight - window.innerHeight,
            state.y - window.innerHeight * 0.45
          )
        );
        const currentScroll = window.scrollY;
        if (Math.abs(targetScroll - currentScroll) > 1) {
          window.scrollTo(0, currentScroll + (targetScroll - currentScroll) * Math.min(1, dt * 8));
        }

        // Check summit win condition
        if (state.y <= currentGeo.summitY) {
          state.won = true;
          const finalTime = (now - state.startTime) / 1000;
          setHud({ altitude: 100, elapsed: finalTime, won: true });
        } else if (now - state.lastHudUpdate > 90) {
          state.lastHudUpdate = now;
          const totalClimb = Math.max(1, currentGeo.floorY - PLAYER_H - currentGeo.summitY);
          const climbed = Math.max(0, currentGeo.floorY - PLAYER_H - state.y);
          const pct = Math.min(99, Math.round((climbed / totalClimb) * 100));
          setHud({ altitude: pct, elapsed: (now - state.startTime) / 1000, won: false });
        }

        if (state.puffTimer > 0) {
          state.puffTimer = Math.max(0, state.puffTimer - dt);
          if (state.puffTimer === 0 && puffRef.current) {
            puffRef.current.style.opacity = '0';
          }
        }
      }

      if (playerRef.current) {
        const scaleX = state.facing;
        const scaleY = !state.onGround && state.vy < -80 ? 1.12 : 1;
        playerRef.current.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(syncFrameId);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      inputRef.current = { left: false, right: false, up: false };
      jumpQueuedRef.current = false;
    };
  }, [active, runId, onExit]);

  if (!active) return null;

  const setDir = (dir, pressed) => (e) => {
    e.preventDefault();
    inputRef.current[dir] = pressed;
  };

  return (
    <>
      <div className="climber-world" aria-hidden="true">
        <div className="climber-summit-line" style={{ top: `${summitY}px` }}>
          <span>SUMMIT // TARGET</span>
        </div>

        {stones.map((stone, idx) => (
          <div
            key={`${stone.x}-${stone.y}-${idx}`}
            className="climber-stone"
            style={{ left: `${stone.x}px`, top: `${stone.y}px`, width: `${stone.w}px` }}
          />
        ))}

        <div ref={puffRef} className="climber-puff" />

        <div ref={playerRef} className="climber-sprite">
          <svg width={PLAYER_W} height={PLAYER_H} viewBox="0 0 14 18" fill="none">
            <rect x="3" y="1" width="8" height="7" fill="currentColor" />
            <rect x="7" y="3" width="3" height="2" fill="var(--red)" />
            <rect x="4" y="8" width="6" height="6" fill="currentColor" />
            <rect x="3" y="14" width="3" height="4" fill="currentColor" />
            <rect x="8" y="14" width="3" height="4" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="climber-hud" role="region" aria-label="Climber mini-game controls">
        <div className="climber-hud-info">
          <span className="climber-hud-title">
            {hud.won ? 'SUMMIT REACHED' : 'CLIMB // SITE'}
          </span>
          <span className="climber-hud-stat">ALT {String(hud.altitude).padStart(2, '0')}%</span>
          <span className="climber-hud-stat">{hud.elapsed.toFixed(1)}s</span>
          {hud.won ? (
            <button type="button" className="climber-hud-btn is-accent" onClick={restartRun}>
              Replay
            </button>
          ) : null}
          <button type="button" className="climber-hud-btn" onClick={onExit}>
            Exit
          </button>
        </div>

        {!hud.won && (
          <div className="climber-touch-controls">
            <div className="climber-touch-pair">
              <button
                type="button"
                className="climber-touch-btn"
                aria-label="Move left"
                onPointerDown={setDir('left', true)}
                onPointerUp={setDir('left', false)}
                onPointerLeave={setDir('left', false)}
                onPointerCancel={setDir('left', false)}
              >
                ◀
              </button>
              <button
                type="button"
                className="climber-touch-btn"
                aria-label="Move right"
                onPointerDown={setDir('right', true)}
                onPointerUp={setDir('right', false)}
                onPointerLeave={setDir('right', false)}
                onPointerCancel={setDir('right', false)}
              >
                ▶
              </button>
            </div>
            <button
              type="button"
              className="climber-touch-btn is-jump"
              aria-label="Jump"
              onPointerDown={(e) => {
                e.preventDefault();
                inputRef.current.up = true;
                triggerJump();
              }}
              onPointerUp={setDir('up', false)}
              onPointerLeave={setDir('up', false)}
              onPointerCancel={setDir('up', false)}
            >
              ▲ JUMP
            </button>
          </div>
        )}
      </div>
    </>
  );
}
