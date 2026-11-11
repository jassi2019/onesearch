export default function AnimatedTitle() {
  const letters = [
    ...("One".split("").map((c) => ({ c, grad: false }))),
    ...("Search".split("").map((c) => ({ c, grad: true })))
  ];

  return (
    <h1 className="hero-title" aria-label="OneSearch">
      {letters.map((l, i) => (
        <span
          key={i}
          className={`lt ${l.grad ? "grad" : ""}`}
          style={{ animationDelay: `${i * 0.06}s, ${0.7 + i * 0.15}s, 0s` }}
        >
          {l.c}
        </span>
      ))}
    </h1>
  );
}
