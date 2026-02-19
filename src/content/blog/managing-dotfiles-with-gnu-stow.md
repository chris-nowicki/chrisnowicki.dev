---
date: 2026-02-19
title: 'Managing Your Dotfiles with GNU Stow'
description: 'Why every developer should have a dotfiles repo and how GNU Stow makes managing one effortless.'
category: 'tech'
draft: false
---

I got tired of setting up new machines and spending the first day tweaking terminal settings, reinstalling plugins, and trying to remember that one alias I can't live without. That's what pushed me to start managing my dotfiles with a proper system.

## What Are Dotfiles?

Dotfiles are the hidden configuration files that live in your home directory - things like `.zshrc`, `.gitconfig`, and anything inside `~/.config/`. They're called "dotfiles" because they start with a `.`, which makes them hidden by default on macOS and Linux.

These files define how your tools behave. Your shell aliases, your git settings, your terminal theme, your editor preferences - it's all dotfiles. And if you're not backing them up somewhere, you're one laptop swap away from losing all of it.

## Why You Should Have a Dotfiles Repo

The idea is simple: store all of your configuration files in a single git repository. Once you do, you get:

- **Portability** - Setting up a new machine goes from a full day of tinkering to a single `git clone` and an install script. Everything is right where you left it.
- **Version control** - Ever changed a config and broken something? With git, you can see exactly what changed and roll it back. No more guessing.
- **Consistency** - If you work across multiple machines (personal laptop, work machine, etc.), a dotfiles repo keeps your environment identical everywhere.
- **Shareability** - Other developers can learn from your setup, and you can learn from theirs. Some of my favorite configs came from browsing other people's dotfiles repos.

Once I committed to maintaining a dotfiles repo, setting up a new machine went from something I dreaded to something I could knock out in minutes. But the repo is only half the story - you still need a way to get those files where they need to go.

## The Symlink Problem

Most dotfiles tools work through **symlinks**. The config files live in your repo (say `~/Dotfiles/`), and symlinks in your home directory point back to them. That way you edit files in one place, they're tracked by git, and your tools pick them up from where they expect to find them.

You _could_ manage these symlinks manually, but that gets tedious fast. Every time you add a new config, you'd need to create the right symlink, make sure the target directories exist, and hope you don't accidentally overwrite something.

## GNU Stow

[GNU Stow](https://www.gnu.org/software/stow/) is a symlink manager that was originally built for managing software installations, but it turns out to be perfect for dotfiles. The concept is simple: you organize your dotfiles repo into **packages** (just directories), and each package mirrors the structure of your home directory. When you "stow" a package, Stow creates all the symlinks for you.

### How It Works

Here's what I mean. Say you want to manage your git config. In your dotfiles repo, you'd create a `git` directory with the file inside it:

```
~/Dotfiles/
└── git/
    ├── .gitconfig
    └── .gitconfig-bc
```

When you run `stow git` from inside `~/Dotfiles/`, Stow creates a symlink at `~/.gitconfig` that points to `~/Dotfiles/git/.gitconfig`. That's it. The file lives in your repo, git tracks it, and your system finds it exactly where it expects.

For configs that live inside `~/.config/`, the directory just mirrors that structure:

```
~/Dotfiles/
└── ghostty/
    └── .config/
        └── ghostty/
            └── config
```

Running `stow ghostty` creates the symlink at `~/.config/ghostty/config`. Stow handles the full directory path - you don't need to manually create any intermediate folders.

### Installing Stow

If you're on macOS with Homebrew, it's one command:

```bash
brew install stow
```

### Basic Commands

```bash
stow <directory>       # Create symlinks for a package directory
stow -D <directory>    # Remove symlinks for a package directory
stow -R <directory>    # Re-stow (remove and recreate symlinks)
```

The `-R` flag is handy when you've restructured files inside a directory. It cleans up the old symlinks and creates fresh ones.

## My Setup

I manage seven directories in my dotfiles repo, each one representing a tool or configuration:

```
~/Dotfiles/
├── zsh/          # Shell config, aliases, prompt
├── git/          # Git config with multi-account support
├── ghostty/      # Terminal emulator theme and settings
├── tmux/         # Terminal multiplexer config
├── karabiner/    # Keyboard remapping (Caps Lock → Hyper Key)
├── cspell/       # Spell checker settings
├── streamdeck/   # Stream Deck utility scripts
└── install.sh    # Automated setup script
```

I won't go into the details of each config here - the point is that every tool I rely on daily has its configuration version-controlled and portable. If my laptop dies tomorrow, I clone the repo on a new machine and I'm back to my exact setup.

### The Install Script

Strictly speaking, this is optional. You can just run `stow <directory>` for each package directory and call it a day. But my repo has directories that aren't dotfiles - like Stream Deck scripts - and I needed a way to skip them. Writing an install script for that is probably overkill. I wrote one anyway.

```bash title="install.sh"
#!/bin/zsh
set -e

DOTFILES_DIR="$HOME/Dotfiles"
EXCLUDE=("streamdeck")

# Ensure stow is installed
if ! command -v stow &>/dev/null; then
  echo "Installing GNU Stow..."
  brew install stow
fi

# Stow each package
for dir in "$DOTFILES_DIR"/*/; do
  package=$(basename "$dir")

  # Skip excluded packages
  for excluded in "${EXCLUDE[@]}"; do
    [[ "$package" == "$excluded" ]] && continue 2
  done

  echo "Stowing $package..."
  stow -d "$DOTFILES_DIR" -t "$HOME" "$package"
done

touch "$HOME/.hushlogin"
echo "Dotfiles installed!"
```

A fresh setup is just:

```bash
git clone git@github.com:chris-nowicki/Dotfiles.git ~/Dotfiles
cd ~/Dotfiles
./install.sh
```

Three commands and every config is exactly where it needs to be.

## Why This Workflow Works

The best part of using Stow is that **edits are instant**. Since the files in your home directory are symlinks pointing back to your repo, any change you make is immediately reflected. There's no copy step, no sync, no rebuild. You edit the file in your repo, and your tools pick up the change right away.

That also means committing changes is just a normal git workflow. Edit a config, test it, `git add`, `git commit`, done. Your dotfiles are always up to date.

## Getting Started

If you don't have a dotfiles repo yet, here's how I'd approach it:

1. **Start small** - Pick one or two configs that matter most to you (`.zshrc` and `.gitconfig` are great starting points)
2. **Create the repo** - Make a `~/Dotfiles` directory and `git init` it
3. **Move the files** - Move your configs into package directories that mirror the home directory structure
4. **Stow them** - Run `stow <directory>` for each one and verify the symlinks are working
5. **Iterate** - Add more directories over time as you find configs worth tracking

Don't feel like you need to move everything at once. I built my repo up gradually over time. The important thing is that you start.

## Conclusion

A dotfiles repo paired with GNU Stow makes managing your configs effortless. No manual symlinks, no install scripts that break, just a clean directory structure that Stow knows how to handle.

If you want to check out my full setup, the repo is on [GitHub](https://github.com/chris-nowicki/Dotfiles). Feel free to grab whatever is useful and make it your own.
