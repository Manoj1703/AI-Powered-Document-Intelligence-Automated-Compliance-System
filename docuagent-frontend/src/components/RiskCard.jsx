import React from "react";
import { normalizeRisk } from "../utils";

function RiskCard({ label, value, risk }) {
  const tone = risk ? `risk-${normalizeRisk(risk)}` : "";

  return (
    <article className={`glass-card stat-card ${tone}`}>
      <p className="card-label">{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

export default RiskCard;
