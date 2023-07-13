<script lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

import { Track } from '@/utils/track'
import topbar from 'topbar'

interface ItemData {
  title: string
  amount: number
  last_use: string | number | Date
}

interface TagData {
  title: string
  id: number
  active: boolean
}

export default {
  data() {
    return {
      items: ref<ItemData[]>([]),
      tags: ref<TagData[]>([]),
      trackingTime: '',
      intervalId: <any>(null),
      trackingSubscription: <any>(null),
      tagSubscription: <any>(null),
      tagsDropdownOpen: false,
      titleDropdownOpen: false,
      track: new Track(supabase)
    }
  },
  methods: {
    async updateTitle() {
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement

      // sessionStorage of tracking title
      sessionStorage.setItem('trackingTitle', trackingTitle.value)

      if (this.isIntervalRunning()) await this.track.update({ title: trackingTitle.value }, null)
    },
    async updateItems() { // update items (titles) in dropdown menu
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement

      if (!sessionStorage.getItem('titles')) await this.fetchItems()

      const inputString = trackingTitle.value.toLowerCase()
      const allItems = JSON.parse(sessionStorage.getItem('titles') || '[]')

      // check if input is empty
      if (trackingTitle.value.length == 0) {
        // get latest title
        this.items = allItems.slice(0, 1)
        this.titleDropdownOpen = true
        return
      }

      // check if there is a match
      const matches = allItems.filter((item: ItemData) => {
        return item.title.toLowerCase().includes(inputString)
      })

      // sort matches by amount
      matches.sort((a: ItemData, b: ItemData) => {
        return b.amount - a.amount
      })

      // limit matches to 5
      this.items = matches.slice(0, 3)
      this.titleDropdownOpen = true
    },
    selectItem(item: ItemData) {
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement

      const title = item.title

      trackingTitle.value = title as string
      this.updateTitle()

      // close dropdown menu
      this.items = []
      this.titleDropdownOpen = false
    },
    async fetchItems() {
      const data = await this.track.getTitles()
      if (data.error) {
        console.log(data.error)
        return
      }

      // set session storage
      sessionStorage.setItem('titles', JSON.stringify(data.data))
    },
    async toggleTracking() {
      topbar.show()

      const startButton = document.getElementById('startTracking') as HTMLAnchorElement
      const stopButton = document.getElementById('stopTracking') as HTMLAnchorElement
      const now = new Date()

      // get current tracking
      const isIntervalRunning = this.isIntervalRunning()

      if (isIntervalRunning) {
        // stop tracking

        this.stopTracking().then(() => {
          topbar.hide()
        })
      } else {
        // start tracking

        this.startTracking().then(() => {
          topbar.hide()
        })
      }

      return
    },
    isIntervalRunning() {
      return this.intervalId != null
    },
    async startTracking() {
      const now = new Date()
      const startButton = document.getElementById('startTracking') as HTMLAnchorElement
      const stopButton = document.getElementById('stopTracking') as HTMLAnchorElement
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement
      const tags = JSON.parse(sessionStorage.getItem('tags') || '[]')

      // reduce tags to active ones and return only ids
      const activeTags = tags.reduce((acc: number[], tag: TagData) => {
        if (tag.active) acc.push(tag.id)
        return acc
      }, [])

      this.startInterval(now)

      // change button text
      startButton.style.display = 'none'
      stopButton.style.display = 'block'

      await this.track.start(trackingTitle.value, now, null, activeTags).then((data) => {
        if (data.error) {
          console.log(data.error)

          // change button text
          startButton.style.display = 'block'
          stopButton.style.display = 'none'

          // stop interval
          this.stopInterval()

          // reset tracking time
          this.trackingTime = '--:--:--'
        } else {
          console.log('tracking started!')
        }

        return
      })
      return
    },
    async stopTracking() {
      const now = new Date()
      const startButton = document.getElementById('startTracking') as HTMLAnchorElement
      const stopButton = document.getElementById('stopTracking') as HTMLAnchorElement
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement

      this.stopInterval()
      this.trackingTime = '00:00:00'                        
      trackingTitle.value = ''

      // sessionStorage of tracking title
      sessionStorage.removeItem('trackingTitle')

      // change button text
      startButton.style.display = 'block'
      stopButton.style.display = 'none'

      // set tags active to false
      const allTags = JSON.parse(sessionStorage.getItem('tags') || '[]')
      allTags.forEach((tag: TagData) => {
        tag.active = false
      })
      sessionStorage.setItem('tags', JSON.stringify(allTags))

      await this.track.stop(now).then((data) => {
        if (data.error) {
          console.log(data.error)
        }

        // update items
        this.fetchItems()

        console.log('tracking stopped!')
        return
      })
      return
    },
    startInterval(start: Date) {
      // render at start time
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const diffDate = new Date(diff)
      this.trackingTime = this.formatTime(diffDate)

      // start interval
      this.intervalId = setInterval(() => {
        const now = new Date()
        const diff = now.getTime() - start.getTime()
        const diffDate = new Date(diff)

        this.trackingTime = this.formatTime(diffDate)
      }, 1000)
    },
    stopInterval() {
      clearInterval(this.intervalId)
      this.intervalId = null
    },
    async updateTracking(params: any | null = null) {
      const startButton = document.getElementById('startTracking') as HTMLAnchorElement
      const stopButton = document.getElementById('stopTracking') as HTMLAnchorElement
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement

      if (params) {
        const startDate = params.start ? new Date(params.start) : null
        const endDate = params.end ? new Date(params.end) : null

        if (startDate && !endDate && !this.isIntervalRunning()) {
          // tracking has changed to running
          console.log('tracking has changed to running')
          this.startInterval(startDate)

          // update current tracking
          this.track.updateCurrentTracking(params)

          // change button text
          startButton.style.display = 'none'
          stopButton.style.display = 'block'

        } else if (endDate && this.isIntervalRunning()) {
          // tracking has changed to stopped
          console.log('tracking has changed to stopped')
          // reset tracking time and title
          this.trackingTime = '00:00:00'
          trackingTitle.value = ''

          // sessionStorage of tracking title
          sessionStorage.removeItem('trackingTitle')

          // stop interval
          this.stopInterval()

          // change button text
          startButton.style.display = 'block'
          stopButton.style.display = 'none'
        }

        if (this.isIntervalRunning()) {
          // update title only if tracking is running
          trackingTitle.value = params.title?.toString() || ''

          // sessionStorage of tracking title
          sessionStorage.setItem('trackingTitle', trackingTitle.value)
        }
      }

      if (!this.isIntervalRunning()) {
        // update title from session storage
        trackingTitle.value = sessionStorage.getItem('trackingTitle') || ''

        // change button text
        startButton.style.display = 'block'
        stopButton.style.display = 'none'
      }
    },
    formatTime(diffDate: Date) {
      // format time
      const hours = diffDate.getUTCHours().toString().padStart(2, '0')
      const minutes = diffDate.getUTCMinutes().toString().padStart(2, '0')
      const seconds = diffDate.getUTCSeconds().toString().padStart(2, '0')

      return `${hours}:${minutes}:${seconds}`
    },
    toggleTagsDropdown() {
      if (this.tagsDropdownOpen) {
        this.tagsDropdownOpen = false
        this.tags = []
      } else {
        this.tagsDropdownOpen = true
        const allItems = JSON.parse(sessionStorage.getItem('tags') || '[]')
        this.tags = allItems
      }
      
    },
    async selectTag(tag: TagData) {
      this.tags[this.tags.indexOf(tag)].active = !this.tags[this.tags.indexOf(tag)].active
      
      sessionStorage.setItem('tags', JSON.stringify(this.tags))

      // update tracking
      if (this.isIntervalRunning()) {

        // get active tags
        const activeTags = this.tags.filter((tag: TagData) => tag.active).map((tag: TagData) => tag.id)

        console.log(activeTags)

        // update tags
        await this.track.update({ tags: activeTags }, null) // tags look like this: [1, 2, 3]
      }
    },
    updateTags(tag_id: number, active: boolean) {
      // TODO: update tags status
      //this.tags[this.tags.findIndex((tag: TagData) => tag.id === tag_id)].active = active


      sessionStorage.setItem('tags', JSON.stringify(this.tags))
    },
  },
  setup() {
    const trackingTime = ref('--:--:--')

    topbar.show()

    return {
      trackingTime
    }
  },
  async mounted() {
    await this.track.initialize()
    const currentTracking = this.track.getCurrentTracking()
    const date = currentTracking.data?.start ? new Date(currentTracking.data.start) : null

    if (currentTracking.error) {
      console.log(currentTracking.error)
      topbar.hide()
      return
    }
    if (!date) {
      this.trackingTime = '00:00:00'
    }

    this.updateTracking(currentTracking.data)

    // fetch titles for autocompletion
    await this.track.getTitles().then((response) => {
      if (response.error) {
        console.log(response.error)
        return
      }

      // set session storage
      sessionStorage.setItem('titles', JSON.stringify(response.data))
    })

    // fetch tags
    await this.track.getTags().then(async (response) => {
      if (response.error) {
        console.log(response.error)
        return
      }

      // set all tags to inactive by default
      response.data.forEach((tag: TagData) => {
        tag.active = false
      })

      // when there is no tracking running, check if there are active tags in session storage
      const running = currentTracking.data?.start && !currentTracking.data?.end
      if (!running) {
        const allTags = JSON.parse(sessionStorage.getItem('tags') || '[]')
        if (allTags.length > 0) {
          // check if there are active tags in session storage
          allTags.forEach((tag: TagData) => {
            if (tag.active) {
              // set active to true
              response.data.find((t: TagData) => t.id === tag.id).active = true
            }
          })
        }
      } else {
        // when there is a tracking running, check for active tags
        const { data, error } = await supabase
          .from('tracking_tags')
          .select('tag')
          .eq('tracking', currentTracking.data?.id)
        
        console.log(data)
        
        if (data && data.length > 0) {
          // set active tags
          data.forEach((tag: { tag: number }) => {
            response.data.find((t: TagData) => t.id === tag.tag).active = true
          })
        }
      }
      
      // set session storage
      sessionStorage.setItem('tags', JSON.stringify(response.data))
    })

    // event listener for clicking changes
    const tagsContainer = document.getElementById('tagsItems') as HTMLDivElement
    document.addEventListener('click', (e) => {
      // check if click was outside of title input
      const trackingTitle = document.getElementById('trackingTitle') as HTMLInputElement

      if (e.target != trackingTitle) {
        // close autocomplete
        this.items = []
        this.titleDropdownOpen = false
      }

      // check if click was outside of tags dropdown
      const tagsDropdown = document.getElementById('tagsButton') as HTMLDivElement
      
      if (!tagsContainer.contains(e.target as Node) && this.tagsDropdownOpen && e.target != tagsDropdown) {
        // close tags
        this.tags = []
        this.tagsDropdownOpen = false
      }
    })

    this.trackingSubscription = supabase
      .channel('public:trackings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trackings' },
        async (payload) => {
          this.updateTracking(payload.new)
        }
      )
      .subscribe()

    this.tagSubscription = supabase
      .channel('public:tracking_tags')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracking_tags' },
        async (payload) => {
          if (payload.new) {
            this.updateTags((payload.new as { tracking: number; tag: number }).tag, true)
          } else if (payload.old) {
            this.updateTags((payload.old as { tracking: number; tag: number }).tag, false)
          }
        }
      )
      .subscribe()

    topbar.hide()
  }
}
</script>

<template>
  <div class="tracking-container">
    <div class="title-container">
      <input
        autocomplete="off"
        class="tracking-title"
        type="text"
        placeholder="Title"
        id="trackingTitle"
        @change="updateTitle"
        @focusin="updateItems"
        @keyup="updateItems"
      />
      <div class="autocomplete-items">
        <div v-for="item in items" @click="selectItem(item)">
          {{ item.title }} <br />
          <p style="font-size: small">
            {{ new Date(item.last_use).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>
    <img src="@/assets/tags_icon.svg" alt="tags" class="tag-button" @click="toggleTagsDropdown" id="tagsButton"/>
    <div class="tags-items" id="tagsItems">
      <div v-for="tag in tags" @click="selectTag(tag)" :key="tag.id" :class="{ 'tags-active': tag.active}">
        {{ tag.title }}
      </div>
    </div>
    <h3 class="tracking-time" id="trackingTime">{{ trackingTime }}</h3>
    <img class="toggleTracking" src="@/assets/stop_tracking.svg" alt="stop tracking" @click="toggleTracking" id="stopTracking" hidden loading="eager">
    <img class="toggleTracking" src="@/assets/start_tracking.svg" alt="start tracking" @click="toggleTracking" id="startTracking" loading="eager">

  </div>
</template>

<style scoped src="@/assets/trackingBar.css"></style>