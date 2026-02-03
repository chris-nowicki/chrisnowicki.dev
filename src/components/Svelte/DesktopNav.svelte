<script lang="ts">
  import { cn } from '@/utils/utils'
  import { onMount } from 'svelte'

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

    // Wait for animation, then navigate
    setTimeout(() => {
      window.location.href = href
    }, 200)

    event.preventDefault()
  }

  onMount(() => {
    // Position instantly on mount (no transition)
    updatePillPosition()
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
    {@const isActive = pathname === text.toLowerCase()}
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
