# BarberFlow - Brief para Layout Responsivo

Objetivo: redesenhar todas as telas do sistema BarberFlow para ficarem bonitas, consistentes e totalmente responsivas apenas em celular e tablet.

## Identidade visual

- Produto: plataforma de agendamento para barbearias.
- Estilo desejado: minimalista, limpo, moderno e profissional.
- Cores principais: amarelo `#facc15`, branco, preto/cinza escuro e cinzas suaves.
- Interface: cards arredondados, espaçamento confortável, botões grandes no mobile e navegação simples.
- Evitar emojis. Usar ícones lineares.

## Breakpoints

- Mobile pequeno: 320px a 390px.
- Mobile grande: 391px a 767px.
- Tablet: 768px a 1024px.

## Estrutura global

### Área pública

- Header compacto.
- Botões grandes e fáceis de tocar.
- Conteúdo em coluna única.
- No tablet, pode usar duas colunas quando houver espaço.

### Área logada

Perfis:
- Super ADM.
- ADM da barbearia.
- Barbeiro.
- Cliente.

- Transformar sidebar em barra superior ou menu inferior.
- Evitar conteúdo espremido.
- Cards em uma coluna no celular e duas colunas no tablet.

## Telas públicas

### 1. Landing page

Rota: `/`

Conteúdo:
- Logo BarberFlow.
- Menu: Início, Barbearias.
- Botões: Entrar, Criar conta.
- Hero: “Sua Barbearia, Agora Online”.
- Campo de busca.
- Botão buscar.
- CTA: Explorar todas as barbearias.

Mobile:
- Header compacto.
- Hero centralizado.
- Campo de busca em largura total.
- Botões empilhados.

### 2. Lista pública de barbearias

Rota: `/public/barbershops` ou `/barbershops`

Conteúdo:
- Título: Explorar barbearias.
- Busca.
- Cards de barbearia com foto/capa, nome, endereço, quantidade de profissionais, serviços e botão Agendar.

Mobile:
- Cards em uma coluna.
- Imagem no topo.
- Botão Agendar grande.

### 3. Detalhe público da barbearia

Rota: `/public/barbershop/:slug`

Conteúdo:
- Capa da barbearia.
- Logo/foto.
- Nome.
- Endereço.
- Telefone.
- Serviços.
- Profissionais.
- Botão Agendar.

Mobile:
- Capa responsiva.
- Informações empilhadas.
- CTA fixo opcional no rodapé: Agendar.

## Autenticação

### 4. Login

Rota: `/login` ou `/auth/login`

Conteúdo:
- Email.
- Senha.
- Entrar.
- Esqueci minha senha.
- Criar conta.

Mobile:
- Card central.
- Inputs grandes.
- Botão principal largura total.

### 5. Criar conta cliente

Rota: `/register` ou `/auth/register`

Conteúdo:
- Nome.
- Email.
- Telefone.
- Senha.
- Confirmação.
- Botão criar conta.

### 6. Esqueci minha senha

Rota: `/auth/forgot-password`

Conteúdo:
- Email.
- Botão enviar link.
- Mensagem de sucesso/erro.

### 7. Redefinir senha

Rota: `/auth/reset-password`

Conteúdo:
- Nova senha.
- Confirmar senha.
- Botão salvar senha.

### 8. Login profissional/parceiro

Rota: `/auth/professional-login` ou `/partner/login`

Conteúdo:
- Login para ADM da barbearia/barbeiro.

### 9. Cadastro profissional

Rota: `/auth/professional-register`

Conteúdo:
- Dados da barbearia ou profissional.
- Dados de acesso.

### 10. Aceite de convite de barbeiro

Rota: `/auth/barber-invite`

Conteúdo:
- Dados do convite.
- Nome.
- Telefone.
- Senha.
- Botão aceitar convite.

## Cliente

### 11. Meus agendamentos

Rota: `/customer/appointments`

Conteúdo:
- Próximos agendamentos.
- Histórico.
- Card de agendamento com data, horário, barbearia, barbeiro, serviço e status.
- Botão cancelar.

Mobile:
- Tabs grandes.
- Cards em coluna.

### 12. Explorar barbearias do cliente

Rota: `/customer/explore`

Conteúdo:
- Busca.
- Cards de barbearia.
- Botão Agendar.

### 13. Novo agendamento

Rota: `/customer/booking/:barbershopId`

Conteúdo:
- Fluxo em etapas:
  1. Serviço.
  2. Barbeiro.
  3. Data/horário.
  4. Confirmar.
- Lista de horários disponíveis.
- Botões Voltar e Próximo.

Mobile:
- Stepper compacto.
- Datas em carrossel horizontal.
- Serviços em cards.
- Botão próximo fixo no rodapé.

### 14. Perfil do cliente

Rota: `/customer/profile`

Conteúdo:
- Nome.
- Email.
- Telefone.
- Dados pessoais.
- Salvar alterações.

### 15. Detalhe do agendamento

Rota: `/booking-detail/:id`

Conteúdo:
- Resumo da barbearia.
- Serviço.
- Barbeiro.
- Status.
- Reagendar.
- Serviços realizados.
- Pagamento.
- Concluir ou cancelar.

Mobile:
- Cards empilhados.
- Ações grandes.

## ADM da barbearia

### 16. Dashboard da barbearia

Rota: `/admin/barbershop-dashboard`

Conteúdo:
- Nome da barbearia.
- Data atual.
- Cards: agendamentos hoje, receita hoje, barbeiros ativos, serviços cadastrados.
- Agenda da semana.
- Clientes ativos.

Mobile:
- Cards em uma coluna.
- Agenda da semana com itens compactos.
- Clientes ativos em lista.

### 17. Agenda semanal

Rota: `/admin/appointments`

Conteúdo:
- Semana atual.
- Botões semana anterior/próxima/hoje.
- Cards por dia.
- Agendamentos por dia.
- Botão abrir detalhe.

Mobile:
- Dias em carrossel.
- Lista por dia selecionado.

### 18. Cadastro rápido de cliente/agendamento

Rota: `/admin/quick-booking`

Conteúdo:
- Nome obrigatório.
- Telefone obrigatório.
- Email opcional.
- Serviço.
- Barbeiro.
- Data.
- Horário.
- Criar agendamento.

Mobile:
- Formulário em uma coluna.
- Botão fixo no final.

### 19. Gerenciar barbeiros

Rota: `/admin/barber-management`

Conteúdo:
- Lista de barbeiros.
- Nome.
- Status.
- Serviços.
- Telefone.
- Email.
- Atendimentos de hoje.
- Botões: Agenda, Histórico, Serviços, Excluir.
- Botão Novo barbeiro.

Mobile:
- Card por barbeiro.
- Ações em grid 2x2.

### 20. Agenda de barbeiro

Rota: `/admin/barbers/:barberId/day`

Conteúdo:
- Nome do barbeiro.
- Input de data.
- Calendário em card separado no tablet e recolhível/empilhado no celular.
- Tabela/lista de atendimentos do dia.
- Total do dia.
- Status dos atendimentos.

Mobile:
- Calendário recolhível.
- Atendimentos em cards.

### 21. Histórico de barbeiro

Rota: `/admin/barbers/:barberId/history`

Conteúdo:
- Cards de métricas.
- Busca.
- Filtros: todos, concluído, cancelado, agendado.
- Lista/tabela com data, cliente, serviço, valor, status e avaliação.

Mobile:
- Filtros em chips horizontais.
- Registros em cards.

### 22. Convites de barbeiros

Rota: `/admin/barber-invites`

Conteúdo:
- Criar convite.
- Email/telefone do barbeiro.
- Link gerado.
- Status do convite.

### 23. Serviços e preços

Rota: `/admin/service-management`

Conteúdo:
- Formulário novo serviço.
- Nome.
- Preço.
- Duração.
- Lista de serviços.
- Editar.
- Excluir.
- Status.

Mobile:
- Formulário em card.
- Lista em cards.

### 24. Configurações da unidade

Rota: `/admin/settings`

Conteúdo:
- Upload logo.
- Upload capa.
- Nome.
- Endereço.
- Telefone.
- CNPJ.
- Plano.
- Status.
- Salvar alterações.
- Remover logo/capa.

Mobile:
- Uploads em cards empilhados.
- Campos em uma coluna.

## Barbeiro

### 25. Agenda do barbeiro

Rota: `/professional/agenda`

Conteúdo:
- Atendimentos do dia/semana.
- Cliente.
- Serviço.
- Horário.
- Status.
- Abrir detalhe.

Mobile:
- Lista por dia.
- Botões de semana anterior/próxima.

### 26. Cadastro rápido pelo barbeiro

Rota: `/professional/quick-booking`

Conteúdo:
- Mesmo fluxo do cadastro rápido do ADM.
- Cliente.
- Serviço.
- Data.
- Horário.

### 27. Histórico do barbeiro

Rota: `/professional/history`

Conteúdo:
- Serviços concluídos.
- Cancelados.
- Receita.
- Lista de atendimentos.

### 28. Disponibilidade

Rota: `/professional/availability-new`

Conteúdo:
- Dias da semana.
- Horários disponíveis.
- Pausas/bloqueios.
- Salvar disponibilidade.

### 29. Perfil profissional

Rota: `/professional/profile`

Conteúdo:
- Foto.
- Nome.
- Bio.
- Especialidades.
- Avaliação.
- Salvar perfil.

## Super ADM

### 30. Dashboard Super ADM

Rota: `/admin/super-admin`

Conteúdo:
- Receita total.
- Barbearias ativas.
- Usuários.
- Agendamentos.
- Receita mensal.
- Barbearias recentes.

Mobile:
- Métricas em cards.
- Tabelas viram cards.

### 31. Barbearias

Rota: `/admin/super/barbershops`

Conteúdo:
- Lista de barbearias.
- Plano.
- Status.
- Slug.
- Cadastro.
- Ações.

### 32. Cadastros

Rota: `/admin/super/registrations`

Conteúdo:
- Solicitações de cadastro.
- Aprovar.
- Reprovar.
- Ver dados.

### 33. Planos

Rota: `/admin/super/plans`

Conteúdo:
- Planos FREE/BASIC/PRO.
- Quantidade por plano.
- Lista de assinaturas.
- Trocar plano.
- Ativar barbearia.

### 34. Usuários

Rota: `/admin/super/users`

Conteúdo:
- Lista de usuários.
- Busca.
- Papel/perfil.
- Status.
- Ações administrativas.

## Componentes que precisam de variação responsiva

- Header público.
- Sidebar logada.
- Cards de métricas.
- Cards de barbearia.
- Cards de barbeiro.
- Lista de agendamentos.
- Calendário.
- Tabelas.
- Formulários.
- Upload de imagens.
- Toasts.
- Modais/confirm ações.
- Tabs e filtros.
- Botões fixos no mobile.

## Regras de usabilidade mobile

- Botões com altura mínima de 44px.
- Inputs com altura mínima de 44px.
- Nada de tabelas largas no celular.
- Evitar textos pequenos demais.
- Ações perigosas em vermelho.
- Ações principais em amarelo.
- Conteúdo principal em uma coluna.
- Sidebar vira menu horizontal, drawer ou bottom navigation.
- Toasts não podem cobrir botões importantes.
- Calendários devem ser tocáveis e legíveis.

## Entrega esperada no Figma

Criar telas responsivas para:

- Mobile: 390x844.
- Tablet: 768x1024.

Para cada tela principal, criar:

- versão mobile;
- versão tablet;
- componentes reutilizáveis;
- estados vazio, carregando, erro e sucesso.

## Prompt para enviar ao Figma

Crie um redesign responsivo do sistema BarberFlow usando este brief. O produto é uma plataforma de agendamento para barbearias, com quatro perfis: Super ADM, ADM da barbearia, Barbeiro e Cliente.

Use uma estética minimalista, limpa, moderna, com amarelo `#facc15` como cor principal, branco como fundo principal e cinzas suaves para textos secundários. Evite emojis e use ícones lineares.

Crie layouts apenas para mobile `390x844` e tablet `768x1024`. Priorize usabilidade mobile: botões grandes, cards empilhados, navegação simplificada, formulários em uma coluna e tabelas convertidas em cards. No tablet, use melhor o espaço com duas colunas quando fizer sentido, mas sem criar uma terceira versão.

As telas obrigatórias estão listadas neste documento. Cada tela deve ter estados de carregamento, vazio, erro e sucesso quando fizer sentido.
