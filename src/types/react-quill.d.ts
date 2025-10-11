declare module 'react-quill' {
  import * as React from 'react';
  // Minimal props we use in this project
  export interface QuillProps {
    value?: string;
    onChange?: (value: string, delta?: any, source?: any, editor?: any) => void;
    placeholder?: string;
    theme?: string;
    modules?: any;
    formats?: string[];
  }

  const ReactQuill: React.ComponentType<QuillProps>;
  export default ReactQuill;
}
