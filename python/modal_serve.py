"""Modal deployment of the NHL Draft Pick Equity & Similarity API.

Deploy:
    modal deploy modal_serve.py

The image pins scikit-learn to the exact version recorded in
pipeline.joblib's metadata (see build_pipeline.py) so the artifact
unpickles correctly at boot. serve.py, pipeline_def.py, and
pipeline.joblib are baked into the image; the FastAPI app is imported
inside the Modal function, not at module import time on the client.
"""

import modal

app = modal.App("nhl-draft-similarity-api")

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "fastapi==0.141.1",
        "scikit-learn==1.4.2",
        "pandas==2.2.2",
        "numpy==1.26.4",
        "joblib==1.4.2",
    )
    .add_local_file("pipeline_def.py", "/root/pipeline_def.py")
    .add_local_file("serve.py", "/root/serve.py")
    .add_local_file("pipeline.joblib", "/root/pipeline.joblib")
)


@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    import sys

    sys.path.insert(0, "/root")
    from serve import app as web_app

    return web_app
