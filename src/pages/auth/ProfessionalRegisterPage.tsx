import type { ToastMessage } from '../../types/models'

interface ProfessionalRegisterPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function ProfessionalRegisterPage({ navigate }: ProfessionalRegisterPageProps) {
  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header"><h1>Cadastro profissional</h1></div>
        <p>O cadastro de barbeiros é realizado por convite da administração da barbearia.</p>
        <button className="register-button" onClick={() => navigate('/auth/professional-login')}>
          Ir para o login
        </button>
      </div>
    </div>
  )
}
