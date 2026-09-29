// Public settings for the website. Everything here is safe to be public.
// NEVER put a secret key (sb_secret_...) or the Daily API key in this file.
window.COMPAS_CONFIG = {
  brand: "Compás",
  siteUrl: "https://juangonzalezrochin.github.io/Compas-music/",
  supabaseUrl: "https://lasqkhtyfcjswvajnqzd.supabase.co",
  supabaseKey: "sb_publishable_qrkLsJHtqn7kqJFIXMNF3Q_viCvWzx0",
  instruments: [
    { id: "guitar", es: "Guitarra", en: "Guitar" },
    { id: "piano", es: "Piano y teclado", en: "Piano & keyboard" },
  ],
  plans: [
    { id: "complete", es: "Completo", en: "Complete" },
    { id: "group-basic", es: "Grupal Básico", en: "Group Basic" },
    { id: "group-plus", es: "Grupal Plus", en: "Group Plus" },
    { id: "private-essential", es: "Privado Esencial", en: "Private Essential" },
    { id: "private-pro", es: "Privado Pro", en: "Private Pro" },
  ],
};
