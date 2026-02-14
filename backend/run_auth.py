import subprocess
import sys
import threading
import signal
import time

def monitor_stderr(process, stop_event, is_shutting_down):
    """
    Lê o stderr do processo em segundo plano.
    Durante o encerramento (após Ctrl+C), filtra tracebacks ruidosos do asyncio/uvicorn.
    """
    while not stop_event.is_set():
        # Lê uma linha do stderr
        line = process.stderr.readline()
        if not line:
            break
        
        should_print = True
        
        # Se estamos a encerrar, aplicamos filtro para esconder o erro "feio"
        if is_shutting_down.is_set():
            # Padrões que indicam o traceback específico do asyncio/uvicorn no Python 3.12+
            ignore_patterns = [
                "Traceback (most recent call last):",
                "asyncio/runners.py",
                "asyncio/base_events.py",
                "asyncio/events.py",
                "uvicorn/server.py",
                "uvicorn/lifespan/on.py",
                "KeyboardInterrupt",
                "asyncio.exceptions.CancelledError",
                "raise KeyboardInterrupt",
                "return self._loop.run_until_complete(task)"
            ]
            
            # Se a linha contiver qualquer um dos padrões, ignoramos (apenas durante shutdown)
            if any(pattern in line for pattern in ignore_patterns) or \
               (line.strip().startswith("File \"") and "asyncio" in line):
                 should_print = False

        if should_print:
            sys.stderr.write(line)
            sys.stderr.flush()

def main():
    # Comando para iniciar o servidor uvicorn
    # Usamos sys.executable para garantir que o mesmo ambiente Python é usado
    cmd = [
        sys.executable, "-m", "uvicorn", 
        "backend.auth:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ]

    # Iniciamos o processo redirecionando apenas o stderr para podermos filtrá-lo
    # O stdout continua conectado ao terminal normalmente
    process = subprocess.Popen(
        cmd, 
        stdout=sys.stdout, 
        stderr=subprocess.PIPE, 
        text=True,
        bufsize=1  # Line buffering
    )

    stop_event = threading.Event()
    is_shutting_down = threading.Event()

    # Thread dedicada a ler e filtrar o stderr
    stderr_thread = threading.Thread(
        target=monitor_stderr, 
        args=(process, stop_event, is_shutting_down),
        daemon=True
    )
    stderr_thread.start()

    try:
        # Aguarda o processo terminar (bloqueante)
        process.wait()
    except KeyboardInterrupt:
        # Quando o utilizador faz Ctrl+C:
        
        # 1. Avisamos a thread de monitorização para começar a filtrar erros
        is_shutting_down.set()
        
        # 2. Imprimimos uma mensagem limpa
        print("\n[auth] Servidor de autenticação a encerrar...", file=sys.stderr)
        
        # 3. Aguardamos brevemente que o uvicorn (que também recebeu o SIGINT) encerre
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.terminate()
            
    finally:
        stop_event.set()
        if process.stderr:
            process.stderr.close()

if __name__ == "__main__":
    main()
