<script lang="ts">
  import { cn } from '@/utils/utils'
  import { navLinks } from '@/lib/site'
  import { onMount } from 'svelte'
  import MobileMenu from './MobileMenu.svelte'

  let isOpen = false
  let pathname = ''

  onMount(() => {
    pathname = window.location.pathname.split('/')[1]

    return () => {
      document.body.style.overflow = ''
    }
  })

  function toggleMenu() {
    isOpen = !isOpen
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }

  function closeMenu() {
    isOpen = false
    document.body.style.overflow = ''
  }
</script>

<div
  class="top-6 left-0 right-0 w-full flex justify-center items-center pl-4 pr-6 mt-8"
>
  <nav
    class={cn(
      'text-muted-foreground flex items-center justify-between rounded-full w-full max-w-4xl bg-white',
      isOpen ? 'rounded-b-none border-b-0 shadow-none' : 'shadow-none'
    )}
    style="transition: background-color 0.3s, box-shadow 0.3s, border-radius 0.3s;"
  >
    <a
      href="/"
      class="font-cursive rounded-full border px-2 py-1 transition-all duration-100 text-2xl text-blue-600 border-blue-600 hover:shadow-lg hover:-rotate-10 ease-in-out hover:scale-105"
    >
      CN
    </a>

    <ul
      class="hidden list-none gap-4 text-lg md:flex border rounded-full px-4 py-2"
      aria-label="Desktop navigation"
    >
      {#each navLinks as { href, text }}
        {@const isActive = text === pathname}
        <li>
          <a
            {href}
            class={cn(
              'group hover:text-blue-600 transition-colors duration-200 ease-in-out',
              isActive ? 'text-blue-600' : 'text-black'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {text}
          </a>
        </li>
      {/each}
    </ul>
    <button
      class="hamburger flex justify-center md:hidden"
      on:click={toggleMenu}
      aria-label="Toggle mobile menu"
      aria-expanded={isOpen}
    >
      <div class="relative flex flex-col justify-between w-8 h-6">
        <span
          class={cn(
            'h-0.5 w-full bg-black absolute transition-all duration-300',
            isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
          )}
        ></span>
        <span
          class={cn(
            'h-0.5 w-full bg-black absolute top-1/2 -translate-y-1/2 transition-all duration-300',
            isOpen ? 'opacity-0' : 'opacity-100'
          )}
        ></span>
        <span
          class={cn(
            'h-0.5 w-full bg-black absolute transition-all duration-300',
            isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
          )}
        ></span>
      </div>
    </button>
  </nav>
</div>

<MobileMenu {isOpen} onClose={closeMenu} />
