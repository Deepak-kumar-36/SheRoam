// Simulated artificial delay for realism
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getLocalItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

const setLocalItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const mockApi = {
  auth: {
    async getSession() {
      await delay(300)
      const user = getLocalItem('sheroam_user', null)
      return { session: user ? { user } : null }
    },
    async signIn(email, password) {
      await delay(800) // fake network
      if (!email || !password) throw new Error('Missing credentials')
      const user = {
        id: '123-abc',
        email,
        name: 'Anika R.',
        city: 'Paris',
        initials: 'AR',
        tripDates: 'Apr 24–28',
      }
      setLocalItem('sheroam_user', user)
      return { user }
    },
    async signOut() {
      await delay(400)
      localStorage.removeItem('sheroam_user')
    }
  },

  db: {
    async getPosts() {
      await delay(500)
      const cached = getLocalItem('sheroam_posts', null)
      if (cached) return cached

      // Seed initial posts if none exist
      const INITIAL_POSTS = [
        { id: 1, category: 'safety', catLabel: 'Safety Tips', author: 'Priya S.', initials: 'PS', color: '#7C3AED', time: '2h ago', title: 'Staying safe in Montmartre at night', content: 'Avoid the alleys behind Sacré-Cœur after 11 PM. Stick to the main lit streets!', likes: 45, comments: 12, liked: false, bookmarked: false },
        { id: 2, category: 'stays', catLabel: 'SheStays', author: 'Elena M.', initials: 'EM', color: '#EC4899', time: '5h ago', title: 'Hotel Bella Vienna - Highly Recommend!', content: 'Incredible staff. They have a female-only floor and keycard-controlled elevators. Felt 100% safe.', likes: 112, comments: 24, liked: true, bookmarked: true },
        { id: 3, category: 'routes', catLabel: 'Routes', author: 'Chloe T.', initials: 'CT', color: '#10B981', time: '1d ago', title: 'Safe jogging route near Eiffel Tower?', content: 'Does anyone have a good route for an early morning run near the 7th arrondissement?', likes: 18, comments: 5, liked: false, bookmarked: false },
      ]
      setLocalItem('sheroam_posts', INITIAL_POSTS)
      return INITIAL_POSTS
    },

    async createPost(post) {
      await delay(600)
      const posts = await this.getPosts()
      const newPost = {
        id: Date.now(),
        ...post,
        time: 'Just now',
        likes: 0,
        comments: 0,
        liked: false,
        bookmarked: false,
      }
      const updated = [newPost, ...posts]
      setLocalItem('sheroam_posts', updated)
      return newPost
    },

    async toggleLike(postId) {
      const posts = await this.getPosts()
      const updated = posts.map(p => {
        if (p.id === postId) {
          return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        }
        return p
      })
      setLocalItem('sheroam_posts', updated)
      return updated
    }
  },

  chat: {
    async getChatHistory(buddyId) {
      await delay(300)
      const key = `sheroam_chat_${buddyId}`
      const cached = getLocalItem(key, null)
      if (cached) return cached
      
      const defaultHistory = [
        { id: 1, text: 'Hi! I saw your profile — we have the same travel dates!', sent: false },
        { id: 2, text: "Hey! Yes, I'm in Le Marais right now. Are you close?", sent: true }
      ]
      setLocalItem(key, defaultHistory)
      return defaultHistory
    },

    async sendMessage(buddyId, text) {
      await delay(200)
      const key = `sheroam_chat_${buddyId}`
      const history = await this.getChatHistory(buddyId)
      
      const newMsg = { id: Date.now(), text, sent: true }
      const updated = [...history, newMsg]
      setLocalItem(key, updated)

      // Simulate a background reply coming in 2-3 seconds later
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          text: "I read you loud and clear. Let's arrange a time!",
          sent: false
        }
        const currentHistory = getLocalItem(key, [])
        setLocalItem(key, [...currentHistory, reply])
      }, 2500)

      return updated
    }
  },

  sos: {
    async sendAlert(contacts, onProgress) {
      // Simulate real-world alerting delays with callbacks
      for (let i = 0; i < contacts.length; i++) {
        await delay(700)
        onProgress(i + 1, contacts[i])
      }
      await delay(500)
      return { success: true, timestamp: Date.now() }
    }
  }
}
