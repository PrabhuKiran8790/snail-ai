<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import DB, { type Conversation, type RegisteredModelProvider } from "$lib/db";
  import { cartaCodeCopy } from "$lib/carta";
  import "$lib/markdown.css";
  import { Carta } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";
  import "katex/dist/katex.css";
  import { code } from "@cartamd/plugin-code";
  import "@cartamd/plugin-code/default.css";
  import { math } from "@cartamd/plugin-math";
  import OpenAI from "openai";
  import MessageList from "./messages.svelte";
  import Header from "./header.svelte";
  import InputArea from "./input-area.svelte";
  import Groq from "groq-sdk";

  import {
    chatDetailsUpdated as chatDetailsUpdatedStore,
    isStreaming,
    selectedModel,
    selectedModelProvider,
  } from "$lib/stores";
  import type { Stream as OpenAIStream } from "openai/streaming.mjs";
  import { transformMessagesForOpenAI, type Message } from "$lib/utils";
  import { openaiClient } from "$lib/llm-providers";
  import type { Stream } from "groq-sdk/lib/streaming.mjs";

  export let id: number | null;
  export let chatUpdated: boolean = false;
  export let chatDetailsUpdated: boolean = false;

  let groq: Groq;

  let userPrompt: string = "";
  let uploadedImageSrc: string = "";
  let messages: Message[] = [];
  let isStreamingStarted: boolean = false;
  let textarea: HTMLTextAreaElement;
  let response:
    | Stream<Groq.Chat.Completions.ChatCompletionChunk>
    | OpenAIStream<OpenAI.Chat.Completions.ChatCompletionChunk>;
  let openAIClient: OpenAI;

  let autoScroll: boolean = true;
  let scrollRef: HTMLDivElement | null = null;
  let chat: Conversation | null = null;

  const carta = new Carta({
    sanitizer: DOMPurify.sanitize,
    extensions: [math(), code({ theme: "min-dark" })],
    shikiOptions: {
      themes: ["min-dark"],
    },
  });

  let registerdModels: RegisteredModelProvider[] = [];

  onMount(async () => {
    textarea.focus();
    cartaCodeCopy();

    registerdModels = await DB.registeredModelProviders.list();
    const enabledModels = registerdModels.filter((model) => model.is_enabled);
    if (enabledModels.length > 0) {
      $selectedModelProvider = enabledModels[0].model_provider;
    }
  });

  afterUpdate(() => {
    textarea.focus();
    if (autoScroll) {
      scrollToBottom();
    }
  });

  $: if (!id || id || chatDetailsUpdated) {
    loadMessages(id!);
    chatDetailsUpdated = false;
  }

  function scrollToBottom() {
    if (autoScroll && scrollRef) {
      scrollRef.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function loadMessages(chatId: number) {
    chat = await DB.conversations.get(chatId);
    if (chat) {
      messages = JSON.parse(chat.messages);
      $chatDetailsUpdatedStore = false;
      $selectedModel = chat.model_name;
      $selectedModelProvider = chat.model_provider;
    } else {
      messages = [];
    }
  }

  async function updateDatabase() {
    if (id) {
      await DB.conversations.update(id, {
        messages: JSON.stringify(messages),
        model_name: $selectedModel,
      });
    }
  }

  function removeErrorMessages() {
    messages = messages.filter((msg) => msg.role !== "assistant-error");
  }

  async function deleteAssistantMessage(index: number) {
    if (index > 0 && messages[index - 1].role === "user") {
      messages.splice(index - 1, 2);
      messages = messages;
      await updateDatabase();

      if (!messages || messages.length === 0) {
        await DB.conversations.delete(id!);
        id = null;
        chatUpdated = true;
      }
    }
  }

  async function regenerateMessage(index: number) {
    if (
      index > 0 &&
      messages[index].role === "assistant" &&
      messages[index - 1].role === "user"
    ) {
      userPrompt = messages[index - 1].content;
      messages.splice(index - 1, 2);
      messages = messages;
      await handleSubmit();
    }
  }

  async function handleSubmit() {
    if (!userPrompt.trim() || $isStreaming) return;
    textarea.style.height = "40px";

    removeErrorMessages();
    autoScroll = true;
    let userMessage: Message = { role: "user", content: userPrompt };
    if (uploadedImageSrc) {
      const imageSrc = uploadedImageSrc.split(",")[1];
      userMessage = { ...userMessage, images: [imageSrc] };
    }

    messages = [...messages, userMessage];

    if (!id) {
      id = await DB.conversations.create(
        userPrompt.slice(0, 50),
        "",
        $selectedModel,
        $selectedModelProvider
      );
    }

    await updateDatabase();
    chatUpdated = true;
    userPrompt = "";
    uploadedImageSrc = "";

    try {
      $isStreaming = true;
      isStreamingStarted = true;
      uploadedImageSrc = "";

      const transformedMessages = transformMessagesForOpenAI(messages);

      if ($selectedModelProvider === "openai") {
        openAIClient = openaiClient({
          apiKey: registerdModels.find(
            (model) => model.model_provider === "openai"
          )?.api_key!,
          baseURL: registerdModels.find(
            (model) => model.model_provider === "openai"
          )?.api_url!,
        });
      } else if ($selectedModelProvider === "ollama") {
        openAIClient = openaiClient({
          apiKey: registerdModels.find(
            (model) => model.model_provider === "ollama"
          )?.api_key!,
          baseURL: registerdModels.find(
            (model) => model.model_provider === "ollama"
          )?.api_url!,
        });
      } else if ($selectedModelProvider === "groq") {
        groq = new Groq({
          apiKey: registerdModels.find(
            (model) => model.model_provider === "groq"
          )?.api_key!,
          dangerouslyAllowBrowser: true,
        });
      }

      if (
        $selectedModelProvider === "ollama" ||
        $selectedModelProvider === "openai"
      ) {
        response = await openAIClient.chat.completions.create({
          model: $selectedModel,
          messages: transformedMessages,
          stream: true,
        });

        let assistantMessage: Message = { role: "assistant", content: "" };
        messages = [...messages, assistantMessage];

        for await (const part of response) {
          isStreamingStarted = false;
          assistantMessage.content += part.choices[0]?.delta?.content || "";
          messages = messages;
        }
      } else if ($selectedModelProvider === "groq") {
        response = await groq.chat.completions.create({
          model: $selectedModel,
          messages: messages as any,
          stream: true,
        });

        let assistantMessage: Message = { role: "assistant", content: "" };
        messages = [...messages, assistantMessage];
        messages = messages;

        for await (const part of response) {
          isStreamingStarted = false;
          assistantMessage.content += part.choices[0]?.delta?.content || "";
          messages = messages;
        }
      }

      await updateDatabase();
      chatUpdated = false;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name !== "AbortError") {
          console.error("Error getting AI response:", error);
          messages = [
            ...messages,
            {
              role: "assistant-error",
              content: error.message,
            },
          ];
        } else {
          await updateDatabase();
        }
      }
    } finally {
      $isStreaming = false;
      isStreamingStarted = false;
      chatUpdated = false;
      $chatDetailsUpdatedStore = false;
      uploadedImageSrc = "";
    }
  }

  $: {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }
</script>

<div
  class="flex flex-col gap-4 items-center justify-center h-full w-full relative"
>
  {#if !messages || !messages.length}
    <Header />
  {:else}
    <MessageList
      {messages}
      {isStreamingStarted}
      {deleteAssistantMessage}
      {regenerateMessage}
      {carta}
    />
  {/if}
  <InputArea
    bind:userPrompt
    bind:uploadedImageSrc
    bind:textarea
    bind:response
    {handleSubmit}
  />
</div>
