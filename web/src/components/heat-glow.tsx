/** Full-page backdrop of blurred blobs in the heatmap's three colours. */
export function HeatGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-heat-cool">
      <div className="absolute -top-[20%] -right-[10%] size-[55vmax] rounded-full bg-[#5b86e5] blur-[120px]" />
      <div className="absolute -bottom-[25%] -left-[15%] size-[60vmax] rounded-full bg-heat-hot blur-[140px]" />
      <div className="absolute -right-[20%] -bottom-[30%] size-[60vmax] rounded-full bg-heat-mid blur-[140px]" />
      <div className="absolute bottom-[-35%] left-[35%] size-[40vmax] rounded-full bg-heat-hot/80 blur-[120px]" />
    </div>
  );
}
