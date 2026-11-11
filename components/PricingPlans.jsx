"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["50 searches / day", "Free sources (Openverse, Unsplash, Pixabay)", "Standard downloads", "Community support"],
    cta: "Current plan",
    current: true
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    features: ["Unlimited searches", "All sources incl. Pinterest", "Voice search", "High-res downloads", "No ads", "Email support"],
    cta: "Upgrade to Pro",
    highlight: true
  },
  {
    name: "Team",
    price: "₹1,999",
    period: "/month",
    features: ["Everything in Pro", "5 team members", "Shared collections", "Brand kit", "API access", "Priority support"],
    cta: "Upgrade to Team"
  }
];

export default function PricingPlans() {
  const [modalPlan, setModalPlan] = useState(null);

  return (
    <>
      <div className="plans">
        {PLANS.map((plan) => (
          <div className={`plan ${plan.highlight ? "highlight" : ""}`} key={plan.name}>
            {plan.highlight && <span className="plan-tag">Most popular</span>}
            <h2>{plan.name}</h2>
            <p className="plan-price">
              {plan.price}
              <span>{plan.period}</span>
            </p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              className={`plan-cta ${plan.current ? "ghost" : ""}`}
              disabled={plan.current}
              onClick={() => setModalPlan(plan)}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {modalPlan && (
        <div className="modal-backdrop" onClick={() => setModalPlan(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🚧 Demo checkout</h3>
            <p>
              You picked <strong>{modalPlan.name}</strong> ({modalPlan.price}
              {modalPlan.period}).
            </p>
            <p className="modal-note">
              Payments are not enabled yet — this is a preview of the subscription flow. Stripe
              checkout will be connected here soon.
            </p>
            <button className="plan-cta" onClick={() => setModalPlan(null)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
