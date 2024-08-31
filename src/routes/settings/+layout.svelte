<script>
  import { page } from "$app/stores";
  import { SettingsSidebar } from "$lib/components/site/settings";
  import "../../app.css";
</script>

<div class="flex flex-col min-h-screen overflow-hidden fixed h-full w-full">
  <div class="flex flex-1 overflow-hidden">
    <SettingsSidebar />
    <main class="flex-1 overflow-hidden h-full">
      <div class="flex flex-col h-full">
        <div class="flex h-16 items-center justify-between bg-secondary/30 p-4">
          <h1 class="text-2xl font-semibold">
            {#if $page.url.pathname === "/settings"}
              Model Providers
            {:else if $page.url.pathname === "/settings/manage-models"}
              Manage Models
            {/if}
          </h1>
        </div>
        <div class="flex-1 overflow-hidden p-4">
          <slot />
        </div>
      </div>
    </main>
  </div>
</div>
