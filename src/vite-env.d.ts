/// <reference types="vite/client" />

declare module 'quill-image-resize-module-react' {
  const ImageResize: any;
  export default ImageResize;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}