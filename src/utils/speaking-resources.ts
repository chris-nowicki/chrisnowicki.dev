interface SpeakingResources {
  link?: string;
  youtube?: string;
  slidesSlug?: string;
  slidesPdf?: boolean;
}

export function getSpeakingResources(talk: SpeakingResources) {
  const resources: { label: string; href: string; download?: string }[] = [];
  const hostname = talk.link ? new URL(talk.link).hostname.toLowerCase() : "";
  const isRecording = hostname === "youtu.be" || hostname === "youtube.com" || hostname.endsWith(".youtube.com");
  if (talk.youtube || isRecording) {
    resources.push({
      label: "Watch recording",
      href: isRecording && talk.link ? talk.link : `https://www.youtube.com/watch?v=${encodeURIComponent(talk.youtube!)}`,
    });
  }
  if (talk.slidesSlug) {
    resources.push({ label: "View slides", href: `/slides/${talk.slidesSlug}/index.html` });
    if (talk.slidesPdf) {
      resources.push({ label: "Download PDF", href: `/slides/${talk.slidesSlug}/slides.pdf`, download: `${talk.slidesSlug}.pdf` });
    }
  }
  if (talk.link && !isRecording) {
    resources.push({ label: "Visit event", href: talk.link });
  }
  return resources;
}
