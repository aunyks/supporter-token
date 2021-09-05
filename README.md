# Supporter Token

Your personal token. Supporter token lets you keep a record
of who your supporters are.

## Features

- Mint as many NFTs as you like, from one contract.
- Can be wrapped into ERC-20 tokens for use in DeFi or other applications.
- `isSupporter()`: A function that you can call to determine whether some address is supporting you (ie owns one of your tokens).
- `aggregateBalanceOf()`: A function that provides the _aggregate_ amount of tokens some account has. The more tokens they have, the more of a supporter they are!

## What is it, really?

A Supporter Token is a contract that extends the ERC-1155 standard to be more creator-friendly. It tracks your supporters and can easily be wrapped into ERC-721 or ERC-20 tokens. You can also transfer ownership to another account or completely relinquish ownership as you please.

### LICENSE

Supporter Token
Copyright (C) 2021 Gerald Nash

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
