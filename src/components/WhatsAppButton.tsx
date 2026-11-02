import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

const DEFAULT_PHONE = "221784326486";
const DEFAULT_MSG =
  "Bonjour Les Logements de Zeyna ! Je suis à la recherche d’un logement étudiant à Saint-Louis, à proximité de l’UGB. Pourriez-vous m’aider à trouver un logement disponible et me communiquer les informations sur les tarifs et les conditions de location ? Merci !";

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = DEFAULT_PHONE,
  defaultMessage = DEFAULT_MSG,
}) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="Assistance WhatsApp">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Les Logements de Zeyna sur WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group font-medium text-sm"
      >
        <MessageCircle className="h-5 w-5 fill-white text-[#25D366] group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline font-ui tracking-wide">
          Besoin d'aide ? <strong>WhatsApp</strong>
        </span>
      </a>
    </aside>
  );
};

export default WhatsAppButton;
