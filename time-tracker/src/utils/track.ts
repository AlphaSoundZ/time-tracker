export class Track {
  supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
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
      return { data: updateData, error: updateError }
    } else {
      return { data: null, error: 'No tracking to stop' }
    }
  }

  async getCurrentTrackingStartTime() {
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

  async checkSession() {
    const { data, error } = await this.supabase.auth.getSession();
    // if user is not logged in, return
    if (!data) return false
    else return data.session?.user
  }

}