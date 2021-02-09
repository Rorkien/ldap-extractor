# LDAP-Extractor

Extracts a full report of LDAP users and their groups to a spreadsheet, for logging or auditing purposes.

# Quickstart

Clone this repo and install the dependencies:

```
git clone https://github.com/Rorkien/ldap-extractor.git
cd ldap-extractor
npm install
```

To run the extractor, just invoke it with node:

```
node index.js
```

# Arguments

The `-s` and `-b` are mandarory. The rest is (mostly) optional.

## `-a, -auth`

Most LDAP servers require you to authenticate (bind) before accessing the data.

This application only supports password authentication. To avoid typing out sensitive data directly on the command line, this argument accepts a filename that should contain a user DN (with at least read permissions to the directory) and password in separate lines.

Example:

```
DN=John Doe,OU=Domain,OU=com
my-password
```

Attempts to do anonymous binding if unspecified.

## `-b, --base`

This is the base DN that the extractor will query the data about users and groups. For full reports, the base DN should be the domain root OU.

## `-h, --h`

Prints the help, with arguments and examples.

## `-s, --server`

The IP address or hostname of the LDAP server, without the protocol.

## `-p, --port`

Port of the LDAP server. Defaults to 389 if unspecified.

## `-o, --output`

Specifies the file that should contain the report data. Defaults to `Output.xlsx` if unspecified.