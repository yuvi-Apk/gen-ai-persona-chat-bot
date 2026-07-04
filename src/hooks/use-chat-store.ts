"use client";

import { useCallback, useMemo, useReducer } from "react";
import { PERSONAS } from "@/lib/personas";
import { sendMessage } from "@/lib/send-message";
import { ChatImage, ChatMessage, Conversation, PersonaId } from "@/lib/types";

interface State {
  activePersonaId: PersonaId;
  activeConversationId: string | null;
  conversations: Record<string, Conversation>;
  typingConversationId: string | null;
}

type Action =
  | { type: "SELECT_PERSONA"; personaId: PersonaId }
  | { type: "SELECT_CONVERSATION"; conversationId: string }
  | { type: "NEW_CONVERSATION"; personaId: PersonaId }
  | { type: "ADD_MESSAGE"; conversationId: string; message: ChatMessage }
  | { type: "SET_TYPING"; conversationId: string | null };

function makeConversation(personaId: PersonaId): Conversation {
  const persona = PERSONAS[personaId];
  return {
    id: crypto.randomUUID(),
    personaId,
    title: "New chat",
    updatedAt: Date.now(),
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: persona.greeting,
        createdAt: Date.now(),
      },
    ],
  };
}

function titleFromMessage(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "New chat";
  return trimmed.length > 32 ? `${trimmed.slice(0, 32)}…` : trimmed;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_PERSONA": {
      const existing = Object.values(state.conversations).find(
        (c) => c.personaId === action.personaId
      );
      if (existing) {
        return {
          ...state,
          activePersonaId: action.personaId,
          activeConversationId: existing.id,
        };
      }
      const fresh = makeConversation(action.personaId);
      return {
        ...state,
        activePersonaId: action.personaId,
        activeConversationId: fresh.id,
        conversations: { ...state.conversations, [fresh.id]: fresh },
      };
    }
    case "SELECT_CONVERSATION": {
      const convo = state.conversations[action.conversationId];
      if (!convo) return state;
      return {
        ...state,
        activeConversationId: convo.id,
        activePersonaId: convo.personaId,
      };
    }
    case "NEW_CONVERSATION": {
      const fresh = makeConversation(action.personaId);
      return {
        ...state,
        activePersonaId: action.personaId,
        activeConversationId: fresh.id,
        conversations: { ...state.conversations, [fresh.id]: fresh },
      };
    }
    case "ADD_MESSAGE": {
      const convo = state.conversations[action.conversationId];
      if (!convo) return state;
      const isFirstUserMessage =
        action.message.role === "user" &&
        !convo.messages.some((m) => m.role === "user");
      const updated: Conversation = {
        ...convo,
        title: isFirstUserMessage
          ? titleFromMessage(action.message.content)
          : convo.title,
        messages: [...convo.messages, action.message],
        updatedAt: Date.now(),
      };
      return {
        ...state,
        conversations: { ...state.conversations, [updated.id]: updated },
      };
    }
    case "SET_TYPING":
      return { ...state, typingConversationId: action.conversationId };
    default:
      return state;
  }
}

function initState(): State {
  const first = makeConversation("hitesh");
  return {
    activePersonaId: "hitesh",
    activeConversationId: first.id,
    conversations: { [first.id]: first },
    typingConversationId: null,
  };
}

export function useChatStore() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  const conversationList = useMemo(
    () =>
      Object.values(state.conversations).sort(
        (a, b) => b.updatedAt - a.updatedAt
      ),
    [state.conversations]
  );

  const activeConversation = state.activeConversationId
    ? state.conversations[state.activeConversationId]
    : null;

  const isTyping = state.typingConversationId === state.activeConversationId;

  const selectPersona = useCallback((personaId: PersonaId) => {
    dispatch({ type: "SELECT_PERSONA", personaId });
  }, []);

  const selectConversation = useCallback((conversationId: string) => {
    dispatch({ type: "SELECT_CONVERSATION", conversationId });
  }, []);

  const startNewChat = useCallback((personaId: PersonaId) => {
    dispatch({ type: "NEW_CONVERSATION", personaId });
  }, []);

  const sendUserMessage = useCallback(
    async (text: string, images?: ChatImage[]) => {
      if (!state.activeConversationId) return;
      const conversationId = state.activeConversationId;
      const personaId = state.activePersonaId;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        images,
        createdAt: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", conversationId, message: userMessage });
      dispatch({ type: "SET_TYPING", conversationId });

      try {
        const history = [
          ...(state.conversations[conversationId]?.messages ?? []),
          userMessage,
        ];
        const result = await sendMessage(personaId, history);
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.content,
          createdAt: Date.now(),
        };
        dispatch({ type: "ADD_MESSAGE", conversationId, message: assistantMessage });
      } finally {
        dispatch({ type: "SET_TYPING", conversationId: null });
      }
    },
    [state.activeConversationId, state.activePersonaId, state.conversations]
  );

  return {
    activePersonaId: state.activePersonaId,
    activeConversation,
    conversationList,
    isTyping,
    selectPersona,
    selectConversation,
    startNewChat,
    sendUserMessage,
  };
}
