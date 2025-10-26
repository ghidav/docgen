"use client"

import React, { createContext, useContext, ReactNode } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";

export type StateType = { messages: Message[] };

const useTypedStream = useStream<StateType>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

const LANGGRAPH_URL = process.env.NEXT_PUBLIC_LANGGRAPH_URL || 'http://localhost:8123';
const ASSISTANT_ID = 'main';

export const StreamProvider: React.FC<{
  children: ReactNode;
  threadId: string | null;
}> = ({ children, threadId }) => {
  const streamValue = useTypedStream({
    apiUrl: LANGGRAPH_URL,
    assistantId: ASSISTANT_ID,
    threadId: threadId ?? null,
  });

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
