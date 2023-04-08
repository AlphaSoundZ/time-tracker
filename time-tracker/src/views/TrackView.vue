<template>
    <main>
        <h1 class="title">Time Tracker</h1>
        <p class="subtitle">Track your time</p>
        <div class="buttons">
            <button id="loginBtn" class="button is-primary" >Start Tracking</button>
        </div>
    </main>
</template>

<script lang="ts">
</script>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
