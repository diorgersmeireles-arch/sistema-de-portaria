// Footer - Rodapé institucional presente em todas as telas do sistema

import { Separator } from "@/components/ui/separator";

/**
 * Rodapé fixo com a marca institucional obrigatória:
 * "Sistema de Portaria - João XXIII | Desenvolvido pela MADev"
 */
export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <Separator />
      <div className="container mx-auto px-4 py-3 text-center text-sm text-muted-foreground">
        Sistema de Portaria - João XXIII | Desenvolvido pela MADev
      </div>
    </footer>
  );
}
