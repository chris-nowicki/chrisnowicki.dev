import { getCldOgImageUrl } from "astro-cloudinary/helpers";

import { formatCloudinaryText } from "./cloudinary-text";

interface GenerateOgImageUrlProps {
  header: string;
  description: string;
  supportingText?: string;
  readTime?: string;
}

const generateOgImageUrl = ({
  header,
  description,
  readTime,
}: GenerateOgImageUrlProps): string => {
  const textLayer = (
    text: string,
    fontSize: number,
    y: number,
    color: string,
    bold = false,
  ) => ({
    width: 1040,
    crop: "fit" as const,
    position: { x: 80, y, gravity: "north_west" },
    text: {
      color,
      fontFamily: bold ? "Geist-Bold.ttf" : "Geist-Regular.ttf",
      fontSize,
      text: formatCloudinaryText(text),
    },
  });

  return getCldOgImageUrl({
    src: "portfolio/og-template",
    width: 1200,
    height: 630,
    format: "jpg",
    quality: "auto",
    // Reuse the existing hosted asset as a flat canvas; no upload is required.
    rawTransformations: [
      "co_rgb:ffffff,e_colorize:100",
      "l_portfolio:og-template/c_scale,w_310,h_48/co_rgb:fce0f1,e_colorize:100/fl_layer_apply,g_north_west,x_72,y_72",
    ],
    overlays: [
      textLayer(header.replace(/^\//, ""), 26, 78, "rgb:171717", true),
      textLayer(
        description,
        description.length > 85 ? 54 : 64,
        190,
        "rgb:171717",
        true,
      ),
      textLayer(
        `Chris Nowicki  ·  chrisnowicki.dev${readTime ? `  ·  ${readTime}` : ""}`,
        24,
        535,
        "rgb:666666",
      ),
    ],
  });
};

export default generateOgImageUrl;
