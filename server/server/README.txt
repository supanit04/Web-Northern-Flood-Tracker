python -m venv venv

Set-ExecutionPolicy RemoteSigned -Scope Process

pip install fastapi "uvicorn[standard]" pandas xgboost sqlmodel scikit-learn


#RUN server
uvicorn main:app --reload