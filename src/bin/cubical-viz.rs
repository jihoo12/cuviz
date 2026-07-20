use std::env;
use std::fs;
use std::process;

use cubical::cubical::env::{Env, apply_globals, global_ctx};
use cubical::cubical::json::{export_ast_json, export_trace_json, JsVal};
use cubical::cubical::nbe::{Globals, Value, Neutral, eval_nbe, nbe_eval_with_globals, start_trace, stop_trace};
use cubical::cubical::parser::{Decl, ProgramParser};
use cubical::cubical::syntax::show_term;
use cubical::cubical::typechecker;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: cubical-viz <file.uwuc> [def-name]");
        eprintln!("  Exports the AST of a cubical term as JSON for visualization.");
        eprintln!("  If def-name is given, exports that definition; otherwise 'main' or last.");
        eprintln!();
        eprintln!("Output goes to stdout. Pipe to a file:");
        eprintln!("  cubical-viz example.uwuc > term.json");
        process::exit(1);
    }

    let path = &args[1];
    let target_name = args.get(2);

    let source = match fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Error reading '{}': {}", path, e);
            process::exit(1);
        }
    };

    let mut env = Env::new();
    let mut parser = match ProgramParser::new(&source) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Parse error: {}", e);
            process::exit(1);
        }
    };

    while let Some(decl) = match parser.next_decl() {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Parse error: {}", e);
            process::exit(1);
        }
    } {
        match decl {
            Decl::Import { path: imp } => {
                eprintln!("Warning: skipping import '{}'", imp);
            }
            Decl::Data(dt) => {
                env.declare_datatype(dt);
            }
            Decl::Def { name, ty, val } => {
                let closed_ty = apply_globals(&env.defs, &ty);
                env.define(name.clone(), closed_ty.clone(), val.clone());
                if let Err(e) = typechecker::check_dt(
                    &env.datatypes,
                    &global_ctx(&env.defs),
                    &val,
                    &closed_ty,
                ) {
                    eprintln!("Type error in '{}': {}", name, e);
                    process::exit(1);
                }
            }
        }
    }

    if env.defs.is_empty() {
        eprintln!("No definitions found in '{}'", path);
        process::exit(1);
    }

    let (name, ty, val) = if let Some(target) = target_name {
        match env.defs.iter().find(|(n, _, _)| n == target) {
            Some(d) => d.clone(),
            None => {
                eprintln!("Definition '{}' not found. Available:", target);
                for (n, _, _) in &env.defs {
                    eprintln!("  {}", n);
                }
                process::exit(1);
            }
        }
    } else {
        if let Some(main_def) = env.defs.iter().find(|(n, _, _)| n == "main") {
            main_def.clone()
        } else {
            env.defs.last().unwrap().clone()
        }
    };

    let n = env.defs.len();
    let placeholder = Value::VNeutral(Neutral::NVar(0));
    let globals: Globals = std::rc::Rc::new(std::cell::RefCell::new(vec![placeholder; n]));
    for idx in (0..n).rev() {
        let (_, _, v) = &env.defs[idx];
        let v_ev = eval_nbe(&[], &globals, idx, v);
        globals.borrow_mut()[idx] = v_ev;
    }

    let global_names: Vec<String> = env.defs.iter().map(|(n, _, _)| n.clone()).collect();

    let raw_json = export_ast_json(&val);
    start_trace();
    let nf = nbe_eval_with_globals(&val, &globals, 0);
    let trace = stop_trace();
    let nf_json = export_ast_json(&nf);
    let ty_json = export_ast_json(&ty);
    let trace_json = export_trace_json(&trace);

    let output = format!(
        r#"{{
  "definition": "{}",
  "rawText": {},
  "typeText": {},
  "normalizedText": {},
  "trace": {},
  "type": {},
  "raw": {},
  "normalized": {}
}}"#,
        name,
        JsVal::Str(show_term(&global_names, &val)).to_string(),
        JsVal::Str(show_term(&global_names, &ty)).to_string(),
        JsVal::Str(show_term(&global_names, &nf)).to_string(),
        trace_json,
        ty_json, raw_json, nf_json
    );

    println!("{}", output);
}
