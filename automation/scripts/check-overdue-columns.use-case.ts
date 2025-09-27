import { ProjectsService } from "@/services/projects.service"
import { CheckOverduePayrollsUseCase } from "@/use-cases/financial-services/check-overdue-payrolls/check-overdue-payrolls.use-case"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { OverdueRule } from "@/entities/overdue-rule"
import { NodemailerEmailService } from "@/services/email-service/implementations/nodemailer-email-service"
import { HandlebarsHtmlCompiler } from "@/services/email-service/implementations/handlebars-html-compiler"
import { SendCheckOverdueEmailUseCase } from "@/use-cases/financial-services/send-email-check-overdue-columns/send-email-check-overdue-columns.use-case"

const overdueRules: OverdueRule[] = [
  {
    currentStatuses: ["⏳ Folhas em Preparação"],
    dueDateField: "Data limite para empenho",
    fallbackDateCheck: () => dayjs().date() > 24,
    targetStatus: "Em Atraso de Empenho",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
  {
    currentStatuses: ["🔒 Empenhada"],
    dueDateField: "Data limite para liquidação",
    fallbackDateCheck: () => dayjs().date() > 28,
    targetStatus: "Em Atraso de Liquidação",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
  {
    currentStatuses: ["🧾 Liquidada"],
    dueDateField: "Data limite de PD",
    fallbackDateCheck: () => dayjs().date() > 2,
    targetStatus: "Em Atraso de PD",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
  {
    currentStatuses: ["🗓️ Em PD"],
    dueDateField: "Data limite para OB",
    fallbackDateCheck: () => dayjs().date() > 11,
    targetStatus: "Em Atraso de OB",
    notify: {
      to: ["ejsilva159@gmail.com", "ejs15@discente.ifpe.edu.br"],
    },
  },
]

dayjs.extend(utc)
dayjs.extend(timezone)

// Define o fuso fixo, ex: Brasília
const TIMEZONE = "America/Sao_Paulo"

async function main() {
  const projectsService = new ProjectsService()

  const sendEmailUseCase = new SendCheckOverdueEmailUseCase(
    new NodemailerEmailService(),
    new HandlebarsHtmlCompiler()
  )

  const checkOverduePayrollsUseCase = new CheckOverduePayrollsUseCase(
    projectsService,
    overdueRules,
    TIMEZONE,
    sendEmailUseCase
  )

  await checkOverduePayrollsUseCase.execute()
}

main().catch((e) => {
  console.error("Erro ao executar o script:", e)
})
