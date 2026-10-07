import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Exercices de programmation C en ligne | MPI",
  alternates: { canonical: "https://mpi-informatique.github.io/c/" },
  description: "Exercices progressifs de programmation C pour la prépa MPI : écrire, compiler, exécuter et vérifier son code directement dans le navigateur.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
