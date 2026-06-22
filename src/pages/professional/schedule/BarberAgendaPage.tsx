import type { ToastMessage } from '../../../types/models'
import { StaffWeekAgendaPage } from '../../shared/StaffWeekAgendaPage'

interface BarberAgendaPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BarberAgendaPage({ navigate, notify }: BarberAgendaPageProps) {
  return <StaffWeekAgendaPage mode="barber" navigate={navigate} notify={notify} />
}
