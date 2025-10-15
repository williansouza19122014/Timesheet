const Forbidden = () => (
  <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4 text-center">
    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
      <span className="text-3xl font-semibold">403</span>
    </div>
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">Acesso negado</h1>
      <p className="text-muted-foreground">
        Vocę năo possui permissăo para visualizar esta área. Solicite acesso ao administrador do tenant.
      </p>
    </div>
  </div>
);

export default Forbidden;
