export function dataToAOA(data) {
  const headers = ['CN', 'sAMAccountName', 'DN', 'Flags', 'Created When', 'Last Updated When', 'Last Logon When', 'Groups'];

  return [
    headers,
    ...data.sort((d1, d2) => d1.cn.localeCompare(d2.cn)).map(entry => [
      entry.cn,
      entry.sAMAccountName,
      entry.dn,
      entry.userAccountFlags.join(', '),
      entry.createdWhen,
      entry.lastUpdatedWhen,
      entry.lastLogon,
      entry.groups.sort((g1, g2) => g1.cn.localeCompare(g2.cn)).map(group => group.cn).join(', ')
    ])
  ];
}