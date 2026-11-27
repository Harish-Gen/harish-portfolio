import React, { useEffect, useRef, useState, useCallback } from 'react';

const PLAYER_W = 16;
const PLAYER_H = 20;
const GRAVITY = 1450;
const MOVE_SPEED = 270;
const JUMP_VELOCITY = -560;
const DOUBLE_JUMP_VELOCITY = -550;
const SPRING_VELOCITY = -790;
const MAX_FALL_SPEED = 780;
const WALL_SLIDE_SPEED = 52;
const MAX_SAFE_GAP = 125;
const PB_STORAGE_KEY = 'harish_climber_pb';

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

function readStoredPB() {
  try {
    const raw = window.localStorage.getItem(PB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredPB(seconds) {
  try {
    window.localStorage.setItem(PB_STORAGE_KEY, seconds.toFixed(2));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

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
  let totalSkills = 0;

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

    const isSkill = el.classList.contains('skill-tag');
    const isSpring = el.classList.contains('btn-primary');
    const isWall = el.classList.contains('project-card') || el.classList.contains('contact-form');
    if (isSkill) totalSkills += 1;

    platforms.push({ x, y, w, h, kind: 'dom', el, isSkill, isSpring, isWall });
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
      const steps = Math.ceil(gap / 105) - 1;
      for (let s = 1; s <= steps; s += 1) {
        const t = s / (steps + 1);
        const stoneY = Math.round(upper.y + gap * t);
        const stoneW = Math.min(92, Math.max(64, viewWidth * 0.16));
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

  return { platforms, steppingStones, rail, summitY, floorY, docHeight, viewWidth, totalSkills };
}

export default function ClimberGame({ active, onExit }) {
  const [hud, setHud] = useState({
    altitude: 0,
    elapsed: 0,
    won: false,
    skills: 0,
    totalSkills: 0,
    pb: null,
    pbLabel: '',
  });
  const [stones, setStones] = useState([]);
  const [summitY, setSummitY] = useState(140);
  const [runId, setRunId] = useState(0);

  const playerRef = useRef(null);
  const webLineRef = useRef(null);
  const webAccentRef = useRef(null);
  const springRef = useRef(null);
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

    const prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    const geo = buildLevelGeometry();
    geometryRef.current = geo;
    let lastWidth = geo.viewWidth;
    const initialPb = readStoredPB();

    const collectedSkills = new Set();
    const flashTimers = new Map();

    const flashElement = (el) => {
      if (!el) return;
      el.classList.add('climber-landed');
      const existingTimer = flashTimers.get(el);
      if (existingTimer) window.clearTimeout(existingTimer);
      const timer = window.setTimeout(() => {
        el.classList.remove('climber-landed');
        flashTimers.delete(el);
      }, 320);
      flashTimers.set(el, timer);
    };

    const state = {
      x: Math.round(geo.viewWidth / 2 - PLAYER_W / 2),
      y: geo.floorY - PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
      onRail: false,
      wallSide: 0, // -1 left wall, 1 right wall
      coyoteTimer: 0,
      jumpsLeft: 2,
      facing: 1,
      won: false,
      startTime: performance.now(),
      lastFrame: performance.now(),
      lastHudUpdate: 0,
      webTimer: 0,
      webAnchorX: 0,
      webAnchorY: 0,
      springTimer: 0,
    };

    // Scroll smoothly to the starting position near the footer
    window.scrollTo({
      top: Math.max(0, state.y - window.innerHeight * 0.65),
      behavior: 'auto',
    });

    const syncFrameId = window.requestAnimationFrame(() => {
      setStones(geo.steppingStones);
      setSummitY(geo.summitY);
      setHud({
        altitude: 0,
        elapsed: 0,
        won: false,
        skills: 0,
        totalSkills: geo.totalSkills,
        pb: initialPb,
        pbLabel: initialPb ? `PB ${initialPb.toFixed(1)}s` : '',
      });
    });

    const onResize = () => {
      const currentWidth = document.documentElement.clientWidth;
      if (Math.abs(currentWidth - lastWidth) < 2) return;
      lastWidth = currentWidth;
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

        // Coyote time & jump / web-zip handling
        if (state.onGround) {
          state.coyoteTimer = 0.1;
          state.jumpsLeft = 2;
        } else {
          state.coyoteTimer = Math.max(0, state.coyoteTimer - dt);
        }

        if (jumpQueuedRef.current) {
          jumpQueuedRef.current = false;
          if (state.wallSide !== 0 && !state.onGround) {
            // Wall-kick off .project-card / .contact-form edge
            state.vy = JUMP_VELOCITY * 0.96;
            state.vx = -state.wallSide * 250;
            state.facing = -state.wallSide;
            state.wallSide = 0;
            state.jumpsLeft = 1;
          } else if (state.coyoteTimer > 0) {
            state.vy = JUMP_VELOCITY;
            state.onGround = false;
            state.coyoteTimer = 0;
            state.jumpsLeft = 1;
          } else if (state.jumpsLeft > 0) {
            // Web-zip toward nearest platform above
            const centerX = state.x + PLAYER_W / 2;
            let bestTarget = null;
            let bestScore = Infinity;
            for (let i = 0; i < currentGeo.platforms.length; i += 1) {
              const p = currentGeo.platforms[i];
              const bottomY = p.y + p.h;
              const dy = state.y - bottomY;
              if (dy > 8 && dy < 270) {
                const clampedX = Math.max(p.x + 8, Math.min(p.x + p.w - 8, centerX));
                const dx = Math.abs(clampedX - centerX);
                if (dx < 190) {
                  const score = dy + dx * 0.85;
                  if (score < bestScore) {
                    bestScore = score;
                    bestTarget = { x: clampedX, y: p.y + Math.min(p.h, 12) };
                  }
                }
              }
            }

            state.webAnchorX = bestTarget
              ? bestTarget.x
              : Math.max(16, Math.min(currentGeo.viewWidth - 16, centerX + state.facing * 26));
            state.webAnchorY = bestTarget
              ? bestTarget.y
              : Math.max(20, state.y - 165);
            state.webTimer = 0.24;

            const pullX = state.webAnchorX - centerX;
            state.vx += Math.max(-180, Math.min(180, pullX * 1.4));
            state.vy = DOUBLE_JUMP_VELOCITY;
            state.jumpsLeft -= 1;
          }
        }

        // Gravity
        if (!state.onRail) {
          state.vy = Math.min(MAX_FALL_SPEED, state.vy + GRAVITY * dt);
        }

        const wasOnGround = state.onGround;
        const prevBottom = state.y + PLAYER_H;
        const prevLeft = state.x;
        const prevRight = state.x + PLAYER_W;
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

        // Wall-cling check on .project-card / .contact-form side edges
        state.wallSide = 0;
        if (!state.onGround && !state.onRail && state.vy > -40) {
          for (let i = 0; i < currentGeo.platforms.length; i += 1) {
            const p = currentGeo.platforms[i];
            if (!p.isWall) continue;
            const overlapsY = state.y + PLAYER_H > p.y + 6 && state.y < p.y + p.h - 4;
            if (!overlapsY) continue;

            // Touching left edge of card (wall is to player's right -> wallSide = 1)
            if (prevRight <= p.x + 5 && state.x + PLAYER_W >= p.x - 2 && (right || state.vx >= 0)) {
              state.x = p.x - PLAYER_W;
              state.vx = 0;
              state.vy = Math.min(state.vy, WALL_SLIDE_SPEED);
              state.wallSide = 1;
              state.facing = 1;
              state.jumpsLeft = Math.max(state.jumpsLeft, 1);
              flashElement(p.el);
              break;
            }
            // Touching right edge of card (wall is to player's left -> wallSide = -1)
            if (prevLeft >= p.x + p.w - 5 && state.x <= p.x + p.w + 2 && (left || state.vx <= 0)) {
              state.x = p.x + p.w;
              state.vx = 0;
              state.vy = Math.min(state.vy, WALL_SLIDE_SPEED);
              state.wallSide = -1;
              state.facing = -1;
              state.jumpsLeft = Math.max(state.jumpsLeft, 1);
              flashElement(p.el);
              break;
            }
          }
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

              if (p.el) {
                if (!wasOnGround) flashElement(p.el);
                if (p.isSkill && !collectedSkills.has(p.el)) {
                  collectedSkills.add(p.el);
                  p.el.classList.add('climber-skill-collected');
                }
              }

              if (p.isSpring) {
                state.vy = SPRING_VELOCITY;
                state.onGround = false;
                state.jumpsLeft = 1;
                state.springTimer = 0.34;
                if (springRef.current) {
                  springRef.current.style.transform = `translate3d(${state.x - 11}px, ${p.y - 14}px, 0) scale(1)`;
                  springRef.current.style.opacity = '1';
                }
              } else {
                state.vy = 0;
                state.onGround = true;
              }
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
          let nextPb = initialPb;
          let pbLabel = '';

          if (initialPb === null) {
            nextPb = finalTime;
            pbLabel = 'FIRST RECORD';
            writeStoredPB(finalTime);
          } else if (finalTime < initialPb) {
            const diff = (initialPb - finalTime).toFixed(1);
            nextPb = finalTime;
            pbLabel = `NEW BEST (-${diff}s)`;
            writeStoredPB(finalTime);
          } else {
            pbLabel = `PB ${initialPb.toFixed(1)}s`;
          }

          setHud({
            altitude: 100,
            elapsed: finalTime,
            won: true,
            skills: collectedSkills.size,
            totalSkills: currentGeo.totalSkills,
            pb: nextPb,
            pbLabel,
          });
        } else if (now - state.lastHudUpdate > 90) {
          state.lastHudUpdate = now;
          const totalClimb = Math.max(1, currentGeo.floorY - PLAYER_H - currentGeo.summitY);
          const climbed = Math.max(0, currentGeo.floorY - PLAYER_H - state.y);
          const pct = Math.min(99, Math.round((climbed / totalClimb) * 100));
          setHud({
            altitude: pct,
            elapsed: (now - state.startTime) / 1000,
            won: false,
            skills: collectedSkills.size,
            totalSkills: currentGeo.totalSkills,
            pb: initialPb,
            pbLabel: initialPb ? `PB ${initialPb.toFixed(1)}s` : '',
          });
        }

        if (state.webTimer > 0) {
          state.webTimer = Math.max(0, state.webTimer - dt);
          const handX = state.x + (state.facing > 0 ? 13 : 3);
          const handY = state.y + 8;
          const opacity = Math.min(1, state.webTimer / 0.12);
          [webLineRef.current, webAccentRef.current].forEach((lineEl) => {
            if (!lineEl) return;
            lineEl.setAttribute('x1', handX.toFixed(1));
            lineEl.setAttribute('y1', handY.toFixed(1));
            lineEl.setAttribute('x2', state.webAnchorX.toFixed(1));
            lineEl.setAttribute('y2', state.webAnchorY.toFixed(1));
            lineEl.style.opacity = `${opacity}`;
          });
        } else {
          if (webLineRef.current) webLineRef.current.style.opacity = '0';
          if (webAccentRef.current) webAccentRef.current.style.opacity = '0';
        }

        if (state.springTimer > 0) {
          state.springTimer = Math.max(0, state.springTimer - dt);
          if (springRef.current) {
            const progress = 1 - state.springTimer / 0.34;
            springRef.current.style.opacity = `${Math.max(0, 1 - progress)}`;
            if (state.springTimer === 0) {
              springRef.current.style.opacity = '0';
            }
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
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
      window.cancelAnimationFrame(syncFrameId);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      flashTimers.forEach((timer, el) => {
        window.clearTimeout(timer);
        el.classList.remove('climber-landed');
      });
      flashTimers.clear();
      collectedSkills.forEach((el) => el.classList.remove('climber-skill-collected'));
      collectedSkills.clear();
      inputRef.current = { left: false, right: false, up: false };
      jumpQueuedRef.current = false;
    };
  }, [active, runId, onExit]);

  if (!active) return null;

  const setDir = (dir, pressed) => (e) => {
    e.preventDefault();
    if (pressed) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    inputRef.current[dir] = pressed;
  };

  const fullStackCollected = hud.totalSkills > 0 && hud.skills === hud.totalSkills;

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

        <svg className="climber-web-layer" aria-hidden="true">
          <line ref={webLineRef} className="climber-web-line" x1="0" y1="0" x2="0" y2="0" />
          <line ref={webAccentRef} className="climber-web-accent" x1="0" y1="0" x2="0" y2="0" />
        </svg>
        <div ref={springRef} className="climber-spring-ripple" />

        <div ref={playerRef} className="climber-sprite">
          <svg
            width={PLAYER_W}
            height={PLAYER_H}
            viewBox="0 0 16 20"
            fill="none"
            shapeRendering="crispEdges"
          >
            {/* Head / Mask */}
            <rect x="4" y="1" width="8" height="7" fill="#e1262f" />
            <rect x="3" y="2" width="1" height="5" fill="#111111" />
            <rect x="12" y="2" width="1" height="5" fill="#111111" />
            <rect x="5" y="0" width="6" height="1" fill="#111111" />
            {/* Sharp White Pixel Eyes */}
            <rect x="5" y="3" width="2" height="2" fill="#ffffff" />
            <rect x="6" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="10" y="3" width="2" height="2" fill="#ffffff" />
            <rect x="9" y="4" width="2" height="1" fill="#ffffff" />
            {/* Torso & Suit Accents */}
            <rect x="4" y="8" width="8" height="6" fill="#e1262f" />
            <rect x="3" y="8" width="1" height="5" fill="#111111" />
            <rect x="12" y="8" width="1" height="5" fill="#111111" />
            <rect x="7" y="9" width="2" height="3" fill="#111111" />
            <rect x="4" y="12" width="8" height="2" fill="#111111" />
            {/* Arms / Web-shooting Hands */}
            <rect x="2" y="9" width="1" height="3" fill="#e1262f" />
            <rect x="13" y="9" width="1" height="3" fill="#e1262f" />
            {/* Legs & Boots */}
            <rect x="4" y="14" width="3" height="3" fill="#111111" />
            <rect x="9" y="14" width="3" height="3" fill="#111111" />
            <rect x="4" y="17" width="3" height="3" fill="#e1262f" />
            <rect x="9" y="17" width="3" height="3" fill="#e1262f" />
          </svg>
        </div>
      </div>

      <div className="climber-hud" role="region" aria-label="Climber mini-game controls">
        <div className="climber-hud-info">
          <span className="climber-hud-title">
            {hud.won ? 'SUMMIT REACHED' : 'CLIMB // SITE'}
          </span>
          <span className="climber-hud-stat">ALT {String(hud.altitude).padStart(2, '0')}%</span>
          <span className="climber-hud-stat">
            SKILLS {String(hud.skills).padStart(2, '0')}/{String(hud.totalSkills).padStart(2, '0')}
          </span>
          <span className="climber-hud-stat">{hud.elapsed.toFixed(1)}s</span>
          {hud.pbLabel ? (
            <span className={`climber-hud-stat ${hud.won && hud.pbLabel.startsWith('NEW') ? 'is-record' : ''}`}>
              {hud.pbLabel}
            </span>
          ) : null}
          {hud.won && fullStackCollected ? (
            <span className="climber-hud-stat is-record">100% STACK</span>
          ) : null}
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
                e.currentTarget.setPointerCapture?.(e.pointerId);
                inputRef.current.up = true;
                triggerJump();
              }}
              onPointerUp={setDir('up', false)}
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
