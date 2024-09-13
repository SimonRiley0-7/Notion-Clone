import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useEdgeStore } from "@/lib/edgestore";

async function saveToStorage(jsonBlocks: Block[]) {
  // Save contents to local storage. You might want to debounce this or replace
  // with a call to your API / database.
  localStorage.setItem("editorContent", JSON.stringify(jsonBlocks));
}

async function loadFromStorage() {
  // Gets the previously stored editor contents.
  const storageString = localStorage.getItem("editorContent");
  return storageString ? (JSON.parse(storageString) as PartialBlock[]) : undefined;
}

function clearStorage() {
  localStorage.removeItem("editorContent");
}

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  newPage?: boolean;
}

const Editor = ({ onChange, initialContent, editable, newPage }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [initialContentState, setInitialContentState] = useState<PartialBlock[] | undefined | "loading">("loading");

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  // Loads the previously stored editor contents.
  useEffect(() => {
    if (newPage) {
      clearStorage();
      setInitialContentState([]);
    } else {
      loadFromStorage().then((content) => {
        setInitialContentState(content || []);
      });
    }
  }, [newPage]);

  // Creates a new editor instance.
  const editor = useMemo(() => {
    if (initialContentState === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({
      initialContent: initialContentState && initialContentState.length > 0 
        ? initialContentState 
        : [{ type: "paragraph", content: "" }],
      uploadFile: handleUpload
    });
  }, [initialContentState]);

  // Ensure the onChange effect runs only when the editor is ready

  if (initialContentState === "loading" || !editor) {
    return "Loading content...";
  }

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
};
export default Editor;