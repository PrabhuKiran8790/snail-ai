<script lang="ts">
  import { cn } from "$lib/utils";
  import { ChevronLeft, Plus, Trash } from "lucide-svelte";
  import * as Resizable from "$lib/components/ui/resizable";
  import { Button } from "$lib/components/ui/button";
  import { type PaneAPI } from "paneforge";
  import { Chat, ChatDetails, SetupScreen } from "$lib/components/site";
  import DB from "$lib/db";
  import { onMount } from "svelte";
  import { selectedModel } from "$lib/stores";
  import ollama, { type ListResponse } from "ollama/browser";

  let isCollapsed = false;

  let models: ListResponse;

  function onCollapse() {
    isCollapsed = true;
    document.cookie = `PaneForge:collapsed=${true}`;
  }

  function onExpand() {
    isCollapsed = false;
    document.cookie = `PaneForge:collapsed=${false}`;
  }

  let paneTwo: PaneAPI;

  let currentChatId: number | null = null;

  let allChats: any[] = [];

  async function getAllChats() {
    allChats = await DB.conversations.list();
    if (!allChats) {
      currentChatId = null;
    }
  }

  onMount(async () => {
    await getAllChats();
    try {
      models = await ollama.list();
      if (models) {
        $selectedModel = models.models[0].name;
      } else {
        $selectedModel = "";
      }
    } catch (error) {
      $selectedModel = "";
    }
  });

  $: {
    if (currentChatId !== null) {
      getAllChats();
    }
  }

  let chatUpdated: boolean = false;
  let chatDetailsUpdated: boolean = false;

  $: {
    if (chatUpdated || chatDetailsUpdated) {
      getAllChats();
    }
  }
</script>

{#await DB.registeredModelProviders.listEnabledModelProviders() then value}
  {#if !value || value.length === 0}
    <SetupScreen />
  {:else}
    <div class="flex h-full w-full">
      <div
        class="lg:w-60 2xl:w-80 flex flex-col gap-4 h-full border-r bg-secondary/30 p-2"
      >
        <Button
          variant="outline"
          class=" rounded-lg text-secondary-foreground/80 h-16 flex flex-col gap-1 bg-secondary hover:bg-black/10 hover:outline-1 hover:outline-dashed hover:outline-secondary"
          on:click={async () => {
            currentChatId = null;
            models = await ollama.list();
            if (models) {
              $selectedModel = models.models[0].name;
            } else {
              $selectedModel = "";
            }
          }}
        >
          <Plus />
          New Chat
        </Button>
        <hr />
        <div class="flex flex-col gap-2 overflow-y-scroll">
          {#each allChats as chat}
            <div class="flex items-center justify-between gap-2 group">
              <button
                class={cn(
                  "text-start items-start justify-start flex-1 truncate  whitespace-nowrap rounded-md text-sm font-medium border transition-colors h-10 px-4 py-2",
                  chat.id === currentChatId
                    ? "bg-zinc-700 hover:bg-zinc-700"
                    : "bg-secondary hover:bg-secondary/50 hover:border-zinc-600"
                )}
                on:click={async () => {
                  currentChatId = chat.id;
                }}
              >
                {chat.conversation_name}
              </button>
              <Button
                variant="outline"
                class="hidden group-hover:flex bg-red-700 p-2 hover:bg-red-600"
                on:click={async () => {
                  await DB.conversations.delete(chat.id);
                  if (chat.id === currentChatId) {
                    currentChatId = null;
                    try {
                      models = await ollama.list();
                      $selectedModel = models.models[0].name;
                    } catch (error) {
                      $selectedModel = "";
                    }
                  }
                  getAllChats();
                }}
              >
                <Trash size={18} />
              </Button>
            </div>
          {/each}
        </div>
      </div>
      <Resizable.PaneGroup
        direction="horizontal"
        class="flex-1 flex flex-col gap-4"
      >
        <Resizable.Pane>
          <Chat
            bind:id={currentChatId}
            bind:chatUpdated
            bind:chatDetailsUpdated
          />
        </Resizable.Pane>
        <Resizable.Handle withHandle />
        <Resizable.Pane
          defaultSize={30}
          minSize={20}
          maxSize={30}
          collapsible
          collapsedSize={5}
          {onCollapse}
          {onExpand}
          bind:pane={paneTwo}
          class="h-full"
        >
          {#if isCollapsed}
            <div class="h-full py-2">
              <Button
                class="h-full"
                variant="secondary"
                on:click={() => {
                  paneTwo.expand();
                }}><ChevronLeft /></Button
              >
            </div>
          {:else if currentChatId}
            <ChatDetails bind:id={currentChatId} bind:chatDetailsUpdated />
          {/if}
        </Resizable.Pane>
      </Resizable.PaneGroup>
    </div>
  {/if}
{/await}
