<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Tabs from "$lib/components/ui/tabs";
  import DB, { type RegisteredModelProvider } from "$lib/db";
  import { providers } from "$lib/llm-providers";
  import { onMount } from "svelte";
  import { Button } from "../ui/button";
  import { Eye, EyeOff } from "lucide-svelte";

  let showPassword = false;

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  let registeredProviders: RegisteredModelProvider[];

  onMount(async () => {
    registeredProviders = await DB.registeredModelProviders.list();
    // get only first 2 providers
    registeredProviders = registeredProviders.slice(0, 2);
  });

  let selectedProvider: string = providers[0].value;

  interface FormData {
    name: string;
    url?: string;
    api_key?: string;
  }

  async function saveProvider(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as unknown as FormData;
    if (data && data.api_key && data.name && data.url) {
      await DB.executeQuery(
        "UPDATE registered_model_providers SET is_enabled = 1 WHERE model_provider = ?",
        [data.name]
      );
    }
    location.reload();
  }
</script>

<div class="flex items-center justify-center min-h-screen">
  <div class="flex flex-col items-center justify-center gap-12 w-full max-w-lg">
    <h1 class="text-3xl font-semibold text-center">
      Configure Model Providers
    </h1>

    {#if registeredProviders && registeredProviders.length > 0}
      <Tabs.Root
        value={selectedProvider}
        class="w-[400px] flex flex-col gap-12 border rounded-lg p-4 pt-10 bg-muted/30"
      >
        <Tabs.List class="bg-transparent gap-2 flex justify-center">
          {#each providers.slice(0, 2) as provider}
            <Tabs.Trigger
              value={provider.value}
              class="data-[state=active]:bg-muted rounded-lg grid w-full py-4"
            >
              <div
                class="flex flex-col items-center justify-center gap-2 w-full"
              >
                <svelte:component
                  this={provider.logo}
                  class="stroke-white w-9 h-9 fill-white"
                />
                <p class="text-center">{provider.name}</p>
              </div>
            </Tabs.Trigger>
          {/each}
        </Tabs.List>

        <Tabs.Content value="ollama" class="w-full space-y-4">
          <form class="w-full space-y-4" on:submit={saveProvider}>
            <div class="flex w-full flex-col gap-3">
              <input
                type="text"
                hidden
                name="name"
                value={registeredProviders.find(
                  (p) => p.model_provider === "ollama"
                )?.model_provider}
              />
              <input
                type="text"
                hidden
                name="api_key"
                value={registeredProviders.find(
                  (p) => p.model_provider === "ollama"
                )?.api_key}
              />
              <Label for="url">URL</Label>
              <Input
                type="text"
                name="url"
                id="url"
                placeholder="Ollama URL"
                class="focus-visible:ring-offset-0 focus-visible:ring-1 outline-none bg-muted/40"
                value={registeredProviders.find(
                  (provider) => provider.model_provider === "ollama"
                )?.api_url}
                required
              />
              <span class="text-xs text-gray-500"
                >If you're not sure, leave it as is</span
              >
            </div>
            <Button class="w-full" variant="secondary" type="submit"
              >Save</Button
            >
          </form>
        </Tabs.Content>

        <Tabs.Content value="openai" class="w-full space-y-4">
          <form class="w-full space-y-4">
            <div class="flex w-full flex-col gap-3">
              <input
                type="text"
                hidden
                name="name"
                value={registeredProviders.find(
                  (p) => p.model_provider === "openai"
                )?.model_provider}
              />
              <input
                type="text"
                hidden
                name="api_key"
                value={registeredProviders.find(
                  (p) => p.model_provider === "openai"
                )?.api_key}
              />
              <Label for="open_ai_api_key">API Key</Label>
              <div class="relative flex flex-col gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="api_key"
                  id="open_ai_api_key"
                  placeholder="sk-..."
                  class="focus-visible:ring-offset-0 focus-visible:ring-1 outline-none bg-muted/40 pr-12"
                  required
                  value={registeredProviders.find(
                    (provider) => provider.model_provider === "openai"
                  )?.api_key}
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-3 bg-muted rounded-lg"
                  on:click={togglePasswordVisibility}
                >
                  {#if showPassword}
                    <EyeOff class="h-5 w-5 text-gray-500" />
                  {:else}
                    <Eye class="h-5 w-5 text-gray-500" />
                  {/if}
                </button>
              </div>
              <span class="text-xs text-gray-500"
                >Get your API key from <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  ><span class="underline text-blue-500">OpenAI</span></a
                ></span
              >
            </div>
            <Button class="w-full" variant="secondary" type="submit"
              >Save</Button
            >
          </form>
        </Tabs.Content>
      </Tabs.Root>
    {/if}
  </div>
</div>
