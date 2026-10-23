
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  /** `false` oculta la cuenta de demostración de la pantalla de acceso. */
  readonly VITE_MOSTRAR_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
