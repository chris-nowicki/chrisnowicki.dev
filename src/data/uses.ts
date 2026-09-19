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
    title: 'Aiden Brewer',
    description: 'Brew the best coffee at home with ease and precision—no barista skills needed.',
    imageSrc: '/uses/aiden-brewer.webp',
    link: 'https://fellowproducts.com/products/aiden-precision-coffee-maker',
  },
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
    title: 'CleanShot X',
    description: 'Advanced screenshot and screen recording tool',
    imageSrc: '/icons/cleanshotx.png',
    link: 'https://cleanshot.com/',
  },
  {
    title: 'Claude',
    description: 'AI assistant for writing, research, and coding',
    imageSrc: '/icons/claude.png',
    link: 'https://claude.ai/',
  },
  {
    title: 'Codex',
    description: 'AI coding agent for building and reviewing software',
    imageSrc: '/icons/codex.png',
    link: 'https://openai.com/codex/',
  },
  {
    title: 'Ghostty',
    description: 'Fast, GPU-accelerated terminal with a native interface',
    imageSrc: '/icons/ghostty.png',
    link: 'https://ghostty.org/',
  },
  {
    title: 'Herdr',
    description: 'Terminal workspace for managing multiple AI coding agents',
    imageSrc: '/icons/herdr.png',
    link: 'https://herdr.dev/',
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
]

export const hardwareData: HardwareDataItem[] = [
  {
    title: '16" MacBook Pro M1 Max',
    description: 'Apple M1 Max, 64GB RAM, 2TB SSD',
    link: 'https://www.apple.com/shop/buy-mac/macbook-pro/16-inch-m3-max',
  },
  {
    title: 'LG 34" UltraWide Ergo Monitor',
    description: '34WN780-B ultrawide QHD display with an adjustable Ergo arm',
    link: 'https://www.lg.com/us/monitors/lg-34wn780-b-ultrawide-monitor',
  },
  {
    title: 'CalDigit TS4 Docking Station',
    description: 'Thunderbolt 4 dock with 18 ports',
    link: 'https://amzn.to/4aNQvvX',
  },
  {
    title: 'Uplift V2 Standing Desk',
    description: 'Adjustable height standing desk',
    link: 'https://www.upliftdesk.com',
  },
  {
    title: 'Apple Magic Keyboard with Touch ID',
    description: 'Compact wireless keyboard with Touch ID and Lightning charging',
    link: 'https://www.bhphotovideo.com/c/product/1658216-REG/apple_mk293ll_a_magic_keyboard_with_touch.html',
  },
  {
    title: 'Logitech MX Master 4 for Mac',
    description: 'Wireless ergonomic mouse with haptic feedback',
    link: 'https://www.logitech.com/en-us/shop/p/mx-master-4-mac',
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
  {
    title: 'ai-tooling',
    description: 'agents, commands, and tools for AI-powered development',
    link: 'https://github.com/chris-nowicki/ai-tooling',
  },
  {
    title: 'chrisnowicki.dev',
    description: 'My personal website and blog',
    link: 'https://github.com/chris-nowicki/chrisnowicki.dev',
  },
]
