<template>
  <div class="flex min-h-screen bg-gray-50">
    <DashboardDashSidebar />
    <div class="flex flex-1 flex-col">
      <DashboardDashHeader />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
