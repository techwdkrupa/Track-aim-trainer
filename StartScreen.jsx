import { useState } from "react";
import "./StartScreen.css";

const FIELDS = [
  {
    key: "duration",
    label: "Session length",
    min: 15,
    max: 90,
    step: 5,
    unit: "s",
  },
  {
    key: "targetSpeed",
    label: "Contact speed",
    min: 1,
    max: 10,
    step: 1,
    unit: "",
  },
  {
    key: "targetRadius",
    label: "Contact size",
    min: 12,
    max: 40,
    step: 2,
    unit: "px",
  },
  {
    key: "sensitivity",
    label: "Sensitivity",
    min: 0.3,
    max: 2,
    step: 0.1,
    unit: "×",
  },
];

export default function StartScreen({ initialConfig, onStart }) {
  const [config, setConfig] = useState(initialConfig);

  const update = (key, value) =>
    setConfig((c) => ({ ...c, [key]: Number(value) }));

  return (
    <div className="start-screen">
      <div className="start-scope" aria-hidden="true">
        <div className="start-scope__sweep" />
        <div className="start-scope__ring start-scope__ring--outer" />
        <div className="start-scope__ring start-scope__ring--inner" />
        <div className="start-scope__contact" />
        <div className="start-scope__cross start-scope__cross--h" />
        <div className="start-scope__cross start-scope__cross--v" />
      </div>

      <div className="start-panel">
        <p className="eyebrow">SYS // INIT</p>
        <h1 className="start-title">TRACK</h1>
        <p className="start-subtitle">
          Keep the reticle locked on a moving contact. Dwell time on target
          is your score — drift off and the count stops.
        </p>

        <div className="start-fields">
          {FIELDS.map((f) => (
            <label className="field" key={f.key}>
              <span className="field__top">
                <span className="hud-label">{f.label}</span>
                <span className="field__value">
                  {config[f.key]}
                  {f.unit}
                </span>
              </span>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={config[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </label>
          ))}
        </div>

        <button className="engage-btn" onClick={() => onStart(config)}>
          <span>Engage</span>
        </button>
      </div>
    </div>
  );
}
