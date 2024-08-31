<script lang="ts">
  import { onMount } from "svelte";
  import OpenAI from "openai";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import {
    modelSelectorOpen,
    selectedModel,
    selectedModelProvider,
  } from "$lib/stores";
  import { CircleCheck } from "lucide-svelte";
  import DB, { type RegisteredModelProvider } from "$lib/db";
  import { openaiClient } from "$lib/llm-providers";

  let models: OpenAI.Models.Model[] | null = null;

  let error_description: string | null = null;

  let openaiProvider: RegisteredModelProvider | null = null;

  let openAIClient: OpenAI | null = null;

  export let provider = "openai";

  onMount(async () => {
    openaiProvider = await DB.registeredModelProviders.getByProvider(provider);

    if (openaiProvider && openaiProvider.is_enabled) {
      openAIClient = openaiClient({
        apiKey: openaiProvider.api_key,
        baseURL: openaiProvider.api_url,
      });
    }
    await getModels();
  });

  async function getModels() {
    if (openAIClient) {
      try {
        const res = await openAIClient.models.list();
        models = res.data;
      } catch (error) {
        console.error(error);
        models = null;
        if (error instanceof Error) {
          error_description = error.message;
        } else {
          error_description = "An unknown error occurred";
        }
      }
    }
  }
</script>

{#if models && models}
  <div class="flex flex-wrap gap-4 w-full pr-3.5 py-3">
    {#each models as model}
      <Button
        class={cn(
          "flex items-center justify-between h-full bg-muted-foreground/10 hover:bg-muted-foreground/20 border border-transparent gap-2 pr-2",
          $selectedModel === model.id ? "border-primary" : ""
        )}
        variant="secondary"
        on:click={() => {
          $selectedModel = model.id;
          $selectedModelProvider = provider;
          $modelSelectorOpen = false;
        }}
      >
        <div class="flex flex-col gap-2 items-start">
          <p>{model.id}</p>
        </div>
        {#if $selectedModel === model.id}
          <div>
            <CircleCheck class="size-5" />
          </div>
        {:else}
          <div class="w-5"></div>
        {/if}
      </Button>
    {/each}
  </div>
{:else if error_description}
  <div class="flex items-center justify-center w-full h-full p-20">
    <p class="text-center text-red-500">{error_description}</p>
  </div>
{:else}
  <p>Loading...</p>
{/if}
