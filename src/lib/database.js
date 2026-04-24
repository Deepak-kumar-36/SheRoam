import { supabase } from './supabase'

export const db = {
  posts: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author_id (
            name,
            initials
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data.map(post => ({
        ...post,
        author: post.author?.name || 'Anonymous',
        initials: post.author?.initials || 'A'
      }))
    },
    create: async (postData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Must be logged in to post')

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...postData,
          author_id: user.id
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    like: async (postId, currentLikes) => {
      // Very naive implementation. In a real app we'd use an rpc or junction table
      const { data, error } = await supabase
        .from('posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  messages: {
    // We fetch a flat list of messages. For realtime, components should use channels
    getHistory: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    send: async (text, receiverId = null) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Must be logged in to send messages')

      const receiver = receiverId || user.id // Default to self/global channel for prototype

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: receiver,
          text
        }])
        .select()
        .single()
        
      if (error) throw error
      return data
    }
  },

  sos: {
    sendAlert: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // We haven't created an emergency_logs table in schema but we can simulate the dispatch logic.
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, timestamp: Date.now() }), 1500)
      })
    }
  }
}
