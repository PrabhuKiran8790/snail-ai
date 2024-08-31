<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { selectedModel } from "$lib/stores";
  import ollama, { type ListResponse } from "ollama/browser";

  let models: ListResponse;
  export let modelSelectorOpen: boolean;

  async function listModels() {
    try {
      models = await ollama.list();
      $selectedModel = $selectedModel || models.models[0].name;
    } catch (error) {
      $selectedModel = "";
    }
  }

  $: {
    if (modelSelectorOpen) {
      listModels();
    }
  }
</script>

{#if models}
  <div class="flex flex-col gap-2 w-full">
    {#each models.models as model}
      <Button
        class="w-full flex items-center justify-between text-foreground/80 hover:bg-transparent hover:border hover:border-secondary-foreground/10"
        on:click={() => {
          $selectedModel = model.name;
          modelSelectorOpen = false;
        }}
        variant="secondary"
      >
        <p>{model.name}</p>
      </Button>
    {/each}
  </div>
{:else}
  <p>
    Could not load models, Make Sure Ollama is running and you have downloaded
    the models.
  </p>
{/if}
