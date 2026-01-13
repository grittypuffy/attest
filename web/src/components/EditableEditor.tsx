"use client";

import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import NestedList from "@editorjs/nested-list";
import { useEffect, useRef } from "react";

type Props = {
  data: OutputData;
  onChange?: (data: OutputData) => void;
  holder?: string;
};

const EditableEditor = ({ data, onChange, holder = "editable-editor" }: Props) => {
  const ref = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: {
          header: Header,
          list: List,
          nestedList: NestedList,
        },
        data: data,
        readOnly: false,
        minHeight: 300,
        placeholder: "Start writing your proposal description here...",
        onChange: async () => {
          if (ref.current && onChange) {
            try {
              const outputData = await ref.current.save();
              onChange(outputData);
            } catch (error) {
              console.error("Error saving editor data:", error);
            }
          }
        },
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && typeof ref.current.destroy === "function") {
        ref.current.destroy();
        ref.current = null;
      }
    };
  }, []);

  return <div id={holder} className="prose max-w-none w-full" />;
};

export default EditableEditor;
