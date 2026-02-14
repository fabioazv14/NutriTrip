from openai import OpenAI
import sys
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Obtém a chave da API da variável de ambiente
MINHA_CHAVE = os.getenv("OPENAI_API_KEY")
if not MINHA_CHAVE:
    print("Erro: A variável OPENAI_API_KEY não foi encontrada no arquivo .env")
    sys.exit(1)

# Inicializa o cliente da OpenAI
client = OpenAI(api_key=MINHA_CHAVE)

def conversar_com_chatgpt():
    # Histórico da conversa (lista de mensagens)
    mensagens = []

    print("\nConversa iniciada! Digite 'sair' para encerrar.\n")

    while True:
        # Pega input do usuário
        pergunta = input("Você: ").strip()

        # Verifica se o usuário quer sair
        if pergunta.lower() in ["sair", "exit", "quit"]:
            print("Encerrando conversa. Até mais!")
            break

        # Adiciona a mensagem do usuário ao histórico
        mensagens.append({"role": "user", "content": pergunta})

        try:
            # Chama a API com o histórico completo
            response = client.chat.completions.create(
                model="gpt-5-chat-latest",
                messages=mensagens
            )

            # Extrai a resposta do assistente
            resposta_assistente = response.choices[0].message.content

            # Adiciona a resposta ao histórico
            mensagens.append({"role": "assistant", "content": resposta_assistente})

            # Exibe a resposta
            print(f"\nChatGPT: {resposta_assistente}\n")

        except Exception as e:
            print(f"\nErro ao conectar: {e}")
            # Remove a última mensagem do usuário (que causou o erro) do histórico
            mensagens.pop()
            print("Tente novamente.\n")

if __name__ == "__main__":
    conversar_com_chatgpt()