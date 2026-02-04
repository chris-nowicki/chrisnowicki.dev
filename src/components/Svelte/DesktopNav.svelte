<script lang="ts">
  import { cn } from '@/utils/utils'
  import { onMount, onDestroy } from 'svelte'

  interface NavLink {
    href: string
    text: string
  }

  interface Props {
    navLinks: NavLink[]
    pathname: string
  }

  let { navLinks, pathname }: Props = $props()

  let navRef: HTMLElement | undefined
  let pillStyle = $state({ left: 0, width: 0, opacity: 0 })
  let enableTransition = $state(false)
  let currentPathname = $state(pathname)

  function movePillToElement(element: HTMLElement) {
    if (!navRef) return
    const navRect = navRef.getBoundingClientRect()
    const linkRect = element.getBoundingClientRect()
    pillStyle = {
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
    }
  }

  function updatePillPosition() {
    if (!navRef) return
    const activeLink = navRef.querySelector('[aria-current="page"]') as HTMLElement
    if (activeLink) {
      movePillToElement(activeLink)
    } else {
      pillStyle = { left: 0, width: 0, opacity: 0 }
    }
  }

  function handleClick(event: MouseEvent, href: string) {
    const target = event.currentTarget as HTMLElement
    enableTransition = true
    movePillToElement(target)
    // Update current pathname immediately for instant visual feedback
    currentPathname = href.split('/')[1] || ''
  }

  function handlePageLoad() {
    // Update pathname from current URL
    currentPathname = window.location.pathname.split('/')[1] || ''
    // Reset transition state and update pill position
    enableTransition = false
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      updatePillPosition()
    })
  }

  onMount(() => {
    // Position instantly on mount (no transition)
    updatePillPosition()

    // Listen for Astro View Transitions page load
    document.addEventListener('astro:page-load', handlePageLoad)
  })

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('astro:page-load', handlePageLoad)
    }
  })
</script>

<ul
  bind:this={navRef}
  class="relative hidden list-none gap-1 px-4 py-2 text-base md:flex"
  aria-label="Desktop navigation"
>
  <!-- Sliding pill indicator -->
  <span
    class={cn(
      'absolute top-1/2 h-8 -translate-y-1/2 rounded-full border border-dashed border-slate-400',
      enableTransition && 'transition-all duration-300 ease-out'
    )}
    style="left: {pillStyle.left}px; width: {pillStyle.width}px; opacity: {pillStyle.opacity}"
  />

  {#each navLinks as { href, text }}
    {@const isActive = currentPathname === text.toLowerCase()}
    <li>
      <a
        {href}
        class={cn(
          'relative z-10 block px-3 py-1 font-medium tracking-wide transition-colors duration-200',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
        aria-current={isActive ? 'page' : undefined}
        onclick={(e) => handleClick(e, href)}
      >
        {text}
      </a>
    </li>
  {/each}
</ul>
