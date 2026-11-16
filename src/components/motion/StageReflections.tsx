/** Light only. The approved raster architecture remains the source of geometry. */
export function StageReflections() {
  return (
    <div aria-hidden="true" className="sx-stage-reflections">
      <div className="sx-portal-reflection" />
      <div className="sx-pedestal-reflection" />
    </div>
  );
}
