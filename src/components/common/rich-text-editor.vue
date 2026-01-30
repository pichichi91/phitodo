<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="editor-toolbar">
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="Bullet list"
      >
        •
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        title="Numbered list"
      >
        1.
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('link') }"
        @click="toggleLink"
        title="Link"
      >
        Link
      </button>
    </div>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { watch, onBeforeUnmount } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editor = useEditor({
  content: props.modelValue || "<p></p>",
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" }
    })
  ],
  editorProps: {
    attributes: {
      class: "prose-inner",
      "data-placeholder": "Optional details…"
    }
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    emit("update:modelValue", html === "<p></p>" ? "" : html);
  }
});

function toggleLink() {
  if (!editor.value) return;
  if (editor.value.isActive("link")) {
    editor.value.chain().focus().unsetLink().run();
    return;
  }
  const url = window.prompt("URL");
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run();
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    const next = val && val.trim() ? val : "<p></p>";
    if (current !== next) {
      editor.value.commands.setContent(next, false);
    }
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.rich-text-editor {
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 2px;
  padding: 4px 6px;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
  background: rgba(31, 41, 55, 0.5);
}

.toolbar-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;
}

.toolbar-btn:hover {
  background: rgba(55, 65, 81, 0.6);
  color: #e5e7eb;
}

.toolbar-btn.active {
  background: rgba(79, 70, 229, 0.3);
  color: #a5b4fc;
}

.editor-content {
  min-height: 80px;
}

.editor-content :deep(.ProseMirror) {
  padding: 8px 10px;
  min-height: 72px;
  font-size: 13px;
  color: #e5e7eb;
  outline: none;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #6b7280;
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 1.5em;
}

.editor-content :deep(.ProseMirror a) {
  color: #93c5fd;
  text-decoration: underline;
}
</style>
