import ldapjs from 'ldapjs';
import parseUserAccountFlags from './utils/user-account-flags.js';
import xlsx from 'node-xlsx';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import Group from './model/group.js';
import User from './model/user.js';

import * as fs from 'fs/promises';
import * as dateUtils from './utils/date.js';
import * as spreadsheetUtils from './utils/spreadsheet.js';

const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .example('$0 -s 127.0.0.1 -b DC=domain,DC=org -o my-file.xlsx', 'Generates a report of all LDAP users and groups')
  .alias('s', 'server').nargs('s', 1).describe('s', 'IP address/Domain Name of the LDAP server')
  .alias('p', 'port').nargs('p', 1).describe('p', 'Port of the LDAP server')
  .alias('b', 'base').nargs('b', 1).describe('b', 'Base DN to use as the root search path')
  .alias('o', 'output').nargs('o', 1).describe('o', 'Path to the file to save the result spreadsheet to')
  .alias('a', 'auth').nargs('a', 1).describe('a', 'Path to the file containing the credentials to bind to the LDAP server. If unspecified, anonymous binding will be attempted instead')

  .default('p', 389)
  .demandOption(['s', 'b'])

  .version(false)
  .help('h')
  .alias('h', 'help')
  .argv;

const client = ldapjs.createClient({
  url: `ldap://${args.server}:${args.port}`
});
const baseDN = args.base;
const userSearchOptions = {
  filter: '&(objectCategory=person)',
  scope: 'sub',
  attributes: ['dn', 'sAMAccountName', 'cn', 'userAccountControl', 'whenCreated', 'whenChanged', 'lastLogon'],
  paged: true
};
const groupSearchOptions = {
  filter: '&(objectCategory=group)',
  scope: 'sub',
  attributes: ['dn', 'cn', 'member'],
  paged: true
};

var auth;
if (args.auth) {
  const authData = await fs.readFile(`./${args.auth}`, 'utf8');
  if (authData) {
    auth = authData.split('\r').flatMap(split => split.split('\n')).filter(line => line !== '');
    if (auth.length !== 2) console.error('Error: Authentication must consist of a user DN and password in two separate lines');
  }
}

new Promise((resolve, reject) => {
  if (!auth) {
    console.log('Attempting anonymous binding...');
    resolve();
  } else {
    console.log(`Attempting bind with user ${auth[0]}`);
    client.bind(auth[0], auth[1], (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  }
}).then(() => {
  const userPromise = new Promise((resolve, reject) => {
    client.search(baseDN, userSearchOptions, (error, response) => {
      if (error) reject(error);

      let entries = [];
      response.on('searchEntry', entry => entries.push(new User(
        entry.object.sAMAccountName,
        entry.object.cn,
        entry.object.dn,
        parseUserAccountFlags(entry.object.userAccountControl),
        dateUtils.fromLDAPDate(entry.object.whenCreated),
        dateUtils.fromLDAPDate(entry.object.whenChanged),
        dateUtils.fromLDAPTimestamp(entry.object.lastLogon)
      )));

      response.on('error', error => reject(error));
      response.on('end', () => resolve(entries));
    });
  });

  const groupPromise = new Promise((resolve, reject) => {
    client.search(baseDN, groupSearchOptions, (error, response) => {
      if (error) reject(error);

      let entries = [];
      response.on('searchEntry', entry => {
        entries.push(new Group(
          entry.object.cn,
          entry.object.dn,
          entry.object.member,
        ))
      });

      response.on('error', error => reject(error));
      response.on('end', () => resolve(entries));
    });
  });

  Promise.all([userPromise, groupPromise]).then(([users, groups]) => {
    console.log(`${users.length} user entries, ${groups.length} groups`);

    let userMap = {}
    users.forEach(user => userMap[user.dn] = user);

    groups.forEach(group => {
      if (Array.isArray(group.member)) {
        group.member?.forEach(member => userMap[member]?.groups.push(group));
      } else userMap[group.member]?.groups.push(group);
    });

    const sheet = xlsx.build([{ name: 'Users', data: spreadsheetUtils.dataToAOA(users) }]);
    fs.writeFile(args.output ? args.output.split('\.')[0] + '.xlsx' : 'Output.xlsx', sheet, 'utf8');
  }).catch(error => {
    console.error(error);
  }).finally(() => {
    client.unbind(error => {
      if (error) console.error(error);
    });
  });
}).catch(error => {
  console.error(error);
});