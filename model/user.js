export default class User {
  constructor(sAMAccountName, cn, dn, userAccountFlags, createdWhen, lastUpdatedWhen, lastLogon) {
    this.sAMAccountName = sAMAccountName;
    this.cn = cn;
    this.dn = dn;
    this.userAccountFlags = userAccountFlags;
    this.createdWhen = createdWhen;
    this.lastUpdatedWhen = lastUpdatedWhen;
    this.lastLogon = lastLogon;
    this.groups = [];
  }
}