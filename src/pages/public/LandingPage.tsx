import { useState } from 'react'
import { CalendarIcon, ClockIcon, ScissorsIcon, SearchIcon, StoreIcon, UsersIcon } from '../../components/Icons'

interface LandingPageProps {
  navigate: (path: string) => void
}

type Feature = {
  title: string
  text: string
  icon: typeof CalendarIcon
  featured?: boolean
}

type Plan = {
  name: string
  audience: string
  price: string
  cents?: string
  items: string[]
  popular?: boolean
  customPrice?: boolean
}

const features: Feature[] = [
  {
    title: 'Agenda inteligente',
    text: 'Organize todos os horários em um só lugar e evite conflitos na agenda.',
    icon: CalendarIcon,
    featured: true,
  },
  {
    title: 'Gestão de clientes',
    text: 'Histórico, preferências e frequência dos seus clientes sempre à mão.',
    icon: UsersIcon,
  },
  {
    title: 'Lembretes automáticos',
    text: 'Reduza faltas enviando confirmações antes de cada horário.',
    icon: ClockIcon,
  },
  {
    title: 'Serviços e preços',
    text: 'Cadastre cortes, combos, duração e valores para manter tudo organizado.',
    icon: ScissorsIcon,
  },
  {
    title: 'Equipe organizada',
    text: 'Cada barbeiro controla sua agenda, serviços e disponibilidade.',
    icon: StoreIcon,
  },
  {
    title: 'Relatórios completos',
    text: 'Entenda o crescimento da barbearia com dados claros e objetivos.',
    icon: SearchIcon,
  },
]

const plans: Plan[] = [
  {
    name: 'Individual',
    audience: 'Para quem trabalha sozinho',
    price: '29',
    cents: ',90',
    items: ['1 barbeiro', 'Agenda online', 'Link de agendamento', 'Gestão de clientes'],
  },
  {
    name: 'Profissional',
    audience: 'Para barbearias em crescimento',
    price: '49',
    cents: ',90',
    items: ['De 2 a 5 barbeiros', 'Agenda online', 'Link de agendamento', 'Gestão de clientes'],
    popular: true,
  },
  {
    name: 'Premium',
    audience: 'Para equipes maiores',
    price: 'Sob consulta',
    items: ['Quantidade combinada', 'Agenda online', 'Link de agendamento', 'Gestão de clientes'],
    customPrice: true,
  },
]

const faqs = [
  ['Meu cliente precisa baixar algum aplicativo?', 'Não. Ele agenda por um link simples, direto do celular, sem instalar nada.'],
  ['Consigo usar no celular e no computador?', 'Sim. A plataforma funciona em celular, tablet, notebook e computador.'],
  ['Posso cadastrar mais de um barbeiro?', 'Sim. Adicione toda a equipe e configure horários, serviços e comissões.'],
  ['É difícil configurar a agenda?', 'Não. Em poucos minutos você cadastra equipe, serviços, valores e horários.'],
]

export function LandingPage({ navigate }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState(0)
  const ownerSignupPath = '/partner/create'

  const goToSignup = () => navigate(ownerSignupPath)

  return (
    <div className="landing-page barber-marketing-page">
      <section className="marketing-hero" id="inicio">
        <div className="marketing-grid-bg" />
        <div className="marketing-wrap marketing-hero-grid">
          <div className="marketing-hero-copy">
            <span className="marketing-tag">Gestão simples. Barbearia cheia.</span>
            <h1>
              Mais organização.
              <br />
              <em>Mais clientes.</em>
              <br />
              Mais crescimento.
            </h1>
            <p>
              O sistema completo para gerenciar sua barbearia, automatizar agendamentos e oferecer uma experiência melhor para seus clientes.
            </p>
            <div className="marketing-actions">
              <button className="marketing-button yellow" onClick={goToSignup}>Testar grátis por 7 dias</button>
              <button className="marketing-link-button" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver como funciona
              </button>
            </div>
            <small>Sem cartão de crédito. Cancele quando quiser.</small>
          </div>

          <div className="marketing-mockup" aria-label="Prévia visual do painel BarberFlow">
            <div className="marketing-sun" />
            <div className="marketing-desktop">
              <aside>
                <ScissorsIcon />
                <CalendarIcon />
                <StoreIcon />
                <UsersIcon />
                <ClockIcon />
              </aside>
              <section>
                <div className="marketing-dashboard-head">
                  <span>
                    <small>Bom dia,</small>
                    <b>Lucas</b>
                  </span>
                  <i>LB</i>
                </div>
                <div className="marketing-stats">
                  <div>
                    <small>Hoje</small>
                    <strong>12</strong>
                    <span>agendamentos</span>
                  </div>
                  <div>
                    <small>Faturamento</small>
                    <strong>R$ 840</strong>
                    <span>18% este mês</span>
                  </div>
                </div>
                <b className="marketing-agenda-title">Agenda de hoje</b>
                {[
                  ['09:00', 'R', 'Rafael Martins', 'Corte + Barba'],
                  ['10:30', 'G', 'Gabriel Silva', 'Corte degradê'],
                  ['12:00', 'M', 'Matheus Alves', 'Barba completa'],
                ].map(([time, initial, name, service]) => (
                  <div className="marketing-appointment" key={time}>
                    <time>{time}</time>
                    <i>{initial}</i>
                    <span>
                      <b>{name}</b>
                      <small>{service}</small>
                    </span>
                    <em>Confirmado</em>
                  </div>
                ))}
              </section>
            </div>
            <div className="marketing-phone">
              <span className="marketing-notch" />
              <small>BarberFlow</small>
              <ScissorsIcon />
              <b>Barbearia do Lucas</b>
              <small>Escolha um serviço</small>
              {[
                ['Corte masculino', '45 min', 'R$ 40'],
                ['Corte + Barba', '1h 15min', 'R$ 65'],
              ].map(([name, duration, price]) => (
                <div className="marketing-service" key={name}>
                  <ScissorsIcon />
                  <span>
                    <b>{name}</b>
                    <small>{duration}</small>
                  </span>
                  <strong>{price}</strong>
                </div>
              ))}
              <button>Continuar</button>
            </div>
            <div className="marketing-toast">
              <i />
              <span>
                <b>Novo agendamento</b>
                <small>Rafael, hoje às 09:00</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section soft" id="funcionalidades">
        <div className="marketing-wrap">
          <div className="marketing-title">
            <span className="marketing-tag dark">Tudo que você precisa</span>
            <h2>
              Sua barbearia no controle.
              <br />
              <em>Seu tempo de volta.</em>
            </h2>
            <p>Menos tempo organizando planilhas e respondendo mensagens. Mais tempo atendendo e fazendo seu negócio crescer.</p>
          </div>
          <div className="marketing-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article className={feature.featured ? 'featured' : ''} key={feature.title}>
                  <Icon />
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>Saiba mais</button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="marketing-section how" id="como-funciona">
        <div className="marketing-wrap marketing-how-grid">
          <div>
            <span className="marketing-tag">Simples de verdade</span>
            <h2>Comece em poucos minutos.</h2>
            <p>Sem complicação e sem precisar entender de tecnologia.</p>
            {[
              ['01', 'Cadastre sua barbearia', 'Adicione equipe, serviços, valores e horários.'],
              ['02', 'Compartilhe seu link', 'Coloque no Instagram e WhatsApp.'],
              ['03', 'Receba agendamentos', 'Seus clientes escolhem o melhor horário.'],
            ].map(([number, title, text]) => (
              <div className="marketing-step" key={number}>
                <b>{number}</b>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </div>
            ))}
            <button className="marketing-button yellow" onClick={goToSignup}>Começar agora</button>
          </div>

          <div className="marketing-calendar">
            <header>
              <span>
                <small>Agenda</small>
                <b>Agosto 2026</b>
              </span>
              <button>Novo horário</button>
            </header>
            <div className="marketing-days">
              {['Seg 10', 'Ter 11', 'Qua 12', 'Qui 13', 'Sex 14'].map((day) => {
                const [label, date] = day.split(' ')
                return (
                  <span className={date === '12' ? 'today' : ''} key={day}>
                    {label}
                    <b>{date}</b>
                  </span>
                )
              })}
            </div>
            <div className="marketing-calendar-body">
              {['08:00', '09:00', '10:00', '11:00', '12:00'].map((time) => <time key={time}>{time}</time>)}
              <i className="book one"><b>Corte</b><small>Rafael M.</small></i>
              <i className="book two"><b>Barba</b><small>Marcos A.</small></i>
              <i className="book three"><b>Corte + Barba</b><small>Gabriel S.</small></i>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="planos">
        <div className="marketing-wrap">
          <div className="marketing-title">
            <span className="marketing-tag dark">Planos sem complicação</span>
            <h2>
              Escolha o plano ideal
              <br />
              para sua <em>barbearia.</em>
            </h2>
            <p>Teste grátis por 7 dias. Sem cartão de crédito e sem fidelidade.</p>
          </div>
          <div className="marketing-plan-grid">
            {plans.map((plan) => (
              <article className={plan.popular ? 'popular' : ''} key={plan.name}>
                {plan.popular ? <label>Mais escolhido</label> : null}
                <span>{plan.name}</span>
                <h3>{plan.audience}</h3>
                <div className="marketing-price">
                  {plan.customPrice ? (
                    <b className="custom">{plan.price}</b>
                  ) : (
                    <>
                      <small>R$</small>
                      <b>{plan.price}</b>
                      <sup>{plan.cents}</sup>
                      <em>/mês</em>
                    </>
                  )}
                </div>
                <ul>
                  {plan.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <button className={'marketing-button ' + (plan.popular ? 'yellow' : 'outline')} onClick={goToSignup}>
                  Começar teste grátis
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section soft" id="duvidas">
        <div className="marketing-wrap marketing-faq-grid">
          <div>
            <span className="marketing-tag dark">Dúvidas frequentes</span>
            <h2>
              Ainda ficou
              <br />
              alguma <em>dúvida?</em>
            </h2>
            <p>Se não encontrar o que procura, fale com a nossa equipe.</p>
          </div>
          <div className="marketing-accordion">
            {faqs.map(([question, answer], index) => (
              <article className={openFaq === index ? 'open' : ''} key={question}>
                <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  <b>{question}</b>
                  <span>{openFaq === index ? '−' : '+'}</span>
                </button>
                <div><p>{answer}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-final" id="contato">
        <div className="marketing-grid-bg" />
        <div className="marketing-wrap">
          <ScissorsIcon />
          <h2>
            Pronto para transformar
            <br />
            a sua barbearia?
          </h2>
          <p>Comece hoje. Seus primeiros 7 dias são por nossa conta.</p>
          <button className="marketing-button yellow" onClick={goToSignup}>Começar meu teste grátis</button>
          <small>Sem cartão de crédito. Cancele quando quiser.</small>
        </div>
      </section>
    </div>
  )
}
