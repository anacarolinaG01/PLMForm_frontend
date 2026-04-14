import { useForm } from "react-hook-form";
import { useState } from "react";
import "./Formulario.css";

const OPCOES_TEMPO = [
  { label: "Não dedico tempo", value: 0 },
  { label: "30 minutos", value: 0.5 },
  { label: "1 hora", value: 1 },
  { label: "2 horas", value: 2 },
  { label: "4 horas", value: 4 },
  { label: "8 horas", value: 8 },
  { label: "12 horas", value: 12 },
];

const PERGUNTAS = [
  {
    id: 1,
    texto:
      "Quanto tempo por semana você dedica procurando dados em outros sistemas ou em outras fontes de dados (e-mail, planilhas, conversas no teams, etc), para realizar seu processo dentro da ferramenta de PLM ou Matrix?",
  },
  {
    id: 2,
    texto:
      "Considerando que as informações contidas nos sistemas PLM e Matrix devem ser precisas e confiáveis, você tem necessidade de dedicar algum tempo por semana para validar essas informações?",
  },
  {
    id: 3,
    texto:
      "Quanto tempo por semana você dedica criando relatórios ou planilhas, considerando extração manual dos dados ou inclusão dos mesmos em diferentes arquivos/locais?",
  },
  {
    id: 4,
    texto:
      "Quanto tempo por semana você dedica inserindo (ex.: upload de arquivos) ou criando (ex.: código de produto) dados no sistemas PLM ou Matrix? Considerando que o sistema seja ponto único de entrada desses dados.",
  },
  {
    id: 5,
    texto:
      "Quanto tempo por semana você utiliza transferindo dados e informações entre PLM ou Matrix com outros sistemas?",
  },
  {
    id: 6,
    texto:
      "Quanto tempo por semana você dedica gerando atualização de arquivos ou informações, devido a ausência de versionamento no sistema PLM ou Matrix?",
  },
  {
    id: 7,
    texto:
      "Quanto tempo por semana você dedica buscando pelo histórico de alterações (rastreabilidade) realizadas no sistema PLM ou Matrix?",
  },
  {
    id: 8,
    texto:
      "Quanto tempo por semana você dedica contornando a lentidão, interrupções ou limitações nos sistemas PLM e Matrix?",
  },
];

export default function Formulario() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const respostas = watch("respostas");

  const somaTotal = respostas
    ? Object.values(respostas)
        .map(Number)
        .reduce((a, b) => a + b, 0)
    : 0;

  async function onSubmit(data) {
    setErrorMessage("");
    setSuccessMessage("");

    const respostasArray = PERGUNTAS.map((pergunta) => {
      const fieldKey = `pergunta${pergunta.id}`;
      const selectedValue = data.respostas[fieldKey];
      const selectedOpcao = OPCOES_TEMPO.find(
        (opcao) => String(opcao.value) === String(selectedValue),
      );

      return {
        perguntaId: pergunta.id,
        perguntaTexto: pergunta.texto,
        opcaoLabel: selectedOpcao?.label ?? String(selectedValue),
        opcaoValor: selectedOpcao
          ? Number(selectedOpcao.value)
          : Number(selectedValue),
      };
    });

    if (somaTotal > 20) {
      setErrorMessage(
        "A soma das horas informadas ultrapassou 20h. Por favor, revise suas respostas.",
      );
      return;
    }

    setIsLoading(true);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/respostas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // nomeCompleto: data.nomeCompleto,
        emailCorporativo: data.emailCorporativo,
        respostas: respostasArray,
        somaTotal,
        comentarios: data.comentarios,
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          if (errorData.message === "Este e-mail já enviou uma resposta") {
            setErrorMessage("e-mail já registrado");
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }
      }
      const errorText = await response.text().catch(() => response.statusText);
      setErrorMessage(`Erro ao enviar: ${response.status} ${errorText}`);
      setIsLoading(false);
      return;
    }

    setSuccessMessage("Formulário enviado com sucesso!");
    setIsSubmitted(true);
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="formContent">
      <h1>Horas Semanais Dedicadas ao Uso dos Sistemas PLM e MATRIX</h1>

      <p className="paragrafo">
        Estamos realizando esta pesquisa com o objetivo de estimar o tempo
        semanal dedicado ao uso dos sistemas. Para isso, solicitamos que
        responda às questões abaixo.
      </p>
      <p className="pImportant2">
        <strong>Aviso:</strong> A soma total das horas de uso no sistema não
        pode ultrapassar <strong>20 horas semanais</strong>, respeitando a carga
        horária de trabalho. Se suas respostas excederem esse limite, revise as
        opções selecionadas antes de enviar o formulário.
      </p>
      <p className="paragrafo">
        <strong>O preenchimento leva apenas alguns minutos.</strong>
      </p>

      <fieldset>
        <legend>Informações Pessoais</legend>
        <div className="inputBox">
          {/* <div className="inputGroup">
            <label htmlFor="nomeCompleto">Nome completo</label>
            <input
              id="nomeCompleto"
              placeholder="Digite seu nome completo"
              className={errors.nomeCompleto ? "inputError" : ""}
              disabled={isSubmitted}
              {...register("nomeCompleto", {
                required: "Nome completo é obrigatório",
              })}
            />
            {errors.nomeCompleto && (
              <span className="fieldError">{errors.nomeCompleto.message}</span>
            )}
          </div> */}

          <div className="inputGroup">
            <label htmlFor="emailCorporativo">Email corporativo</label>
            <input
              id="emailCorporativo"
              type="email"
              placeholder="seu.email@grendene.com.br"
              className={errors.emailCorporativo ? "inputError" : ""}
              disabled={isSubmitted}
              {...register("emailCorporativo", {
                required: "Email corporativo é obrigatório",
                validate: (v) =>
                  v.endsWith("@grendene.com.br") ||
                  "Email deve terminar com @grendene.com.br",
              })}
            />
            {errors.emailCorporativo && (
              <span className="fieldError">
                {errors.emailCorporativo.message}
              </span>
            )}
          </div>
        </div>

        <p className="pImportant">
          ℹ️ Cada questão aceita apenas uma resposta. Caso não encontre uma
          opção que represente adequadamente sua realidade, escolha aquela que
          mais se aproxima.
        </p>
      </fieldset>

      {PERGUNTAS.map((pergunta) => (
        <fieldset
          key={pergunta.id}
          className={
            errors.respostas?.[`pergunta${pergunta.id}`] ? "fieldsetError" : ""
          }
        >
          <legend className="perguntaContent">
            {pergunta.id} – {pergunta.texto}
          </legend>

          <div className="opcoesContent">
            {OPCOES_TEMPO.map((opcao) => (
              <label key={opcao.label}>
                <input
                  type="radio"
                  value={opcao.value}
                  disabled={isSubmitted}
                  {...register(`respostas.pergunta${pergunta.id}`, {
                    required: `Pergunta ${pergunta.id} é obrigatória`,
                  })}
                />
                {opcao.label}
              </label>
            ))}
          </div>
          {errors.respostas?.[`pergunta${pergunta.id}`] && (
            <div className="questionError">
              {errors.respostas[`pergunta${pergunta.id}`].message}
            </div>
          )}
        </fieldset>
      ))}

      <fieldset>
        <legend>Comentários</legend>
        <textarea
          className="comentarios"
          placeholder="Utilize este espaço para registrar comentários, dúvidas ou observações..."
          {...register("comentarios")}
          disabled={isSubmitted}
          rows="4"
          cols="50"
        />
      </fieldset>

      {/* <p className="somaTotal">
        <strong>Soma total:</strong> {somaTotal}
        </p> */}

      {errorMessage && (
        <div className="errorMessage">
          <strong>Erro:</strong> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="successMessage">
          <strong>Sucesso:</strong> {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitted || isLoading}
        className="btn-submit"
      >
        {isLoading ? (
          <span className="loader-container">
            <i className="spinner"></i> Enviando...
          </span>
        ) : isSubmitted ? (
          "Enviado"
        ) : (
          "Enviar"
        )}
      </button>
    </form>
  );
}
