"use client";

export default function ImageGrid({ images }) {
  if (!images.length) return null;

  return (
    <div className="grid">
      {images.map((img) => (
        <figure className="card" key={img.id}>
          <a href={img.pageUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.thumb} alt={img.alt} loading="lazy" />
          </a>
          <figcaption className="meta">
            <a href={img.photographerUrl || img.pageUrl} target="_blank" rel="noopener noreferrer">
              {img.photographer}
            </a>
            <span className="meta-actions">
              {img.dl && (
                <a className="dl" href={img.dl} title="Download image" aria-label="Download image">
                  ⬇
                </a>
              )}
              <span className={`badge ${img.source}`}>{img.source}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
