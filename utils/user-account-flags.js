export const userAccountFlags = {
  SCRIPT: 1,
  ACCOUNTDISABLE: 2,
  HOMEDIR_REQUIRED: 8,
  LOCKOUT: 16,
  PASSWD_NOTREQD: 32,
  PASSWD_CANT_CHANGE: 64,
  ENCRYPTED_TEXT_PWD_ALLOWED: 128,
  TEMP_DUPLICATE_ACCOUNT: 256,
  NORMAL_ACCOUNT: 512,
  INTERDOMAIN_TRUST_ACCOUNT: 2048,
  WORKSTATION_TRUST_ACCOUNT: 4096,
  SERVER_TRUST_ACCOUNT: 8192,
  DONT_EXPIRE_PASSWORD: 65536,
  MNS_LOGON_ACCOUNT: 131072,
  SMARTCARD_REQUIRED: 262144,
  TRUSTED_FOR_DELEGATION: 524288,
  NOT_DELEGATED: 1048576,
  USE_DES_KEY_ONLY: 2097152,
  DONT_REQ_PREAUTH: 4194304,
  PASSWORD_EXPIRED: 8388608,
  TRUSTED_TO_AUTH_FOR_DELEGATION: 16777216,
  PARTIAL_SECRETS_ACCOUNT: 67108864
};

var flagValues = []
for (var flag in userAccountFlags) flagValues.push([flag, userAccountFlags[flag]]);
flagValues.sort((a, b) => b[1] - a[1]);

export default userAccountFlags => {
  let userAccountFlagValue = parseInt(userAccountFlags);
  let flags = [];
  for (var i = 0; i < flagValues.length; i++) {
    if (userAccountFlagValue >= flagValues[i][1]) {
      userAccountFlagValue -= flagValues[i][1];
      flags.push(flagValues[i][0]);
    }
    if (userAccountFlagValue <= 0) break;
  }
  return flags;
};