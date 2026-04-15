import { type ReactNode } from "react";

interface EditorProps {
  children: ReactNode;
}

export default function Editor({ children }: EditorProps) {
  return (
    <main className="editor-area">
      <div className="editor-content">
        <article className="content">{children}</article>
      </div>
    </main>
  );
}
