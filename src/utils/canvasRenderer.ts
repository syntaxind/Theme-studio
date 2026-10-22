import { ThemeConfig } from '../types/theme';

/**
 * Converts an image or SVG data URL to a genuine JPEG/PNG Blob using HTML5 Canvas
 */
export async function renderDataUriToRasterBlob(
  dataUri: string,
  width: number = 1080,
  height: number = 2400,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // Fill background with dark base
        ctx.fillStyle = '#0a0b0d';
        ctx.fillRect(0, 0, width, height);

        // Draw image stretched to full resolution
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create Blob from canvas'));
            }
          },
          format,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      // Fallback: create solid dark canvas if image load fails
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Fallback failed'))), format, quality);
    };
    img.src = dataUri;
  });
}

/**
 * Generates an authentic 192x192 PNG icon for Xiaomi HyperOS icons archive
 */
export function generateRealAppIconPng(
  shape: string,
  style: string,
  accentColor: string,
  appLabel: string,
  category: string,
  customIconDataUrl?: string
): Promise<Blob> {
  return new Promise((resolve) => {
    const size = 192;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // If custom image is provided, draw it directly or clipped
    if (customIconDataUrl) {
      const customImg = new Image();
      customImg.crossOrigin = 'anonymous';
      customImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        const pad = 12;
        const innerSize = size - pad * 2;
        if (shape === 'chamfer') {
          const c = 32;
          ctx.moveTo(pad + c, pad);
          ctx.lineTo(size - pad - c, pad);
          ctx.lineTo(size - pad, pad + c);
          ctx.lineTo(size - pad, size - pad - c);
          ctx.lineTo(size - pad - c, size - pad);
          ctx.lineTo(pad + c, size - pad);
          ctx.lineTo(pad, size - pad - c);
          ctx.lineTo(pad, pad + c);
          ctx.closePath();
        } else if (shape === 'hexagon') {
          const cx = size / 2;
          const cy = size / 2;
          const r = innerSize / 2;
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        } else if (shape === 'round') {
          ctx.arc(size / 2, size / 2, innerSize / 2, 0, Math.PI * 2);
        } else {
          ctx.roundRect(pad, pad, innerSize, innerSize, 42);
        }
        ctx.clip();
        ctx.drawImage(customImg, 0, 0, size, size);
        ctx.restore();

        canvas.toBlob((blob) => resolve(blob || new Blob([])), 'image/png');
      };
      customImg.onerror = () => {
        // Fallback to procedural
        generateProcedural();
      };
      customImg.src = customIconDataUrl;
      return;
    }

    generateProcedural();

    function generateProcedural() {
      // 1. Draw shape path
      ctx.save();
      ctx.beginPath();
      const pad = 12;
      const innerSize = size - pad * 2;

    if (shape === 'chamfer') {
      // Mecha chamfered 8-sided polygon
      const c = 32;
      ctx.moveTo(pad + c, pad);
      ctx.lineTo(size - pad - c, pad);
      ctx.lineTo(size - pad, pad + c);
      ctx.lineTo(size - pad, size - pad - c);
      ctx.lineTo(size - pad - c, size - pad);
      ctx.lineTo(pad + c, size - pad);
      ctx.lineTo(pad, size - pad - c);
      ctx.lineTo(pad, pad + c);
      ctx.closePath();
    } else if (shape === 'hexagon') {
      // Hexagon
      const cx = size / 2;
      const cy = size / 2;
      const r = innerSize / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (shape === 'round') {
      // Circle
      ctx.arc(size / 2, size / 2, innerSize / 2, 0, Math.PI * 2);
    } else {
      // Squircle / rounded rect (HyperOS default)
      const rad = 42;
      ctx.roundRect(pad, pad, innerSize, innerSize, rad);
    }

    ctx.clip();

    // 2. Background styling
    if (style === 'mecha_outline') {
      ctx.fillStyle = '#0f141c';
      ctx.fillRect(0, 0, size, size);
      // Subtle carbon/grid lines
      ctx.strokeStyle = '#1e2634';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad + 10, pad + 10, innerSize - 20, innerSize - 20);
    } else if (style === 'neon_cyber') {
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, size, size);
      const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, innerSize / 2);
      grad.addColorStop(0, `${accentColor}33`);
      grad.addColorStop(1, '#05070c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    } else if (style === 'minimal_white') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, size, size);
    } else {
      // Hyper Color gradient
      const grad = ctx.createLinearGradient(pad, pad, size - pad, size - pad);
      if (category === 'social') {
        grad.addColorStop(0, '#22c55e');
        grad.addColorStop(1, '#15803d');
      } else if (category === 'media') {
        grad.addColorStop(0, '#f43f5e');
        grad.addColorStop(1, '#be123c');
      } else if (category === 'system') {
        grad.addColorStop(0, '#0ea5e9');
        grad.addColorStop(1, '#0369a1');
      } else {
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#b45309');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    // 3. Border accent stroke
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = style === 'hyper_color' ? 'rgba(255,255,255,0.2)' : accentColor;
    if (shape === 'round') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (size - pad * 2) / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === 'chamfer') {
      const c = 32;
      ctx.beginPath();
      ctx.moveTo(pad + c, pad);
      ctx.lineTo(size - pad - c, pad);
      ctx.lineTo(size - pad, pad + c);
      ctx.lineTo(size - pad, size - pad - c);
      ctx.lineTo(size - pad - c, size - pad);
      ctx.lineTo(pad + c, size - pad);
      ctx.lineTo(pad, size - pad - c);
      ctx.lineTo(pad, pad + c);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, 42);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Draw Center Icon Initial or Glyph
    ctx.save();
    ctx.fillStyle = style === 'hyper_color' ? '#ffffff' : accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 64px -apple-system, sans-serif';

    // Get First 1-2 letters of app name
    const glyphText = appLabel.slice(0, 2).toUpperCase();
    ctx.fillText(glyphText, size / 2, size / 2 + 4);
    ctx.restore();

      canvas.toBlob((blob) => {
        resolve(blob || new Blob([]));
      }, 'image/png');
    }
  });
}
