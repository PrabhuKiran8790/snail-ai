<script lang="ts">
  import { onMount } from "svelte";
  import ollama, { type ListResponse } from "ollama/browser";
  import { Button } from "$lib/components/ui/button";
  import { cn, toGB } from "$lib/utils";
  import {
    modelSelectorOpen,
    selectedModel,
    selectedModelProvider,
  } from "$lib/stores";
  import { CircleCheck } from "lucide-svelte";

  let models: ListResponse | null = null;
  let error: string | null = null;

  async function getModels() {
    try {
      models = await ollama.list();
    } catch (e) {
      error = "Failed to load models.";
    }
  }

  onMount(async () => {
    await getModels();
  });
</script>

{#if error}
  <div class="p-20 text-center w-full text-red-500">
    <p>{error}</p>
    <p>Please make sure Ollama is installed and running.</p>
  </div>
{:else if models && models.models.length > 0}
  <div class="flex flex-col gap-4 w-full pr-3.5 pt-3">
    {#each models.models as model}
      <Button
        class={cn(
          "w-full flex items-center justify-between h-full bg-muted-foreground/10 hover:bg-muted-foreground/20 border border-transparent",
          $selectedModel === model.name ? "border-primary" : ""
        )}
        variant="secondary"
        on:click={() => {
          $selectedModel = model.name;
          $selectedModelProvider = "ollama";
          $modelSelectorOpen = false;
        }}
      >
        <div class="flex flex-col gap-2 items-start">
          <p>{model.name}</p>
          <p class="text-xs text-foreground/50">
            {toGB(model.size)} GB
            {model.details.families.includes("clip") ? "(vision model)" : ""}
          </p>
        </div>
        {#if $selectedModel === model.name}
          <div>
            <CircleCheck />
          </div>
        {/if}
      </Button>
    {/each}
  </div>
{:else}
  <p>Loading...</p>
{/if}
