import sharp from 'sharp';

function parseNumberArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return fallback;
  }

  const value = Number(process.argv[idx + 1]);
  return Number.isFinite(value) ? value : fallback;
}

function getCornerAverage(data, width, height, channels, sampleSize = 18) {
  const points = [
    [0, 0],
    [width - sampleSize, 0],
    [0, height - sampleSize],
    [width - sampleSize, height - sampleSize],
  ];

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (const [startX, startY] of points) {
    for (let y = startY; y < startY + sampleSize; y++) {
      for (let x = startX; x < startX + sampleSize; x++) {
        const idx = (y * width + x) * channels;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
        count += 1;
      }
    }
  }

  return {
    r: totalR / count,
    g: totalG / count,
    b: totalB / count,
  };
}

function colorDistanceSq(r, g, b, bg) {
  const dr = r - bg.r;
  const dg = g - bg.g;
  const db = b - bg.b;
  return dr * dr + dg * dg + db * db;
}

function smoothAlphaEdges(data, width, height, channels, radius = 1) {
  if (radius <= 0) {
    return;
  }

  const source = Buffer.from(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * channels + 3;
      const alpha = source[idx];

      if (alpha === 0 || alpha === 255) {
        continue;
      }

      let sum = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * channels + 3;
          sum += source[nIdx];
          count += 1;
        }
      }

      data[idx] = Math.round(sum / count);
    }
  }
}

async function removeBackground(inputPath, outputPath, threshold = 36, softRange = 34, alphaSmooth = 1) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const bg = getCornerAverage(data, width, height, channels);

  const hardSq = threshold * threshold;
  const softSq = (threshold + softRange) * (threshold + softRange);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alphaIndex = i + 3;
    const d2 = colorDistanceSq(r, g, b, bg);

    if (d2 <= hardSq) {
      data[alphaIndex] = 0;
      continue;
    }

    if (d2 <= softSq) {
      const t = (Math.sqrt(d2) - threshold) / softRange;
      const eased = Math.max(0, Math.min(1, t));
      data[alphaIndex] = Math.round(255 * eased);
    }
  }

  smoothAlphaEdges(data, width, height, channels, alphaSmooth);

  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png({ quality: 100 })
    .toFile(outputPath);
}

async function main() {
  const input = process.argv[2];
  const output = process.argv[3];
  const threshold = parseNumberArg('--threshold', 36);
  const softRange = parseNumberArg('--soft-range', 34);
  const alphaSmooth = parseNumberArg('--alpha-smooth', 1);

  if (!input || !output) {
    console.error('Usage: node scripts/remove-background.mjs <input-image> <output-png> [--threshold N] [--soft-range N] [--alpha-smooth N]');
    process.exit(1);
  }

  try {
    await removeBackground(input, output, threshold, softRange, alphaSmooth);
    console.log(`Background removed: ${output}`);
  } catch (error) {
    console.error('Failed to remove background:', error.message);
    process.exit(1);
  }
}

main();
