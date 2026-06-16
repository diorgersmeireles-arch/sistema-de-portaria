/// <reference types="vite/client" />

// Declaração para importação de arquivos CSS
declare module "*.css" {
  const content: string;
  export default content;
}
