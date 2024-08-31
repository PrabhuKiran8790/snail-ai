import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import type OpenAI from "openai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (
    style: Record<string, number | string | undefined>
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, "");
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t,
      });
    },
    easing: cubicOut,
  };
};

export function clickOutside(node: HTMLElement, handler: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      handler();
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}

export type Message = {
  role: "user" | "assistant" | "system" | "assistant-error";
  content: string;
  images?: string[];
};

export function getImageType(base64String: string) {
  if (base64String.startsWith("iVBORw0KGgo")) {
    return "image/png";
  } else if (
    base64String.startsWith("/9j/") ||
    base64String.startsWith("/8/")
  ) {
    return "image/jpeg";
  } else if (base64String.startsWith("R0lGOD")) {
    return "image/gif";
  } else if (base64String.startsWith("Qk")) {
    return "image/bmp";
  } else {
    throw new Error("Unknown image type");
  }
}

export function transformMessagesForOpenAI(
  messages: Message[]
): OpenAI.Chat.ChatCompletionMessageParam[] {
  return messages.map((msg) => {
    if (msg.role === "user" && msg.images && msg.images.length > 0) {
      const content: OpenAI.Chat.ChatCompletionContentPart[] = [
        { type: "text", text: msg.content },
      ];

      msg.images.forEach((image) => {
        const imageType = getImageType(image);
        content.push({
          type: "image_url",
          image_url: {
            url: `data:${imageType};base64,${image}`,
          },
        });
      });

      return {
        role: msg.role,
        content: content,
      };
    }

    return {
      role: msg.role === "assistant-error" ? "assistant" : msg.role,
      content: [{ type: "text", text: msg.content }],
    };
  });
}

export function toGB(bytes: number) {
  return Number((bytes / 1024 / 1024 / 1024).toFixed(2));
}
