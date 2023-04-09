<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
//import { createClient } from "@supabase/supabase-js";
import { supabase } from '../lib/supabaseClient'
import { track } from '@vue/reactivity';
import { format } from 'path';
import { userInfo } from 'os';

import { faker } from "https://cdn.skypack.dev/@faker-js/faker";

interface TrackingData {
	id: number;
	title: string;
	start: string | number | Date;
	end?: string | number | Date;
}

const trackings = ref<TrackingData[]>([]);

async function getTrackings() {
  const { data } = await supabase.from('trackings').select()
	trackings.value = data as TrackingData[];

  // subribe to realtime updates
  supabase
    .channel('any')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trackings' }, (payload) => {
      // update trackings
      getTrackings()
    })
    .subscribe()
}

async function addElement() {

  const { data, error } = await supabase.auth.getSession();
  // if user is not logged in, return
  if (!data) return
  const user = data.session?.user;
  
  // Random tracking title
  const randomTitle = faker.lorem.words(3)

  const randomStart = new Date(
    new Date().getTime() - Math.floor(Math.random() * 10000000000)
  ).toISOString()

  const randomEnd = new Date(
    new Date(randomStart).getTime() + Math.floor(Math.random() * 50000000)
  ).toISOString()

  await supabase.from('trackings').insert([
    {
      title: randomTitle,
      start: randomStart,
      end: randomEnd,
      user: user?.id
    }
  ])
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
  const { data, error } = await supabase.auth.getSession();
  // if user is not logged in, return
  if (data) {
    const user = data.session?.user;
    getTrackings()

    // subscribe to realtime updates
    supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trackings' }, (payload) => {
        console.log('Change received!', payload)
      })
      .subscribe()
  }


})

</script>

<template>
  <div class="container">
    <h1>Dashboard</h1>
    <div v-if="trackings.length !== 0">
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

    <div v-if="trackings.length === 0" class="title">
      <h2>No trackings yet</h2>
    </div>

    <!-- test button to add element -->
    <br>
    <a href="#" @click="addElement()">Add Tracking</a>
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