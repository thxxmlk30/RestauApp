export default function Footer() {
  return (
    <footer className="bg-secondary-900 px-4 py-10 text-gray-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center sm:text-left lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm">© {new Date().getFullYear()} Linguere. Tous droits reserves.</p>
        <p className="text-sm">Dakar · Cuisine senegalaise · Teranga</p>
      </div>
    </footer>
  );
}
