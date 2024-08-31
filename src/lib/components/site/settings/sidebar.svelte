<script>
  import { selectedSettingsModel } from "$lib/stores";
  import { providers } from "$lib/llm-providers";
  import { onMount } from "svelte";
  import { BrainCircuit, DatabaseIcon } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { page } from "$app/stores";

  onMount(() => {
    $selectedSettingsModel = providers[0].value;
  });

  const sidebarNav = [
    {
      name: "Model Providers",
      icon: BrainCircuit,
      href: "/settings",
    },
    {
      name: "Manage Models (Ollama)",
      icon: DatabaseIcon,
      href: "/settings/manage-models",
    },
  ];
</script>

<div
  class="bg-secondary/30 flex flex-col h-full lg:w-60 2xl:w-80 border-r p-2 gap-4"
>
  <div class="flex flex-col gap-2">
    <h2>Settings</h2>
    <hr />
  </div>

  <div class="flex flex-col gap-2">
    {#each sidebarNav as { name, icon, href }}
      <a
        {href}
        class={cn(
          "flex items-center gap-2 p-2 rounded-lg hover:bg-secondary",
          $page.url.pathname === href && "bg-secondary"
        )}
      >
        <svelte:component this={icon} class="w-5 h-5" />
        {name}
      </a>
    {/each}
  </div>
</div>
