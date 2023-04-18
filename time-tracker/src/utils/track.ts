import { ref } from "vue";

interface objectData {
  title?: string | null,
  start?: string | null,
  end?: string | null,
  tags?: number[] | null
}

export class Track {
  supabase: any;
  currentTracking: any;
  user: any;

  constructor(supabase: any) {
    this.supabase = supabase;
    this.currentTracking = null;
  }

  async initialize() {
    const { data: data, error: selectError } = await this.supabase.from('trackings').select().is('end', null)

    if (data && data.length > 0) {
      this.currentTracking = data[0]
    } else {
      this.currentTracking = null
    }

    this.user = await this.checkSession();
  }

  async refresh() {
    return await this.initialize()
  }
  
  async start(title: string | null, start: Date, end: Date | null = null, tags: [number] | null = null) {

    const formattedStart = start.toISOString()
    const formattedEnd = end?.toISOString() || null

    const { data: insertData, error: insertError } = await this.supabase.from('trackings').insert([
      {
        title: title,
        start: formattedStart,
        end: formattedEnd,
        user: this.user?.id
      }
    ]).select('*')

    // update current tracking id
    this.currentTracking = (insertData && insertData.length == 1) ? insertData[0] : null

    // add tags
    if (tags && tags.length > 0 && this.currentTracking?.id) {
      const { data: insertData_tags, error: insertError_tags } = await this.supabase.from('tracking_tags').insert(
        tags.map((tag: any) => {
          return {
            tag: tag,
            tracking: this.currentTracking?.id
          }
        })
      )
    }

    return { data: insertData, error: insertError }
  }

  async stop(end: Date) {
    const formattedEnd = end.toISOString()

    if (this.currentTracking?.id) {
      const { data: updateData, error: updateError } = await this.supabase.from('trackings').update({ end: formattedEnd }).eq('id', this.currentTracking?.id)

      // update current tracking id
      this.currentTracking = null
      
      return { data: updateData, error: updateError }
    } else {
      return { data: null, error: 'No tracking to stop' }
    }
  }

  getCurrentTracking() {
    if (this.currentTracking) return { data: this.currentTracking, error: null }
    else return { data: null, error: null }
  }

  async checkSession() {
    const { data, error } = await this.supabase.auth.getSession();
    // if user is not logged in, return
    if (!data) return false
    else return data.session?.user
  }

  async update(object: objectData, id: string | null) {
    id = id || this.currentTracking?.id || (await this.getCurrentTracking()).data?.id

    if (id) {
      // check if Object contains tags
      if (object.hasOwnProperty('tags')) {
        // remove tags from object
        const tags = object.tags || []
        delete object.tags
        
        const { data: deleteData_tags, error: deleteError_tags } = await this.supabase.from('tracking_tags').delete().eq('tracking', id)
        
        if (tags.length > 0) {
          const { data: insertData_tags, error: insertError_tags } = await this.supabase.from('tracking_tags').upsert(
            tags.map((tag: any) => {
              return {
                tag: tag,
                tracking: id
              }
            }), { onConflict: 'tag,tracking', noUpdate: true }
          )
        }
      }
      
      const { data: updateData, error: updateError } = await this.supabase.from('trackings').update(object).eq('id', id)
      
      return { data: updateData, error: updateError }
    } else {
      return { data: null, error: 'No tracking to update' }
    }
  }
  
  async getTitles() {
    const { data: selectData, error: selectError } = await this.supabase.from('titles').select("title, amount, last_use").eq('user', this.user?.id)

    if (selectData && selectData.length > 0) {
      return { data: selectData, error: null }
    } else {
      return { data: null, error: null }
    }
  }

  async getTrackingGroups(data: Object | null = null) {
    let selectData: any;

    if (data) {
      selectData = data
    } else {
      const { data: requestData, error: selectError } = await this.supabase.from('trackings_parent').select()
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

  async getTags() {
    const { data: selectData, error: selectError } = await this.supabase.from('tags').select("title, id")
    

    if (selectData && selectData.length > 0) {
      return { data: selectData, error: null }
    } else {
      return { data: null, error: null }
    }
  }
}