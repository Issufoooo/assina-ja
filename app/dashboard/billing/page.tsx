export default function BillingPage() {
  return (
    <main className="flex flex-col gap-6 p-6">

      <div className="glass rounded-2xl p-6 flex flex-col gap-3">
        <h1 className="text-xl font-bold text-ink-primary">
          Plano atual
        </h1>

        <p className="text-sm text-ink-secondary">
          Estás no plano de teste gratuito (3 meses).
        </p>

        <div className="mt-2 text-sm text-ink-muted">
          Após o período de teste, o valor será:
        </div>

        <div className="text-2xl font-bold text-primary">
          600 MT / mês
        </div>
      </div>

      <div className="glass rounded-2xl p-6 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink-primary">
          Pagamento
        </h2>

        <p className="text-sm text-ink-secondary">
          Para continuar a usar o sistema após o período de teste,
          será necessário efetuar o pagamento.
        </p>

        <button className="btn-primary mt-3 h-12 rounded-xl">
          Pagar agora
        </button>
      </div>

    </main>
  )
}