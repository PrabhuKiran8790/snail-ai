<script lang="ts">
  import { onMount } from "svelte";
  import DB, { type Conversation } from "$lib/db";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { textareaAutosizeAction } from "svelte-legos";
  import {
    chatDetailsUpdated as chatDetailsUpdatedStore,
    isStreaming,
  } from "$lib/stores";

  export let id: number | null = null;
  export let chatDetailsUpdated: boolean = false;

  let chatDetails = {
    conversation_name: "",
    system_message: "",
    is_favorite: false,
  };

  let originalChatDetails = {
    conversation_name: "",
    system_message: "",
    is_favorite: false,
  };

  let chat: Conversation | null = null;
  let showUndoButton = false;

  $: isDisabled = chatDetails.conversation_name.length === 0;

  $: {
    showUndoButton =
      chatDetails.conversation_name !== originalChatDetails.conversation_name ||
      chatDetails.system_message !== originalChatDetails.system_message ||
      chatDetails.is_favorite !== originalChatDetails.is_favorite;
  }

  onMount(() => {
    if (id) {
      loadChat(id);
    }
  });

  $: {
    if (id !== null || chatDetailsUpdated) {
      loadChat(id!);
    }
  }

  $: {
    if ($chatDetailsUpdatedStore) {
      loadChat(id!);
    }
  }

  async function loadChat(chatId: number) {
    if (!chatId) {
      chat = null;
      return;
    }
    chat = await DB.conversations.get(chatId);
    if (chat) {
      chatDetails = {
        conversation_name: chat.conversation_name,
        system_message: chat.system_message,
        is_favorite: chat.is_favorite,
      };
      originalChatDetails = { ...chatDetails };
    }
  }

  async function updateDatabase() {
    if (!id) return;

    $chatDetailsUpdatedStore = false;
    chatDetailsUpdated = false;

    let updatedChat = await DB.conversations.get(id);
    if (!updatedChat) return;

    let messages = JSON.parse(updatedChat.messages);
    messages = updateSystemMessage(messages);

    await DB.conversations.update(id, {
      ...updatedChat,
      conversation_name: chatDetails.conversation_name,
      system_message: chatDetails.system_message,
      is_favorite: chatDetails.is_favorite,
      messages: JSON.stringify(messages),
    });

    if (!messages || messages.length === 0) {
      await DB.conversations.delete(id);
      id = null;
    }

    $chatDetailsUpdatedStore = true;
    chatDetailsUpdated = true;
    originalChatDetails = { ...chatDetails };
  }

  function updateSystemMessage(messages: any[]) {
    if (chatDetails.system_message && chatDetails.system_message.length > 0) {
      const systemMessageIndex = messages.findIndex(
        (msg) => msg.role === "system"
      );
      if (systemMessageIndex !== -1) {
        messages[systemMessageIndex].content = chatDetails.system_message;
      } else {
        messages.unshift({
          role: "system",
          content: chatDetails.system_message,
        });
      }
    } else {
      messages = messages.filter((msg) => msg.role !== "system");
    }
    return messages;
  }

  function undoChanges() {
    chatDetails = { ...originalChatDetails };
  }
</script>

<div class="p-4 pl-1 flex flex-col gap-4">
  <div class="flex flex-col gap-4 border rounded-lg w-full p-2">
    <Label for="conversation_name">Chat Name</Label>
    <input
      id="conversation_name"
      maxlength="100"
      bind:value={chatDetails.conversation_name}
      placeholder="Enter chat name"
      class="min-h-[40px] resize-none w-full h-full outline-none ring-0 border max-h-[40px] bg-muted rounded-lg p-2 focus-visible:border-zinc-700"
    />
  </div>

  <div class="flex flex-col gap-4 border rounded-lg w-full p-2">
    <Label for="system_message">System Message</Label>
    <textarea
      id="system_message"
      use:textareaAutosizeAction
      bind:value={chatDetails.system_message}
      placeholder="Enter system message"
      class="min-h-[100px] resize-none w-full h-full outline-none ring-0 border max-h-[300px] bg-muted rounded-lg p-2 focus-visible:border-zinc-700"
    />
  </div>

  <div class="w-full px-2 flex gap-2">
    {#if showUndoButton}
      <Button
        on:click={undoChanges}
        variant="outline"
        class="bg-muted hover:bg-muted/50 w-1/2 hover:border-zinc-700"
      >
        Undo
      </Button>
    {/if}
    <Button
      on:click={updateDatabase}
      disabled={$isStreaming || isDisabled}
      variant="outline"
      class="bg-muted hover:bg-muted/50 {showUndoButton
        ? 'w-1/2'
        : 'w-full'} hover:border-zinc-700"
    >
      Save
    </Button>
  </div>
</div>
