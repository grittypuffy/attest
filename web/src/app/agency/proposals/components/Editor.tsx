"use client";

import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import { useEffect, useRef } from "react";

type Props = {
  data: OutputData;
};

const Editor = ({ data }: Props) => {
  const ref = useRef<EditorJS | null>(null);
  const holderId = "editorjs-container";

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holderId,
        tools: {
          header: Header,
        },
        data: data,
        readOnly: true,
        minHeight: 0,
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && typeof ref.current.destroy === "function") {
        ref.current.destroy();
        ref.current = null;
      }
    };
  }, [data]);

  return <div id={holderId} className="prose max-w-none w-full" />;
};

export default Editor;
