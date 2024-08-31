<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { RegisteredModelProvider } from "$lib/db";
  import DB from "$lib/db";
  import { onMount } from "svelte";
  import { Switch } from "$lib/components/ui/switch";
  import { Eye, EyeOff } from "lucide-svelte";

  let ollamaProvider: RegisteredModelProvider | null;

  onMount(async () => {
    ollamaProvider = await DB.registeredModelProviders.getByProvider("ollama");
  });

  let showPassword = false;
  let is_enabled = false;

  $: {
    if (ollamaProvider) {
      is_enabled = ollamaProvider.is_enabled;
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  interface FormData {
    name: string;
    url?: string;
    api_key?: string;
    enabled: boolean;
  }

  let saved: boolean = false;

  async function saveProvider(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as unknown as FormData;
    if (data && data.api_key && data.name && data.url) {
      await DB.registeredModelProviders.update(ollamaProvider?.id!, {
        api_key: data.api_key,
        api_url: data.url,
      });

      if (is_enabled) {
        await DB.registeredModelProviders.enable(
          ollamaProvider?.model_provider!
        );
      } else if (!is_enabled) {
        await DB.registeredModelProviders.disable(
          ollamaProvider?.model_provider!
        );
      }

      saved = true;
      setTimeout(() => {
        saved = false;
      }, 2000);
    }
  }
</script>

{#if ollamaProvider}
  <div class="flex flex-col gap-4">
    <div>
      {ollamaProvider.name} Settings
    </div>
    <form on:submit={saveProvider}>
      <div class="flex flex-col gap-4 w-1/2">
        <div class="flex flex-col gap-2">
          <Label for="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={ollamaProvider.name}
            class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9"
            readonly
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="api_key">API Key</Label>
          <div class="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="api_key"
              name="api_key"
              value={ollamaProvider.api_key}
              class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9"
              readonly
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
          <Label for="url">URL</Label>
          <Input
            type="text"
            id="url"
            name="url"
            value={ollamaProvider.api_url}
            class="focus-visible:ring-offset-0 focus-visible:ring-slate-50/50 focus-visible:ring-0 outline-none bg-muted/80 h-9"
            required
          />
        </div>
        <div
          class="flex flex-row items-center justify-between rounded-lg border p-4"
        >
          <div class="space-y-0.5 flex flex-col gap-2">
            <Label for="is_enabled">Enable Provider</Label>
            <span class="text-sm text-muted-foreground"
              >Enabling the provider will make it available to the chatbot</span
            >
          </div>
          <Switch
            id="is_enabled"
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
