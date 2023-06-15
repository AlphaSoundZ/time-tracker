<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
//import { createClient } from "@supabase/supabase-js";
import { supabase } from '../lib/supabaseClient'
import { track } from '@vue/reactivity';
import { userInfo } from 'os';

import topbar from 'topbar'
import { Track } from '@/utils/track';
import type { SourceMapGenerator } from 'source-map';

interface TrackingData {
	id: number;
	title: string;
	start: string | number | Date;
	end?: string | number | Date;
  tags: string[];
}

const trackings = ref<TrackingData[]>([]);
const trackingGroups = ref<TrackingData[][]>([]);

async function getTrackings() {
  /*
  // get trackings
  const sessionStorageTrackings = sessionStorage.getItem('trackings')
  if (sessionStorageTrackings && sessionStorageTrackings !== '[]') {
    trackings.value = JSON.parse(sessionStorageTrackings)
  } else {
    const { data } = await supabase.from('trackings').select().order('start', { ascending: false })
    trackings.value = data as TrackingData[];

    // save trackings to session storage
    sessionStorage.setItem('trackings', JSON.stringify(trackings.value))
  }
  */

  // get grouped trackings
  const sessionStorageGroupedTrackings = sessionStorage.getItem('groupedTrackings')
  if (sessionStorageGroupedTrackings && sessionStorageGroupedTrackings !== '[]') {
    trackingGroups.value = JSON.parse(sessionStorageGroupedTrackings)
  }

  // TODO: add subscribe to grouped trackings -> then put this in else statement
  const track = new Track(supabase)
  const { data } = await track.getTrackingGroups()
  trackingGroups.value = data

  console.log(data)

  // save trackings to session storage
  sessionStorage.setItem('groupedTrackings', JSON.stringify(data))
  /*
  // subribe to realtime updates
  supabase
  .channel('any')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'trackings' }, async (payload) => {
    // update trackings
    const { data } = await supabase.from('trackings').select().order('start', { ascending: false })
    trackings.value = data as TrackingData[];

    // save trackings to session storage
    sessionStorage.setItem('trackings', JSON.stringify(trackings.value))
    })
    .subscribe()
  */
}

function duration(tracking: TrackingData) {
  // if tracking has not ended, return "in progress"
  if (!tracking.end) {
    return 'in progress'
  }

  // calculate duration
  const start = new Date(tracking.start)
  const end = new Date(tracking.end)
	const duration = end.getTime() - start.getTime()

  return format(duration)
}

function format(time: TrackingData['start']) {
  // convert time to hours, minutes, seconds
  time = new Date(time).getTime()
  
  const hours = Math.floor(time / 1000 / 60 / 60)
  const minutes = Math.floor(time / 1000 / 60) % 60
  const seconds = Math.floor(time / 1000) % 60

  // format time
  const formattedTime = [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':')
  
  return formattedTime
}

function formatTime(time: TrackingData['start']) {
  if (!time) return

  // return time in format hh:mm:ss
  return new Date(time).toLocaleTimeString().slice(0, 8)
}

function getDate(tracking: TrackingData) {
  let startDate = new Date(tracking.start).toLocaleDateString()

  if (tracking.end) {
    let endDate = new Date(tracking.end).toLocaleDateString()

    if (startDate === endDate) {
      return startDate
    } else {
      return `${startDate} - ${endDate}`
    }
  }

  return startDate
}

onMounted(async () => {
  topbar.show()
  
  const { data, error } = await supabase.auth.getSession();
  // if user is not logged in, return
  if (data) {
    const user = data.session?.user;
    getTrackings().then(() => {
      topbar.hide()
    })
  }
})

</script>

<template>
  <div class="container">
    <h1>Dashboard</h1>
    <div v-if="trackings.length !== 0" hidden>
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tracking in trackings" :key="tracking.id">
            <td>{{ tracking.title }}</td>
            <td>{{ getDate(tracking) }}</td>
            <td>{{ formatTime(tracking.start) }}</td>
            <td>{{ tracking.end ? formatTime(tracking.end) : "" }}</td>
            <td>{{ duration(tracking) }}</td>
          </tr>
        </tbody>

        <!-- Time in total -->
        <tfoot>
          <tr>
            <td colspan="4">Total</td>
            <td>
              {{
                format(trackings
                  .map((tracking) => {
                    if (!tracking.end) return 0
                    return new Date(tracking.end).getTime() - new Date(tracking.start).getTime()
                  })
                  .reduce((a, b) => a + b, 0))
              }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="trackingGroups.length !== 0">
      <div class="groups" v-for="group in trackingGroups">
        <br>
        <h2>{{ group[0].title }} on {{ group[0].end ? new Date(group[0].end).toDateString() : '' }} ({{
                  format(group
                    .map((item: any) => {
                      if (!item.end) return 0
                      return new Date(item.end).getTime() - new Date(item.start).getTime()
                    })
                    .reduce((a: any, b: any) => a + b, 0))
                }})</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in group" :key="item.id">
              <td>{{ formatTime(item.start) }}</td>
              <td>{{ item.end ? formatTime(item.end) : "" }}</td>
              <td>{{ duration(item) }}</td>
              <td>{{ item.tags.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="trackingGroups.length === 0" class="title">
      <h2>No trackings yet</h2>
    </div>

    <!-- test button to add element -->
    <br>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}
.title {
  text-align: center;
  margin-bottom: 2rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #3e3e3e;
  padding: 0.5rem;
}

.table th {
  background: #0a0a0a;
}

a :hover {
  background-color: transparent;
}

a {
  display: inline-block;
  padding: 0.5rem;
}
</style>