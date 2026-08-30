import shlex
import subprocess

import modal

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "streamlit==1.62.0",
        "pandas",
        "matplotlib",
        "supabase",
        "python-dotenv",
    )
    .add_local_file("app.py", remote_path="/root/app.py")
)

app = modal.App("nhl-draft-explorer", image=image)

secret = modal.Secret.from_name("nhldraft-supabase")


@app.function(secrets=[secret], min_containers=1)
@modal.concurrent(max_inputs=100)
@modal.web_server(8000)
def run():
    target = shlex.quote("/root/app.py")
    cmd = (
        f"streamlit run {target} "
        "--server.port 8000 --server.address 0.0.0.0 "
        "--server.headless true --server.enableCORS false"
    )
    subprocess.Popen(cmd, shell=True)
