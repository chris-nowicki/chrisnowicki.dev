type CoffeeDataItem = {
  title: string
  description: string
  imageSrc: string
  link: string
}

type SoftwareDataItem = {
  title: string
  description: string
  imageSrc: string
  link: string
}

type HardwareDataItem = {
  title: string
  description: string
  link: string
}

type GitHubDataItem = {
  title: string
  description: string
  link: string
}

export const coffeeData: CoffeeDataItem[] = [
  {
    title: 'Fellow Ode Brew Grinder',
    description: 'Burr coffee grinder for precise grind size',
    imageSrc: '/uses/ode-brew-grinder.webp',
    link: 'https://fellowproducts.com/products/ode-brew-grinder-gen-2',
  },
  {
    title: 'Fellow Stagg EKG',
    description: 'Electric pour-over kettle with temperature control',
    imageSrc: '/uses/fellow-stagg-kettle.webp',
    link: 'https://fellowproducts.com/products/stagg-ekg-electric-pour-over-kettle?variant=18635551080563',
  },
  {
    title: 'Chemex',
    description: 'Classic pour-over coffee maker',
    imageSrc: '/uses/chemex.webp',
    link: 'https://chemexcoffeemaker.com/products/six-cup-classic-chemex',
  },
]
export const softwareData: SoftwareDataItem[] = [
  {
    title: '1Password',
    description: 'Password manager and secure digital vault',
    imageSrc: '/icons/1password.png',
    link: 'https://1password.com/',
  },
  {
    title: 'AltTab',
    description: 'Windows-style alt-tab window switcher for macOS',
    imageSrc: '/icons/alttab.png',
    link: 'https://alt-tab-macos.netlify.app/',
  },
  {
    title: 'Bear Notes',
    description: 'Beautiful, flexible writing app for notes and prose',
    imageSrc: '/icons/bear.png',
    link: 'https://bear.app/',
  },
  {
    title: 'CleanShot X',
    description: 'Advanced screenshot and screen recording tool',
    imageSrc: '/icons/cleanshotx.png',
    link: 'https://cleanshot.com/',
  },
  {
    title: 'Cursor',
    description: 'AI-powered code editor built on VS Code',
    imageSrc: '/icons/cursor.png',
    link: 'https://cursor.com',
  },
  {
    title: 'Obsidian',
    description: 'Knowledge base and note-taking app with markdown',
    imageSrc: '/icons/obsidian.png',
    link: 'https://obsidian.md/',
  },
  {
    title: 'Postman',
    description: 'API platform for building and testing APIs',
    imageSrc: '/icons/postman.png',
    link: 'https://www.postman.com/',
  },
  {
    title: 'RayCast',
    description: 'Blazingly fast launcher and productivity tool',
    imageSrc: '/icons/raycast.png',
    link: 'https://www.raycast.com/',
  },
  {
    title: 'VS Code',
    description: 'Powerful, extensible code editor',
    imageSrc: '/icons/vscode.png',
    link: 'https://code.visualstudio.com/',
  },
  {
    title: 'Wezterm',
    description: 'GPU-accelerated cross-platform terminal emulator',
    imageSrc: '/icons/wezterm.png',
    link: 'https://wezterm.org',
  },
]

export const hardwareData: HardwareDataItem[] = [
  {
    title: '16" MacBook Pro M1 Max',
    description: 'Apple M1 Max, 64GB RAM, 2TB SSD',
    link: 'https://www.apple.com/shop/buy-mac/macbook-pro/16-inch-m3-max',
  },
  {
    title: 'BenQ 28" Programming Monitor',
    description: 'Eye-care monitor optimized for coding',
    link: 'https://a.co/d/aGNavya',
  },
  {
    title: 'CalDigit TS4 Docking Station',
    description: 'Thunderbolt 4 dock with 18 ports',
    link: 'https://amzn.to/4aNQvvX',
  },
  {
    title: 'LG 28" DualUp Monitor',
    description: 'Unique 16:18 aspect ratio vertical display',
    link: 'https://amzn.to/3Uef9iq',
  },
  {
    title: 'Uplift V2 Standing Desk',
    description: 'Adjustable height standing desk',
    link: 'https://www.upliftdesk.com',
  },
  {
    title: 'ZSA Voyager Keyboard',
    description: 'Split ergonomic mechanical keyboard',
    link: 'https://www.zsa.io/voyager',
  },
  {
    title: 'Audio Technica M50x Headphones',
    description: 'Professional studio monitor headphones',
    link: 'https://a.co/d/iFt6BE7',
  },
  {
    title: 'Cloudlifter Preamp',
    description: 'Microphone signal booster and preamp',
    link: 'https://amzn.to/3Wgo2dP',
  },
  {
    title: 'Elgato Cam Link 4K',
    description: 'Capture device for DSLR streaming',
    link: 'https://amzn.to/4aQ1mpn',
  },
  {
    title: 'Elgato Key Light Air',
    description: 'LED panel light for streaming and video',
    link: 'https://amzn.to/3WjETfR',
  },
  {
    title: 'Elgato Stream Deck+',
    description: 'Customizable control panel with dials',
    link: 'https://amzn.to/3w8LUW7',
  },
  {
    title: 'Focusrite Scarlett Solo 4th Gen',
    description: 'USB audio interface for recording',
    link: 'https://amzn.to/4bcC0lm',
  },
  {
    title: 'RØDE PodMic',
    description: 'Dynamic broadcast microphone',
    link: 'https://amzn.to/3UB7A6V',
  },
  {
    title: 'RØDE PSA1+ Studio Arm',
    description: 'Professional microphone boom arm',
    link: 'https://amzn.to/3Uhbwbj',
  },
  {
    title: 'Sigma 16MM f/1.4 Lens',
    description: 'Wide-angle lens for Sony E-mount',
    link: 'https://amzn.to/3WynL6r',
  },
  {
    title: 'Sony A6600 AC Adapter',
    description: 'Dummy battery and AC power adapter',
    link: 'https://amzn.to/3QlGT3r',
  },
  {
    title: 'Sony A6600 Mirrorless Camera',
    description: 'APS-C mirrorless camera for streaming',
    link: 'https://amzn.to/4aN3xda',
  },
]

export const gitHubData: GitHubDataItem[] = [
  {
    title: 'mac-setup',
    description: 'scripts to automate my Mac configuration',
    link: 'https://github.com/chris-nowicki/mac-setup',
  },
  {
    title: 'dotfiles',
    description: 'configuration files for terminal, editors, and dev tools',
    link: 'https://github.com/chris-nowicki/dotfiles',
  },
]