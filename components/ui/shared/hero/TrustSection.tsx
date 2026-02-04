import { Truck, ShieldCheck, RefreshCcw } from "lucide-react";

export default function TrustSection() {
  return (
    <section className="w-full bg-matte-black/60 border-y border-white/10 py-16 mb-24">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center px-6">
        {/* Livraison */}
        <div className="flex flex-col items-center">
          <div className="mb-5 rounded-full bg-white/5 p-5">
            <Truck className="h-9 w-9 text-primary" />
          </div>
          <h3 className="text-base font-bold uppercase tracking-wide text-white">
            Livraison rapide
          </h3>
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Expédition sous 24 à 48h partout en France avec suivi en temps réel.
          </p>
        </div>

        {/* Paiement */}
        <div className="flex flex-col items-center border-x border-white/10 px-6">
          <div className="mb-5 rounded-full bg-white/5 p-5">
            <ShieldCheck className="h-9 w-9 text-primary" />
          </div>
          <h3 className="text-base font-bold uppercase tracking-wide text-white">
            Paiement sécurisé
          </h3>
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Transactions protégées par un cryptage SSL et des partenaires
            fiables.
          </p>
        </div>

        {/* Retour */}
        <div className="flex flex-col items-center">
          <div className="mb-5 rounded-full bg-white/5 p-5">
            <RefreshCcw className="h-9 w-9 text-primary" />
          </div>
          <h3 className="text-base font-bold uppercase tracking-wide text-white">
            Retour facile
          </h3>
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Vous disposez de 14 jours pour changer d’avis, simplement et sans
            stress.
          </p>
        </div>
      </div>
    </section>
  );
}
