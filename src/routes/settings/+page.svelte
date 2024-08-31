<script lang="ts">
  import GroqSettings from "$lib/components/site/settings/groq-settings.svelte";
import ProviderSettings from "$lib/components/site/settings/provider-settings.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import type { RegisteredModelProvider } from "$lib/db";
  import DB from "$lib/db";
  import { defaultModelProviders } from "$lib/llm-providers";
  import { onMount } from "svelte";

  let registeredProviders: RegisteredModelProvider[];

  onMount(async () => {
    registeredProviders = await DB.registeredModelProviders.list();
    console.log(registeredProviders);
  });

  let selectedProvider: string = defaultModelProviders[0].model_provider;
</script>

{#if registeredProviders && registeredProviders.length > 0}
  <div class="flex flex-col gap-4">
    <Tabs.Root value={selectedProvider} class="w-10/12">
      <Tabs.List class="bg-transparent">
        {#each registeredProviders as provider}
          <Tabs.Trigger
            value={provider.model_provider}
            class="data-[state=active]:bg-muted"
            on:click={() => {
              selectedProvider = provider.model_provider;
            }}
          >
            <div class="flex items-center justify-between gap-2">
              <svelte:component
                this={defaultModelProviders.find(
                  (p) => p.model_provider === provider.model_provider
                )?.logo}
                class="stroke-white size-6 fill-white"
              />
              {provider.name}
            </div>
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
      <div class="w-full p-2 h-full">
        {#each registeredProviders as provider (provider.model_provider)}
          <Tabs.Content value={provider.model_provider}>
            <!-- <svelte:component this={modelComponents[provider.model_provider]} /> -->
            {#key provider.model_provider}
              {#if provider.model_provider === "groq"}
                <GroqSettings />
              {:else}
                <ProviderSettings providerName={provider.model_provider} />
              {/if}
            {/key}
          </Tabs.Content>
        {/each}
      </div>
    </Tabs.Root>
  </div>
{/if}
