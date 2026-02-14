from openai import OpenAI
import sys
import os
import base64
import mimetypes
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

# Função auxiliar para converter a imagem local em Base64
def codificar_imagem(caminho_imagem):
    try:
        with open(caminho_imagem, "rb") as arquivo_imagem:
            return base64.b64encode(arquivo_imagem.read()).decode('utf-8')
    except FileNotFoundError:
        print(f"\nErro: A imagem '{caminho_imagem}' não foi encontrada. Verifique o caminho ou o nome do arquivo.")
        return None
    except Exception as e:
        print(f"\nErro ao ler a imagem: {e}")
        return None

def identificar_refeicao():
    print("\n--- Analisador de Refeições com IA ---")
    print("Digite 'sair' a qualquer momento para encerrar.\n")

    while True:
        # Pega o caminho da imagem através do input do usuário
        caminho_imagem = input("Digite o caminho/nome da imagem (ex: pizza.jpg): ").strip()

        if caminho_imagem.lower() in ["sair", "exit", "quit"]:
            print("Encerrando o programa. Até mais!")
            break

        # Tenta codificar a imagem
        imagem_base64 = codificar_imagem(caminho_imagem)
        
        # Se a imagem for inválida, pula para a próxima iteração do loop
        if not imagem_base64:
            continue 

        print("Analisando a imagem... aguarde.")

        # Determina o tipo MIME da imagem
        mime_type, _ = mimetypes.guess_type(caminho_imagem)
        if not mime_type:
            mime_type = "image/jpeg" # Default fallback

        try:
            # Chama a API com o prompt e a imagem
            response = client.chat.completions.create(
                model="gpt-4o", # Modelo multimodal da OpenAI com suporte a visão
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text", 
                                "text": "Descreva o prato nesta imagem de forma detalhada, listando os componentes visíveis (ex: arroz, feijão, carne, salada). Se parecer um prato típico, diga o nome. Se a imagem não contiver uma refeição ou comida, responda APENAS com a frase: 'Não é uma refeição'."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    # Formato padrão exigido pela API da OpenAI para Base64
                                    "url": f"data:{mime_type};base64,{imagem_base64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=300, # Aumentado para permitir descrições mais completas
                temperature=0.5 # Ajustado para permitir uma descrição mais natural
            )

            # Extrai e exibe a resposta
            resultado = response.choices[0].message.content
            print(f"\nIA: {resultado}\n")

        except Exception as e:
            print(f"\nErro ao conectar com a API: {e}\n")

if __name__ == "__main__":
    identificar_refeicao()