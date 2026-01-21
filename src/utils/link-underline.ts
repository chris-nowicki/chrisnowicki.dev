/**
 * Initializes direction-aware underline animations for elements with the
 * `link-underline` class. Detects mouse entry/exit direction and sets a
 * data attribute that CSS uses to animate the underline accordingly.
 */
export const initLinkUnderline = () => {
  const links = document.querySelectorAll<HTMLElement>('.link-underline')
  const handlers: {
    element: HTMLElement
    enter: (e: MouseEvent) => void
    leave: (e: MouseEvent) => void
  }[] = []

  links.forEach((link) => {
    const handleMouseEnter = (e: MouseEvent) => {
      const rect = link.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const direction = e.clientX < centerX ? 'left' : 'right'
      link.dataset.direction = direction
    }

    const handleMouseLeave = (e: MouseEvent) => {
      const rect = link.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const direction = e.clientX < centerX ? 'left' : 'right'
      link.dataset.direction = direction
    }

    link.addEventListener('mouseenter', handleMouseEnter)
    link.addEventListener('mouseleave', handleMouseLeave)

    handlers.push({
      element: link,
      enter: handleMouseEnter,
      leave: handleMouseLeave,
    })
  })

  // Return cleanup function
  return () => {
    handlers.forEach(({ element, enter, leave }) => {
      element.removeEventListener('mouseenter', enter)
      element.removeEventListener('mouseleave', leave)
      delete element.dataset.direction
    })
  }
}
