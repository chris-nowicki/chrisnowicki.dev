export const copyCodeButton = () => {
  const blocks = document.querySelectorAll('pre:has(code)')
  const buttonMap = new Map<HTMLButtonElement, () => Promise<void>>()

  blocks.forEach((block) => {
    if (navigator.clipboard) {
      const preBlock = block as HTMLElement
      preBlock.style.position = 'relative'

      const button = document.createElement('button')
      Object.assign(button.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        padding: '4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      })

      const copyIcon = document.createElement('span')
      copyIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`

      const checkIcon = document.createElement('span')
      checkIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`
      checkIcon.style.display = 'none'

      button.appendChild(copyIcon)
      button.appendChild(checkIcon)
      preBlock.appendChild(button)

      const handleClick = async () => {
        await copyCode(preBlock, copyIcon, checkIcon)
      }

      button.addEventListener('click', handleClick)
      buttonMap.set(button, handleClick)
    }
  })

  return () => {
    buttonMap.forEach((handler, button) => {
      button.removeEventListener('click', handler)
      button.remove()
    })
  }
}

export async function copyCode(
  block: HTMLElement,
  copyIcon: HTMLSpanElement,
  checkIcon: HTMLSpanElement
) {
  const code = block.querySelector('code')
  const text = code?.innerText

  try {
    await navigator.clipboard.writeText(text || '')

    copyIcon.style.display = 'none'
    checkIcon.style.display = 'block'

    setTimeout(() => {
      copyIcon.style.display = 'block'
      checkIcon.style.display = 'none'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}
