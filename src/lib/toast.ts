export function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return

  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none'
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  toast.className = `px-4 py-3 rounded-lg shadow-xl text-sm font-semibold pointer-events-auto transition-all duration-300 transform translate-y-4 opacity-0 flex items-center gap-2 border ${
    type === 'error'
      ? 'bg-red-950 text-red-100 border-red-800'
      : 'bg-emerald-950 text-emerald-100 border-emerald-800'
  }`

  toast.innerHTML = `
    <span>${message}</span>
  `

  container.appendChild(toast)

  // Trigger entering animation
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0')
    toast.classList.add('translate-y-0', 'opacity-100')
  }, 50)

  // Trigger leaving animation and remove
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100')
    toast.classList.add('translate-y-4', 'opacity-0')
    setTimeout(() => {
      toast.remove()
      if (container && container.childNodes.length === 0) {
        container.remove()
      }
    }, 300)
  }, 4000)
}
