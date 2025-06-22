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
ADMIN_USER = "admin"
ADMIN_PASSWORD = "flagged"

## DB

DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWD = "secret"
DB_NAME = "flagged"

## Challenges

CHAL_NAME_MAX_LEN = 64
CHAL_DESC_MAX_LEN = 1024
FLAG_MAX_LEN = 256
# FILE_STORE_DIR = '/var/flagged/'
FILE_STORE_DIR = None  # replaced with a tempdir on start
FILE_PATH_MAX_LEN = 64
FILE_NAME_MAX_LEN = 64
FILE_BUFF_SIZE = 65536

## Teams

TEAM_NAME_MAX_LEN = 64
