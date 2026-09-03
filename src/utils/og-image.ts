import { getCldOgImageUrl } from 'astro-cloudinary/helpers'

import { formatCloudinaryText } from './cloudinary-text'

type CropMode = 'fit'

interface OverlayPosition {
  x: number
  y: number
  gravity: string
}

interface OverlayText {
  color: string
  fontFamily: string
  fontSize: number
  letterSpacing?: number
  text: string
}

interface Overlay {
  position: OverlayPosition
  text: OverlayText
  width?: number
  crop?: CropMode
}

const publicId = 'portfolio/og-template'

interface GenerateOgImageUrlProps {
  header: string
  description: string
  supportingText?: string
  readTime?: string
}

const generateOgImageUrl = ({
  header,
  description,
  supportingText,
  readTime,
}: GenerateOgImageUrlProps): string => {
  const formattedDescription = formatCloudinaryText(description)
  const formattedSupportingText = supportingText
    ? formatCloudinaryText(supportingText)
    : undefined

  const baseOverlays: Overlay[] = [
    {
      position: {
        x: 100,
        y: 80,
        gravity: 'north_west',
      },
      text: {
        color: 'black',
        fontFamily: 'Geist-Bold.ttf',
        fontSize: 100,
        text: header,
      },
    },
    {
      width: 1000,
      crop: 'fit',
      position: {
        x: 100,
        y: 190,
        gravity: 'north_west',
      },
      text: {
        color: 'black',
        fontFamily: 'Geist-Regular.ttf',
        fontSize: 65,
        letterSpacing: -0.05,
        text: formattedDescription,
      },
    }
  ]

  const overlays: Overlay[] = [...baseOverlays]

  if (formattedSupportingText) {
    overlays.push({
      width: 1000,
      crop: 'fit',
      position: {
        x: 100,
        y: 350,
        gravity: 'north_west',
      },
      text: {
        color: 'black',
        fontFamily: 'Geist-Regular.ttf',
        fontSize: 34,
        letterSpacing: -0.05,
        text: formattedSupportingText,
      },
    })
  }

  if (readTime) {
    overlays.push({
      position: {
        x: 205,
        y: 490,
        gravity: 'north_west',
      },
      text: {
        color: 'black',
        fontFamily: 'Geist-Regular.ttf',
        fontSize: 35,
        text: readTime,
      },
    })
  }

  return getCldOgImageUrl({
    src: publicId,
    width: 1200,
    height: 630,
    format: 'jpg',
    quality: 'auto',
    overlays,
  })
}

export default generateOgImageUrl