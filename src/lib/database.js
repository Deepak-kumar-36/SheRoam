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
    },
    subscribeToPosts: (onPost) => {
      return supabase
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
          onPost(payload.new)
        })
        .subscribe()
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
    },
    subscribeToChat: (onMessage) => {
      return supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          onMessage(payload.new)
        })
        .subscribe()
    }
  },

  sos: {
    sendAlert: async (lat, lng) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('emergency_logs')
        .insert([{
          user_id: user.id,
          latitude: lat,
          longitude: lng,
          status: 'active'
        }])
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    cancelAlert: async (logId) => {
      const { error } = await supabase
        .from('emergency_logs')
        .update({ status: 'safely_resolved' })
        .eq('id', logId)
      if (error) throw error
    },
    subscribeToEmergencies: (onEmergency) => {
      return supabase
        .channel('public:emergency_logs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_logs' }, payload => {
          if (payload.new.status === 'active') {
            onEmergency(payload.new)
          }
        })
        .subscribe()
    }
  },

  users: {
    verify: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('users')
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  verification: {
    uploadVideo: async (blob) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileName = `${user.id}_${Date.now()}.webm`
      const { data, error } = await supabase.storage
        .from('verification-videos')
        .upload(fileName, blob, {
          contentType: 'video/webm',
          upsert: false
        })
      
      if (error) throw error
      return data.path
    },

    submitRequest: async (videoPath) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('verification_requests')
        .insert([{
          user_id: user.id,
          video_url: videoPath,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },

    getMyStatus: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      return data || null
    },

    getAllPending: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          user:user_id (
            name,
            initials,
            city
          )
        `)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },

    getVideoUrl: (videoPath) => {
      const { data } = supabase.storage
        .from('verification-videos')
        .getPublicUrl(videoPath)
      return data.publicUrl
    },

    getVideoSignedUrl: async (videoPath) => {
      const { data, error } = await supabase.storage
        .from('verification-videos')
        .createSignedUrl(videoPath, 3600) // 1 hour expiry
      if (error) throw error
      return data.signedUrl
    },

    approve: async (requestId, userId) => {
      // Update the request status
      const { error: reqError } = await supabase
        .from('verification_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)
      if (reqError) throw reqError

      // Mark user as verified
      const { error: userError } = await supabase
        .from('users')
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (userError) throw userError
    },

    reject: async (requestId, notes = '') => {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)
      if (error) throw error
    }
  },

  locations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    getByArea: async (lat, lng, radiusKm = 50) => {
      // Simple bounding-box filter (no PostGIS needed)
      const latDelta = radiusKm / 111 // ~111km per degree latitude
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta)
      if (error) throw error
      return data
    }
  },

  safeScores: {
    submit: async (lat, lng, placeName, score, comment = '') => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Must be logged in to rate')
      const { data, error } = await supabase
        .from('safe_scores')
        .insert([{
          user_id: user.id,
          latitude: lat,
          longitude: lng,
          place_name: placeName,
          score,
          comment
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    getForArea: async (lat, lng, radiusKm = 20) => {
      const latDelta = radiusKm / 111
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
      const { data, error } = await supabase
        .from('safe_scores')
        .select('*')
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta)
      if (error) throw error
      return data
    },
    getAggregateForPlace: async (placeName) => {
      const { data, error } = await supabase
        .from('safe_scores')
        .select('score')
        .ilike('place_name', `%${placeName}%`)
      if (error) throw error
      if (!data || data.length === 0) return { avgScore: 0, totalRatings: 0, percentage: 0 }
      const avg = data.reduce((s, r) => s + r.score, 0) / data.length
      return { avgScore: Math.round(avg * 10) / 10, totalRatings: data.length, percentage: Math.round((avg / 10) * 100) }
    }
  },

  incidents: {
    report: async (lat, lng, locationName, type, description = '') => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Must be logged in to report')
      const { data, error } = await supabase
        .from('incidents')
        .insert([{
          reporter_id: user.id,
          latitude: lat,
          longitude: lng,
          location_name: locationName,
          incident_type: type,
          description
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    getForArea: async (lat, lng, radiusKm = 50) => {
      const latDelta = radiusKm / 111
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta)
        .order('reported_at', { ascending: false })
      if (error) throw error
      return data
    },
    getStatsForPlace: async (placeName) => {
      const { data, error } = await supabase
        .from('incidents')
        .select('incident_type')
        .ilike('location_name', `%${placeName}%`)
      if (error) throw error
      if (!data) return { totalIncidents: 0, breakdown: {} }
      const breakdown = {}
      data.forEach(d => { breakdown[d.incident_type] = (breakdown[d.incident_type] || 0) + 1 })
      return { totalIncidents: data.length, breakdown }
    }
  }
}
