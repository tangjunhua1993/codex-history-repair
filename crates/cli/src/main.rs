use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use codex_history_repair_core::{
    default_cc_switch_dir, import_cc_switch_provider, parse_provider_import_draft,
    repair_codex_history, resolve_default_codex_dir, restart_codex, ProviderImportOptions,
    RepairOptions,
};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Parser)]
#[command(name = "codex-history-repair")]
#[command(about = "Repair local Codex history visibility after provider switching")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Repair(RepairArgs),
    ImportProvider(ImportProviderArgs),
}

#[derive(Debug, Parser)]
struct RepairArgs {
    #[arg(long)]
    codex_dir: Option<PathBuf>,
    #[arg(long)]
    target_provider: Option<String>,
    #[arg(long)]
    dry_run: bool,
    #[arg(long)]
    restart: bool,
    #[arg(long)]
    json: bool,
}

#[derive(Debug, Parser)]
struct ImportProviderArgs {
    #[arg(long)]
    cc_switch_dir: Option<PathBuf>,
    #[arg(long)]
    from_json: Option<PathBuf>,
    #[arg(long)]
    provider_id: Option<String>,
    #[arg(long)]
    provider_name: Option<String>,
    #[arg(long)]
    api_format: Option<String>,
    #[arg(long)]
    model: Option<String>,
    #[arg(long)]
    preview: bool,
    #[arg(long)]
    json: bool,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command.unwrap_or_else(|| {
        Commands::Repair(RepairArgs {
            codex_dir: None,
            target_provider: None,
            dry_run: false,
            restart: false,
            json: false,
        })
    }) {
        Commands::Repair(args) => run_repair(args),
        Commands::ImportProvider(args) => run_import_provider(args),
    }
}

fn run_repair(args: RepairArgs) -> Result<()> {
    let outcome = repair_codex_history(RepairOptions {
        codex_dir: args.codex_dir.unwrap_or_else(resolve_default_codex_dir),
        target_provider_id: args.target_provider,
        dry_run: args.dry_run,
    })?;

    if args.json {
        println!("{}", serde_json::to_string_pretty(&outcome)?);
    } else {
        print_human_summary(&outcome);
    }

    if args.restart && !args.dry_run {
        let restart = restart_codex().context("failed to restart Codex")?;
        if !args.json {
            println!("{}", restart.message);
        }
    }

    Ok(())
}

fn run_import_provider(args: ImportProviderArgs) -> Result<()> {
    let json_text = args
        .from_json
        .as_ref()
        .map(fs::read_to_string)
        .transpose()
        .with_context(|| {
            format!(
                "failed to read {}",
                args.from_json
                    .as_ref()
                    .map(|path| path.display().to_string())
                    .unwrap_or_default()
            )
        })?;
    let options = ProviderImportOptions {
        cc_switch_dir: args.cc_switch_dir.unwrap_or_else(default_cc_switch_dir),
        provider_id: args.provider_id,
        provider_name: args.provider_name,
        base_url: None,
        api_key: None,
        api_format: args.api_format,
        model: args.model,
        json_text,
    };

    if args.preview {
        let draft = parse_provider_import_draft(&options)?;
        if args.json {
            println!("{}", serde_json::to_string_pretty(&draft)?);
        } else {
            println!("Provider id: {}", draft.provider_id);
            println!("Provider name: {}", draft.provider_name);
            println!("Import kind: {}", draft.import_kind);
            if let Some(base_url) = draft.base_url {
                println!("Base URL: {base_url}");
            }
            if let Some(account_id) = draft.oauth_account_id {
                println!("OpenAI account: {account_id}");
            }
            println!("API format: {}", draft.api_format);
            println!("Model: {}", draft.model);
            println!("Preview only. cc-switch was not changed.");
        }
        return Ok(());
    }

    let outcome = import_cc_switch_provider(options)?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&outcome)?);
    } else {
        println!("{}", outcome.message);
        println!("Provider id: {}", outcome.provider_id);
        println!("Provider name: {}", outcome.provider_name);
        println!("Import kind: {}", outcome.import_kind);
        if let Some(base_url) = outcome.base_url {
            println!("Base URL: {base_url}");
        }
        if let Some(account_id) = outcome.oauth_account_id {
            println!("OpenAI account: {account_id}");
        }
        println!("API format: {}", outcome.api_format);
        if let Some(path) = outcome.backup_path {
            println!("Backup: {}", path.display());
        }
    }

    Ok(())
}

fn print_human_summary(outcome: &codex_history_repair_core::RepairOutcome) {
    println!("Codex directory: {}", outcome.codex_dir.display());
    println!("Target provider: {}", outcome.target_provider_id);
    println!("Target source: {}", outcome.target_provider_source);
    println!(
        "Changed: {} JSONL files ({} session_meta lines), {} SQLite rows, {} index entries",
        outcome.migrated_jsonl_files,
        outcome.migrated_jsonl_lines,
        outcome.migrated_state_rows,
        outcome.rebuilt_session_index_entries
    );
    println!("Scanned JSONL files: {}", outcome.scanned_jsonl_files);

    if outcome.source_provider_ids.is_empty() {
        println!("Source providers: none");
    } else {
        println!(
            "Source providers: {}",
            outcome.source_provider_ids.join(", ")
        );
    }

    if let Some(backup_root) = &outcome.backup_root {
        println!("Backup: {}", backup_root.display());
    }

    if outcome.dry_run {
        println!("Dry run only. No files were changed.");
    }

    if let Some(reason) = &outcome.skipped_reason {
        println!("Result: {reason}");
    }
}
