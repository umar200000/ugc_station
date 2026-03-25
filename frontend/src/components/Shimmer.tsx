export function AdCardShimmer() {
  return (
    <div className="shimmer-card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div className="shimmer shimmer-circle" />
        <div style={{ flex: 1 }}>
          <div className="shimmer shimmer-line h-lg w-80" />
          <div className="shimmer shimmer-line w-40" style={{ marginBottom: 0 }} />
        </div>
      </div>
      <div className="shimmer shimmer-line w-full" />
      <div className="shimmer shimmer-line w-80" />
      <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 4 }}>
        <div className="shimmer" style={{ width: 64, height: 24, borderRadius: 100 }} />
        <div className="shimmer" style={{ width: 56, height: 24, borderRadius: 100 }} />
      </div>
      <div className="shimmer shimmer-bar" />
    </div>
  );
}

export function InfluencerCardShimmer() {
  return (
    <div className="shimmer-card">
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div className="shimmer" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="shimmer shimmer-line h-lg w-60" />
          <div className="shimmer shimmer-line w-40" />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="shimmer" style={{ width: 48, height: 12, borderRadius: 4 }} />
            <div className="shimmer" style={{ width: 72, height: 12, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyAdCardShimmer() {
  return (
    <div className="shimmer-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="shimmer shimmer-line h-lg w-60" />
        <div className="shimmer" style={{ width: 64, height: 24, borderRadius: 100 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="shimmer shimmer-line w-40" style={{ marginBottom: 0 }} />
        <div className="shimmer" style={{ width: 72, height: 28, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function ApplicationShimmer() {
  return (
    <div className="shimmer-card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <div className="shimmer" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="shimmer shimmer-line h-lg w-60" />
          <div className="shimmer shimmer-line w-40" style={{ marginBottom: 0 }} />
        </div>
        <div className="shimmer" style={{ width: 72, height: 24, borderRadius: 100 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="shimmer" style={{ flex: 1, height: 38, borderRadius: 8 }} />
        <div className="shimmer" style={{ flex: 1, height: 38, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function FeedShimmer() {
  return (
    <>
      <AdCardShimmer />
      <AdCardShimmer />
      <AdCardShimmer />
    </>
  );
}

export function AdDetailShimmer() {
  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      {/* Back button */}
      <div className="shimmer" style={{ width: 110, height: 42, borderRadius: 12, marginBottom: 16 }} />

      {/* Image carousel */}
      <div className="shimmer" style={{ width: '100%', height: 220, borderRadius: 16, marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        <div className="shimmer" style={{ width: 20, height: 6, borderRadius: 100 }} />
        <div className="shimmer" style={{ width: 6, height: 6, borderRadius: 100 }} />
        <div className="shimmer" style={{ width: 6, height: 6, borderRadius: 100 }} />
      </div>

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="shimmer" style={{ width: '65%', height: 24, borderRadius: 8 }} />
        <div className="shimmer" style={{ width: 70, height: 26, borderRadius: 100 }} />
      </div>
      <div className="shimmer" style={{ width: '45%', height: 14, borderRadius: 6, marginBottom: 20 }} />

      {/* Slot bar */}
      <div className="shimmer-card" style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="shimmer" style={{ width: '40%', height: 14, borderRadius: 6 }} />
          <div className="shimmer" style={{ width: '25%', height: 14, borderRadius: 6 }} />
        </div>
        <div className="shimmer shimmer-bar" style={{ marginTop: 0 }} />
      </div>

      {/* Description card */}
      <div className="shimmer-card" style={{ marginBottom: 12 }}>
        <div className="shimmer" style={{ width: 60, height: 12, borderRadius: 4, marginBottom: 12 }} />
        <div className="shimmer shimmer-line w-full" />
        <div className="shimmer shimmer-line w-full" />
        <div className="shimmer shimmer-line w-80" />
        <div className="shimmer shimmer-line w-60" style={{ marginBottom: 0 }} />
      </div>

      {/* Requirements card */}
      <div className="shimmer-card" style={{ marginBottom: 12 }}>
        <div className="shimmer" style={{ width: 70, height: 12, borderRadius: 4, marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div className="shimmer" style={{ width: '35%', height: 14, borderRadius: 6 }} />
          <div className="shimmer" style={{ width: '25%', height: 14, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div className="shimmer" style={{ width: '40%', height: 14, borderRadius: 6 }} />
          <div className="shimmer" style={{ width: '20%', height: 14, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="shimmer" style={{ width: 72, height: 26, borderRadius: 100 }} />
          <div className="shimmer" style={{ width: 56, height: 26, borderRadius: 100 }} />
          <div className="shimmer" style={{ width: 64, height: 26, borderRadius: 100 }} />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <div className="shimmer" style={{ flex: 1, height: 48, borderRadius: 12 }} />
        <div className="shimmer" style={{ width: 52, height: 48, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export function InfluencerProfileShimmer() {
  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      {/* Back button */}
      <div className="shimmer" style={{ width: 110, height: 42, borderRadius: 12, marginBottom: 16 }} />

      {/* Avatar + name */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="shimmer" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px' }} />
        <div className="shimmer" style={{ width: 150, height: 22, borderRadius: 8, margin: '0 auto 8px' }} />
        <div className="shimmer" style={{ width: 100, height: 14, borderRadius: 6, margin: '0 auto 8px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <div className="shimmer" style={{ width: 90, height: 64, borderRadius: 12 }} />
          <div className="shimmer" style={{ width: 90, height: 64, borderRadius: 12 }} />
        </div>
      </div>

      {/* Bio card */}
      <div className="shimmer-card" style={{ marginBottom: 12 }}>
        <div className="shimmer" style={{ width: 30, height: 12, borderRadius: 4, marginBottom: 10 }} />
        <div className="shimmer shimmer-line w-full" />
        <div className="shimmer shimmer-line w-80" />
        <div className="shimmer shimmer-line w-60" style={{ marginBottom: 0 }} />
      </div>

      {/* Social links card */}
      <div className="shimmer-card">
        <div className="shimmer" style={{ width: 120, height: 12, borderRadius: 4, marginBottom: 14 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="shimmer" style={{ width: '30%', height: 14, borderRadius: 6 }} />
            <div className="shimmer" style={{ width: 60, height: 14, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
