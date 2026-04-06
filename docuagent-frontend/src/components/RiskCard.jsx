import React, { useEffect, useState } from "react";

function RiskCard({ label, value, tone = "total", badge = "AI", delta, deltaTone = "delta-same" }) {
  const target = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const durationMs = 700;
    const frameMs = 16;
    const steps = Math.max(1, Math.floor(durationMs / frameMs));
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const next = Math.round((target * step) / steps);
      setDisplayValue(next);
      if (step >= steps) {
        window.clearInterval(timer);
        setDisplayValue(target);
      }
    }, frameMs);

    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <article className={`kpi-card ${tone} page-enter`}>
      <span className="kpi-type" aria-hidden="true">
        {badge}
      </span>
      <span className="kpi-label">{label}</span>
      <span className="kpi-number">{displayValue}</span>
      {delta ? <span className={`kpi-delta ${deltaTone.replace("delta-", "")}`}>{delta}</span> : null}
    </article>
  );
}

export default RiskCard;
