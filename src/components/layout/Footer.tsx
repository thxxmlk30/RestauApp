export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-gray-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">© {new Date().getFullYear()} THE Mbaxxal. Tous droits réservés.</p>
        <p className="text-sm">Dakar · Cuisine sénégalaise · Teranga</p>
      </div>
    </footer>
  );
}