<script lang="ts">
  import { Sidebar, TailwindIndicator } from "$lib/components/site";
  import { onDestroy, onMount } from "svelte";
  import "../app.css";
  import DB, { type RegisteredModelProvider } from "$lib/db";
  import { selectedModel } from "$lib/stores";

  onMount(async () => {
    await DB.init();
  });

  let ollamaDetails: RegisteredModelProvider | null = null;

  let interval: string | number | NodeJS.Timeout | undefined;
</script>

<!-- {#if dev}
  <TailwindIndicator />
{/if} -->
<div class="flex flex-col min-h-screen overflow-hidden fixed h-full w-full">
  <div class="flex flex-1 overflow-hidden">
    <Sidebar />
    <main class="flex-1 overflow-hidden bg-secondary/50 h-full">
      <slot />
    </main>
  </div>
</div>
