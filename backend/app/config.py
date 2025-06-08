# TODO
# Develop a better way to store and modify configuration

## Validation

EMAIL_ADDR_MAX_LEN = 50

## JWT

JWT_ALG = "HS256"
# >256 bit key recommended
#JWT_HS256_SECRET = "secret"
JWT_HS256_SECRET = None # generated randomly on start
