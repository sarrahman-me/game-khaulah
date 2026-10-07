let renderCapture: (() => HTMLCanvasElement) | undefined;

export function registerPhotoCapture(capture: () => HTMLCanvasElement): () => void {
  renderCapture = capture;
  return () => { if (renderCapture === capture) renderCapture = undefined; };
}

/** Render and copy synchronously, before WebGL discards its drawing buffer. */
export function capturePhoto(caption: string, stamp: string, filter: string): string {
  if (!renderCapture) throw new Error('Kamera belum siap. Coba lagi sebentar.');
  const source = renderCapture();
  const output = document.createElement('canvas');
  const margin = Math.round(source.width * 0.035);
  const footer = Math.max(70, Math.round(source.height * 0.12));
  output.width = source.width + margin * 2;
  output.height = source.height + margin * 2 + footer;
  const context = output.getContext('2d');
  if (!context) throw new Error('Foto tidak bisa dibuat di perangkat ini.');
  context.fillStyle = '#fffaf5';
  context.fillRect(0, 0, output.width, output.height);
  context.filter = filter === 'warm' ? 'sepia(0.3) saturate(1.15)' : filter === 'rose' ? 'sepia(0.15) hue-rotate(315deg) saturate(1.2)' : 'none';
  context.drawImage(source, margin, margin);
  context.filter = 'none';
  if (stamp !== 'none') {
    context.font = `${Math.round(source.width * 0.06)}px sans-serif`;
    context.textAlign = 'right';
    context.fillText(stamp, output.width - margin * 2, margin * 3);
  }
  context.fillStyle = '#374151';
  context.textAlign = 'center';
  context.font = `${Math.min(32, footer * 0.4)}px sans-serif`;
  context.fillText(caption, output.width / 2, output.height - margin - footer * 0.35, source.width);
  return output.toDataURL('image/png');
}
