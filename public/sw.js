// SystemMK PWA Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Listen for push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'SystemMK - ដំណឹងវត្តអារាម',
    body: 'មានដំណឹងថ្មីពីវត្តអារាម!',
    icon: '/app-logo.png',
    badge: '/app-logo.png',
    url: '/dashboard'
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      data = { ...data, ...payload }
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/app-logo.png',
    badge: data.badge || '/app-logo.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'open', title: 'បើកមើល / View' },
      { action: 'close', title: 'បិទ / Close' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification Click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
