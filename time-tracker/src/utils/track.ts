export class Track {
  supabase: any;
  currentTrackingId: string | null;

  constructor(supabase: any) {
    this.supabase = supabase;
    this.currentTrackingId = null;
  }
  
  async add(title: string | null, start: Date, end: Date | null) {
    const user: any = await this.checkSession();
    if (!user) return { data: null, error: 'User not logged in' }

    const formattedStart = start.toISOString()
    const formattedEnd = end?.toISOString() || null

    const { data: insertData, error: insertError } = await this.supabase.from('trackings').insert([
      {
        title: title,
        start: formattedStart,
        end: formattedEnd,
        user: user?.id
      }
    ])

    // update current tracking id
    if (insertData && insertData.length == 1) {
      this.currentTrackingId = insertData[0].id
    } else {
      this.currentTrackingId = null
    }
    
    return { data: insertData, error: insertError }
  }

  async start(title: string | null, start: Date) {
    return await this.add(title, start, null)
  }

  async stop(end: Date) {
    const user: any = await this.checkSession();
    if (!user) return { data: null, error: 'User not logged in' }

    const formattedEnd = end.toISOString()

    const { data: selectData, error: selectError } = await this.supabase.from('trackings').select('id').eq('user', user?.id).is('end', null)
    if (selectData && selectData.length == 1) {
      const { data: updateData, error: updateError } = await this.supabase.from('trackings').update({ end: formattedEnd }).eq('id', selectData[0].id)

      // update current tracking id
      if (updateData && updateData.length == 1) {
        this.currentTrackingId = updateData[0].id
      } else {
        this.currentTrackingId = null
      }
      
      return { data: updateData, error: updateError }
    } else {
      return { data: null, error: 'No tracking to stop' }
    }
  }

  async getCurrentStartTime() {
    const user: any = await this.checkSession();
    if (!user) return { date: null, error: 'User not logged in' }

    const { data: selectData, error: selectError } = await this.supabase.from('trackings').select('start').eq('user', user?.id).is('end', null)

    if (selectData && selectData.length > 0) {
      const start = new Date(selectData[0].start)
      return { date: start, error: null }
    } else {
      return { date: null, error: null }
    }
  }

  async getCurrentTracking() {
    const user: any = await this.checkSession();
    if (!user) return { data: null, error: 'User not logged in' }

    const { data: selectData, error: selectError } = await this.supabase.from('trackings').select().eq('user', user?.id).is('end', null)

    if (selectData && selectData.length > 0) {
      return { data: selectData[0], error: null }
    } else {
      return { data: null, error: null }
    }
  }

  async checkSession() {
    const { data, error } = await this.supabase.auth.getSession();
    // if user is not logged in, return
    if (!data) return false
    else return data.session?.user
  }

  async update(object: Object, id: string | null) {
    const user: any = await this.checkSession();
    if (!user) return { data: null, error: 'User not logged in' }

    id = id || this.currentTrackingId || (await this.getCurrentTracking()).data?.id

    if (id) {
      const { data: updateData, error: updateError } = await this.supabase.from('trackings').update(object).eq('id', id)
      
      return { data: updateData, error: updateError }
    } else {
      return { data: null, error: 'No tracking to update' }
    }
  }
  
  async getTitles() {
    const user: any = await this.checkSession();
    if (!user) return { data: null, error: 'User not logged in' }

    const { data: selectData, error: selectError } = await this.supabase.from('titles').select("title, amount, last_use").eq('user', user?.id)

    if (selectData && selectData.length > 0) {
      return { data: selectData, error: null }
    } else {
      return { data: null, error: null }
    }
  }

  async getTrackingGroups(data: Object | null = null) {
    const user: any = await this.checkSession();
    if (!user) return { data: null, error: 'User not logged in' }

    let selectData: any;

    if (data) {
      selectData = data
    } else {
      const { data: requestData, error: selectError } = await this.supabase.from('trackings').select("title, start, end").eq('user', user?.id).not('end', 'is', null).order('start', { ascending: false })
      selectData = requestData
    }

    let groups: any = []

    if (selectData && selectData.length > 0) {
      // create groups by same tracking titles in a row
      for (let i = 0; i < selectData.length; i++) {
        const element = selectData[i];
        const last_element = selectData[i - 1] || null;

        if (last_element && element.title == last_element.title && new Date(element.end).toLocaleDateString() == new Date(last_element.end).toLocaleDateString())
          groups[groups.length - 1].push(element)
        else
          groups.push([element])
      }

      return { data: groups, error: null }
    } else {
      return { data: null, error: null }
    }
  }
}