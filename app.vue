<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
onMounted(() => {
  const authToken = window.location.hash
  if (/^#(?:invite_token|confirmation_token|recovery_token|email_change_token)=/.test(authToken)) {
    window.location.replace(`/admin/${authToken}`)
  }
})
</script>
