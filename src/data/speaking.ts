export type speakingDataItem = {
  date: string,
  title: string,
  description: string,
  category: string[],
  link: string
}

export const speakingData: speakingDataItem[] = [
   {
    "date": "2023-08-30",
    "title": "The Complexity of ADHD Treatment",
    "description": "Guest appearance on the SuccessFULL ADHD Podcast",
    "category": ["Podcast"],
    "link": "https://youtu.be/P4aMxBWwLD0"
  },
  {
    "date": "2024-02-14",
    "title": "How to Improve Your Home WiFi Speeds",
    "description": "Lunch & Learn with the Virtual Coffee Community",
    "category": ["Community"],
    "link": "https://youtu.be/ZSMU5Avf-T0"
  },
  {
    "date": "2024-05-08",
    "title": "Maintaining a Community Led Dev Project",
    "description": "Guest appearance on the Compressed.fm podcast",
    "category": ["Podcast"],
    "link": "https://youtu.be/eM3G5EPtu8c"
  },
  {
    "date": "2024-08-05",
    "title": "A Framework to a better YOU in the world of productivity",
    "description": "Talk from THAT Conference 2024",
    "category": ["Conference"],
    "link": "https://youtu.be/LYPqcfP-7cA"
  }
]
