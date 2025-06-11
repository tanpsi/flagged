from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


passwd = OAuth2PasswordBearer("/auth/token")
passwd_form = OAuth2PasswordRequestForm
