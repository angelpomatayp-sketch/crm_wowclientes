const Pagination = ({ page, pageSize = 10, total = 0, onChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const clamp = (p) => Math.min(totalPages, Math.max(1, p));
  const go = (p) => onChange(clamp(p));

  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
      <p className="text-xs text-gray-400">
        Mostrando {from}-{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
        >
          Anterior
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            className={`px-3 py-1.5 text-xs rounded-lg border ${p === page ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagination;