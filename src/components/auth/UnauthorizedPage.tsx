interface UnauthorizedPageProps {
  navigate: (path: string) => void
}

export function UnauthorizedPage({ navigate }: UnauthorizedPageProps) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Acesso Não Autorizado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <button onClick={() => navigate('/')}>Voltar para Home</button>
    </div>
  )
}
