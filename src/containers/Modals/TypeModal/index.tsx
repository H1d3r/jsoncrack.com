import React from "react";
import { Stack, Modal, ModalProps, Select, LoadingOverlay } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import useJson from "src/store/useJson";

enum Language {
  TypeScript = "typescript",
  TypeScript_Combined = "typescript/typealias",
  Go = "go",
  JSON_SCHEMA = "json_schema",
  Kotlin = "kotlin",
  Rust = "rust",
}

const typeOptions = [
  {
    label: "TypeScript",
    value: Language.TypeScript,
    lang: "typescript",
  },
  {
    label: "TypeScript (combined)",
    value: Language.TypeScript_Combined,
    lang: "typescript",
  },
  {
    label: "Go",
    value: Language.Go,
    lang: "go",
  },
  {
    label: "JSON Schema",
    value: Language.JSON_SCHEMA,
    lang: "json",
  },
  {
    label: "Kotlin",
    value: Language.Kotlin,
    lang: "kotlin",
  },
  {
    label: "Rust",
    value: Language.Rust,
    lang: "rust",
  },
];

export const TypeModal: React.FC<ModalProps> = ({ opened, onClose }) => {
  const getJson = useJson(state => state.getJson);
  const [type, setType] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<Language>(Language.TypeScript);
  const [loading, setLoading] = React.useState(false);

  const editorLanguage = React.useMemo(() => {
    return typeOptions[typeOptions.findIndex(o => o.value === selectedType)]?.lang;
  }, [selectedType]);

  React.useEffect(() => {
    if (opened) {
      (async () => {
        try {
          setLoading(true);
          const json = getJson();

          if (selectedType === Language.Go) {
            const jtg = await import("src/lib/utils/json2go");
            const gofmt = await import("gofmt.js");

            const types = jtg.default(json);
            setType(gofmt.default(types.go));
          } else {
            const { run } = await import("json_typegen_wasm");
            const output_mode = selectedType;
            const types = run("Root", json, JSON.stringify({ output_mode }));

            setType(types);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [getJson, opened, selectedType]);

  return (
    <Modal title="Generate Types" size="md" opened={opened} onClose={onClose} centered>
      <Stack pos="relative">
        <Select
          value={selectedType}
          data={typeOptions}
          onChange={e => setSelectedType(e as Language)}
        />
        <LoadingOverlay visible={loading} />
        <CodeHighlight
          language={editorLanguage}
          copyLabel="Copy to clipboard"
          copiedLabel="Copied to clipboard"
          code={type}
        />
      </Stack>
    </Modal>
  );
};
