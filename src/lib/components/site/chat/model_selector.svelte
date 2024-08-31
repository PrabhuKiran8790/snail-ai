<script lang="ts">
  import GroqModels from "./../settings/groq-models.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { RegisteredModelProvider } from "$lib/db";
  import DB from "$lib/db";
  import { defaultModelProviders } from "$lib/llm-providers";
  import { onMount, SvelteComponent, type ComponentType } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import OllamaModels from "$lib/components/site/settings/ollama-models.svelte";
  import OpenAIModels from "$lib/components/site/settings/openai-models.svelte";
  import { selectedModelProvider } from "$lib/stores";

  let registedModels: RegisteredModelProvider[] = [];

  onMount(async () => {
    registedModels = await DB.registeredModelProviders.list();
    const enabledModels = registedModels.filter((model) => model.is_enabled);
    if (enabledModels.length > 0 && !selectedModelProvider) {
      $selectedModelProvider = enabledModels[0].model_provider;
    }
  });

  const modelComponents: {
    [key: string]: ComponentType<SvelteComponent>;
  } = {
    ollama: OllamaModels,
    openai: OpenAIModels,
    groq: GroqModels,
  };

  $: {
    if (registedModels.length > 0 && !$selectedModelProvider) {
      $selectedModelProvider = registedModels[0].model_provider;
    }
  }
</script>

{#if registedModels && registedModels.length > 0}
  <Tabs.Root
    value={$selectedModelProvider}
    class="w-full h-full flex flex-col md:flex-row gap-4"
  >
    <Tabs.List
      class="md:h-full flex flex-row md:flex-col gap-4 items-start justify-start md:w-48 p-2 overflow-x-auto md:overflow-y-auto"
    >
      <p class="text-white p-2 pb-0 whitespace-nowrap">Model Provider</p>
      <div class="flex flex-row md:flex-col gap-2 w-full">
        {#each registedModels as model}
          <Tabs.Trigger
            on:click={() => {
              $selectedModelProvider = model.model_provider;
            }}
            value={model.model_provider}
            disabled={!model.is_enabled}
            class="flex items-center gap-2 hover:bg-muted-foreground/10 p-1 rounded-lg pl-2 justify-start py-0 h-9 select-none w-full bg-secondary text-secondary-foreground whitespace-nowrap
              data-[state=active]:bg-muted-foreground/10
              "
          >
            <svelte:component
              this={defaultModelProviders.find(
                (model_) => model.name === model_.name
              )?.logo}
              class="stroke-white size-4 fill-white"
            />
            <p>{model.name}</p>
          </Tabs.Trigger>
        {/each}
      </div>
    </Tabs.List>
    <div class="flex-1 overflow-auto">
      {#each registedModels as model}
        <Tabs.Content value={model.model_provider}>
          <svelte:component this={modelComponents[model.model_provider]} />
        </Tabs.Content>
      {/each}
    </div>
  </Tabs.Root>
{/if}
