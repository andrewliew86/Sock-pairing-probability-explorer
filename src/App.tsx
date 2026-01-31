import React, { useMemo, useState } from "react";
import "./styles.css";

function clampInt(x: number, min: number, max: number) {
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

function mismatchProbability(nPairs: number) {
  // P(mismatch) = (n-1)/(2n-1) for n>=1, and 0 when n=1
  if (nPairs <= 1) return 0;
  return (nPairs - 1) / (2 * nPairs - 1);
}

function fmtPct(p: number) {
  return `${(p * 100).toFixed(2)}%`;
}

type SimResult = {
  trials: number;
  mismatches: number;
  estimate: number;
};

function drawTwo(nPairs: number): boolean {
  // Returns true if mismatch (LL or RR).
  // Model: n lefts, n rights, draw 2 without replacement.
  // We simulate by selecting from counts rather than building an array.
  let L = nPairs;
  let R = nPairs;

  const firstIsLeft = Math.random() < L / (L + R);
  if (firstIsLeft) L--;
  else R--;

  const secondIsLeft = Math.random() < L / (L + R);
  // mismatch if both same side
  return firstIsLeft === secondIsLeft;
}

export default function App() {
  const [nPairsRaw, setNPairsRaw] = useState(10);
  const [trialsRaw, setTrialsRaw] = useState(20000);
  const [sim, setSim] = useState<SimResult | null>(null);
  const [drawerShake, setDrawerShake] = useState(0);

  const nPairs = useMemo(() => clampInt(nPairsRaw, 1, 200), [nPairsRaw]);
  const trials = useMemo(() => clampInt(trialsRaw, 100, 500000), [trialsRaw]);

  const pMismatch = useMemo(() => mismatchProbability(nPairs), [nPairs]);
  const pMatch = 1 - pMismatch;

  const runSim = () => {
    let mismatches = 0;
    for (let i = 0; i < trials; i++) {
      if (drawTwo(nPairs)) mismatches++;
    }
    const estimate = mismatches / trials;
    setSim({ trials, mismatches, estimate });
    setDrawerShake((x) => x + 1);
  };

  const clearSim = () => setSim(null);

  const difference = sim ? Math.abs(sim.estimate - pMismatch) : null;

  return (
    <div className="page">
      <header className="header">
        <div className="titleBlock">
          <h1>🧦 Sock Mismatch Probability</h1>
          <p>
            You have <b>n</b> pairs → <b>n</b> left socks and <b>n</b> right socks.
            You grab 2 socks randomly.
          </p>
        </div>
        <div className="formulaCard" aria-label="formula">
          <div className="formulaLabel">Exact result</div>
          <div className="formula">
            P(mismatch) = <span className="mono">(n − 1) / (2n − 1)</span>
          </div>
        </div>
      </header>

      <main className="grid">
        {/* Controls */}
        <section className="card">
          <h2>Controls</h2>

          <div className="control">
            <label>
              Number of pairs (n): <span className="mono">{nPairs}</span>
            </label>
            <input
              type="range"
              min={1}
              max={200}
              value={nPairs}
              onChange={(e) => setNPairsRaw(Number(e.target.value))}
            />
            <input
              className="numberInput"
              type="number"
              min={1}
              max={200}
              value={nPairs}
              onChange={(e) => setNPairsRaw(Number(e.target.value))}
            />
          </div>

          <div className="control">
            <label>
              Simulation trials: <span className="mono">{trials.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={100}
              max={200000}
              step={100}
              value={Math.min(trials, 200000)}
              onChange={(e) => setTrialsRaw(Number(e.target.value))}
            />
            <input
              className="numberInput"
              type="number"
              min={100}
              max={500000}
              step={100}
              value={trials}
              onChange={(e) => setTrialsRaw(Number(e.target.value))}
            />
          </div>

          <div className="buttonRow">
            <button className="btn primary" onClick={runSim}>
              Run simulation
            </button>
            <button className="btn" onClick={() => setDrawerShake((x) => x + 1)}>
              Shake drawer
            </button>
            <button className="btn ghost" onClick={clearSim} disabled={!sim}>
              Clear
            </button>
          </div>

          <div className="note">
            Tip: If you want “random pairing while folding” instead, tell me your
            exact process and we can model that too.
          </div>
        </section>

        {/* Results */}
        <section className="card">
          <h2>Results</h2>

          <div className="bigStatRow">
            <div className="bigStat">
              <div className="bigLabel">Mismatch (LL or RR)</div>
              <div className="bigValue">{fmtPct(pMismatch)}</div>
            </div>
            <div className="bigStat">
              <div className="bigLabel">Match (LR)</div>
              <div className="bigValue">{fmtPct(pMatch)}</div>
            </div>
          </div>

          <div className="barWrap" aria-label="probability bar">
            <div className="bar">
              <div className="barFill" style={{ width: `${pMismatch * 100}%` }} />
            </div>
            <div className="barLabels">
              <span className="mono">0%</span>
              <span className="mono">50%</span>
              <span className="mono">100%</span>
            </div>
          </div>

          {sim && (
            <div className="simCard">
              <div className="simTitle">Simulation</div>
              <div className="simGrid">
                <div>
                  <div className="simLabel">Estimated mismatch</div>
                  <div className="simValue mono">{fmtPct(sim.estimate)}</div>
                </div>
                <div>
                  <div className="simLabel">Mismatches</div>
                  <div className="simValue mono">
                    {sim.mismatches.toLocaleString()} / {sim.trials.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="simLabel">Abs. difference vs exact</div>
                  <div className="simValue mono">
                    {difference !== null ? fmtPct(difference) : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Visuals */}
        <section className="card">
          <h2>Sock drawer</h2>

          <div className="drawerRow">
            <div className={`drawer ${drawerShake % 2 === 1 ? "shake" : ""}`}>
              <div className="drawerTop">
                <div className="drawerTitle">Drawer contents</div>
                <div className="drawerMeta mono">
                  {nPairs} L • {nPairs} R • {2 * nPairs} total
                </div>
              </div>

              <div className="sockGrid">
                {Array.from({ length: Math.min(2 * nPairs, 60) }).map((_, i) => {
                  // First nPairs shown as L, rest as R (just for visualization)
                  const isLeft = i < Math.min(nPairs, 30);
                  return (
                    <SockIcon key={i} side={isLeft ? "L" : "R"} />
                  );
                })}
                {2 * nPairs > 60 && (
                  <div className="moreSocks mono">+{2 * nPairs - 60} more</div>
                )}
              </div>
            </div>

            <div className="explain">
              <h3>What “mismatch” means here</h3>
              <p>
                You randomly grab two socks. If you end up with{" "}
                <b>two lefts</b> or <b>two rights</b>, that’s a mismatch.
              </p>
              <div className="miniRow">
                <MiniPair label="Match" left="L" right="R" />
                <MiniPair label="Mismatch" left="L" right="L" />
                <MiniPair label="Mismatch" left="R" right="R" />
              </div>
            </div>
          </div>
        </section>

        {/* Insight */}
        <section className="card">
          <h2>Quick intuition</h2>
          <ul className="bullets">
            <li>
              With <b>1 pair</b>, mismatch is impossible → <span className="mono">0%</span>.
            </li>
            <li>
              As <b>n</b> grows, mismatch approaches <span className="mono">50%</span>.
            </li>
            <li>
              Example: <b>10 pairs</b> → mismatch = <span className="mono">{fmtPct(mismatchProbability(10))}</span>.
            </li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        Built with React + TypeScript.
      </footer>
    </div>
  );
}

function SockIcon({ side }: { side: "L" | "R" }) {
  const flip = side === "R";
  return (
    <div className={`sock ${flip ? "flip" : ""}`} title={side}>
      <svg viewBox="0 0 64 64" role="img" aria-label={`sock ${side}`}>
        <path
          d="M22 6 h18 v26 c0 6 8 7 10 15 2 8-4 13-14 13H24c-9 0-14-5-12-13 2-8 10-9 10-15V6z"
          className="sockBody"
        />
        <path d="M22 6h18v8H22z" className="sockCuff" />
        <text x="32" y="40" textAnchor="middle" className="sockText">
          {side}
        </text>
      </svg>
    </div>
  );
}

function MiniPair({ label, left, right }: { label: string; left: "L" | "R"; right: "L" | "R" }) {
  return (
    <div className="miniPair">
      <div className="miniLabel">{label}</div>
      <div className="miniSocks">
        <div className="miniSock">{left}</div>
        <div className="miniSock">{right}</div>
      </div>
    </div>
  );
}
