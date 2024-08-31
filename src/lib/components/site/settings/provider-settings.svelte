<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { RegisteredModelProvider } from "$lib/db";
  import DB from "$lib/db";
  import { onMount } from "svelte";
  import { Switch } from "$lib/components/ui/switch";
  import { Eye, EyeOff, InfoIcon } from "lucide-svelte";
  import { providerConfigs, type ProviderConfig } from "$lib/llm-providers";

  export let providerName: string;

  let provider: RegisteredModelProvider | null = null;
  let showPassword = false;
  let is_enabled = false;
  let saved = false;
  let config: ProviderConfig;

  onMount(async () => {
    provider = await DB.registeredModelProviders.getByProvider(
      providerName.toLowerCase()
    );
    is_enabled = provider?.is_enabled || false;
    config =
      providerConfigs[providerName.toLowerCase()] || providerConfigs.ollama;
  });

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  async function saveProvider(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as {
      name: string;
      url?: string;
      api_key?: string;
    };

    if (provider && data.name && data.url) {
      const updateData: Partial<RegisteredModelProvider> = {
        api_url: data.url,
      };

      if (config.apiKey.editable && data.api_key) {
        updateData.api_key = data.api_key;
      }

      await DB.registeredModelProviders.update(provider.id, updateData);

      if (is_enabled) {
        await DB.registeredModelProviders.enable(provider.model_provider);
      } else {
        await DB.registeredModelProviders.disable(provider.model_provider);
      }

      saved = true;
      setTimeout(() => {
        saved = false;
      }, 2000);
    }
  }
</script>

{#if provider && config}
  <div class="flex flex-col gap-4">
    <div>
      {provider.name} Settings
    </div>
    <form on:submit={saveProvider}>
      <div class="flex flex-col gap-4 w-1/2">
        <div class="flex flex-col gap-2">
          <Label for="{providerName}-name">Name</Label>
          <Input
            type="text"
            id="{providerName}-name"
            name="name"
            value={provider.name}
            class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9"
            readonly={!config.name.editable}
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="{providerName}-api-key">API Key</Label>
          <div class="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="{providerName}-api-key"
              name="api_key"
              placeholder={config.apiKey.placeholder}
              value={provider.api_key}
              class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9 pr-12"
              readonly={!config.apiKey.editable}
              required={config.apiKey.editable}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-3 bg-transparent rounded-lg py-0 h-9"
              on:click={togglePasswordVisibility}
            >
              {#if showPassword}
                <EyeOff class="h-5 w-5 text-gray-500" />
              {:else}
                <Eye class="h-5 w-5 text-gray-500" />
              {/if}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <Label for="{providerName}-url">URL</Label>
          <Input
            type="text"
            id="{providerName}-url"
            name="url"
            value={provider.api_url}
            placeholder={config.url.placeholder}
            class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9"
            readonly={!config.url.editable}
            required
          />
          <span class="text-xs text-muted-foreground flex items-center gap-1">
            <InfoIcon class="size-3" />
            No trailing slash</span
          >
        </div>
        <div
          class="flex flex-row items-center justify-between rounded-lg border p-4"
        >
          <div class="space-y-0.5 flex flex-col gap-2">
            <Label for="{providerName}-is-enabled">Enable Provider</Label>
            <span class="text-sm text-muted-foreground"
              >Enabling the provider will make it available to the chatbot</span
            >
          </div>
          <Switch
            id="{providerName}-is-enabled"
            on:click={() => (is_enabled = !is_enabled)}
            checked={is_enabled}
          />
        </div>
        <div class="flex items center gap-2">
          <Button variant="secondary" type="submit">
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  </div>
{/if}
