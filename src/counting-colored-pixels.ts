import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'

const file = await fs.readFile(path.resolve('public', 'traffic-tile.png'))
const image = sharp(file)

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace('#', ''), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const colors = ['#63D668', '#FF974D', '#F23C32', '#811F1F'].map(hexToRgb)

type GetColorCountsOptions = {
  image: sharp.Sharp
  threshold?: number
  colors: Array<ReturnType<typeof hexToRgb>>
}

async function getColorCounts({ image, threshold = 25, colors }: GetColorCountsOptions) {
  // Get the raw pixel data from the image where each pixel is represented by 4 bytes (r, g, b, a)
  const { data } = await image.raw().toBuffer({ resolveWithObject: true })

  // Iterate over each pixel and count the number of pixels close to each color
  const counts = Array.from({ length: colors.length }, () => 0)

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = data.subarray(i, i + 3)

    for (let j = 0; j < colors.length; j++) {
      const color = colors[j]!

      if (
        Math.abs(r! - color.r) <= threshold &&
        Math.abs(g! - color.g) <= threshold &&
        Math.abs(b! - color.b) <= threshold
      ) {
        counts[j]++
        // We found a match, no need to check the other colors
        break
      }
    }
  }

  return counts
}

const counts = await getColorCounts({ image, colors })
console.log(counts)
