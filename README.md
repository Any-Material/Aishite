# About


[comment]: [![Discord](https://discordapp.com/api/guilds/954812774956036097/widget.png?style=shield)](https://discord.gg/U8SRTpnwvg)
[![Downloads](https://img.shields.io/github/downloads/Any-Material/Aishite/total.svg)](https://github.com/Any-Material/Aishite/releases)


`Aishite` is a fully secure, and light-weight desktop application for [hitomi.la](https://hitomi.la),<br>
capable of browse, search, view, and download galleries,<br>
is written in [TypeScript](https://github.com/microsoft/TypeScript) and powered by [Electron](https://github.com/electron).<br>

# FAQ

## Q. **App** is not showing anything!

If you ever encounter this issue, it means something is blocking your `http?s-request` to the server.<br>
Thankfully, recent change to our code allows debugging much easier.<br>
Thus please file an issue with debugger logs attached to.<br>
In addition, if you live in `South Korea`, chances are high that it's due to<br>
`South Korea` government's censorship against pornography.<br>
In order to bypass such, you have couple options.<br>

### 1. **VPN**

A `VPN` is a third-party service that instead makes request for you and send you back.<br>
It's definitely slow but safe, undetectable, but performance is very provider dependent.<br>

### 2. **DPI** (Deep Packet Inspection) **Bypasser**

A `DPI` bypasser splits packet to hid destination IP adress.<br>
It doesn't cost much request speed, very undetectable, but performance varies per software.<br>

## Q. Will there be **web version** given its powered by Electron?

Possibly, but nothing is confirmed.<br>
As such, there are some technical difficulties due to **Browser**s' inheirt restrictions.<br>
Though, its possible to avoid most of it, via backend and more.<br>
But it will require me to host a server which equals monthly fees.<br>
Throughout years I developed everyone was just lurking...<br>
why would I spend my money then?<br>

# Installation

```bash
git clone https://github.com/Any-Material/Aishite.git
cd Aishite
npm install
npm run serve
```

# Instruction

## Search

Do note **parser** supports parentheses.<br>

For **property** comparisons, syntax is as followed.<br>

```md
<identifier> = <literal> or <identifier> != <literal>
```

For **function** calls, syntax is as followed.<br>

```md
<identifier>(<literal>)
```

**Literal** can be any of followed.<br>

```md
<literal> = <number> or <string>
```

Do note only double quotes is allowed.<br>

- **AND**: Only extract matching results between two **collection**s.<br>

- **PLUS**: Always combine **collection**s' elements regardless.<br>

- **MINUS**: Alawys remove **collection**'s elements from another regardless.<br>

- **EQUAL**: and **NOT EQUAL**: Return gallery **collection** accordingly.<br>

Below is a usage example.<br>

```md
language = "english" & type != "manga" or language = "english" & (language = "all" - type = "manga")
```

Do note **NOT EQUAL** is a shorthand for `language = "all" - <identifier> = <literal>`.<br>

If **parser** fails under any circumstances or result **collection** is empty, result of `language = "all"` will return as a **fallback**.<br>

Below is list of available properties.<br>

```md
# string
id
# number
type
group
series
artist
male
female
popular
character
language
```

Below is list of available functions.<br>

```md
# string
title
```

Below is a usage example.<br>

```md
# contains the same elements but order differs
language = "english" + title("just some title string") + id = 69
title("just some title string") + language = "english" + id = 69
```

Do note **id** always contain single element thus using **AND** operator is not recommended.<br>
