# TODO
# Develop a better way to store and modify configuration

## Validation

USERNAME_MAX_LEN = 25
EMAIL_ADDR_MAX_LEN = 50
PASSWORD_MAX_LEN = 70  # bcrypt only allows 72 bytes
TOKEN_MAX_LEN = 256

## Auth/Security

JWT_ALG = "HS256"
# >256 bit key recommended
# JWT_HS256_SECRET = "secret"
JWT_HS256_SECRET = None  # generated randomly on start
JWT_EXPIRY_TIMEDELTA = 7 * 24 * 60  # in minutes
PASSWD_HASH_SCHEME = "argon2"

## DB

DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWD = "secret"
DB_NAME = "flagged"
